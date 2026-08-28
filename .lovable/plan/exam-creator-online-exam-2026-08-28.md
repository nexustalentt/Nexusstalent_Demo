# Exam Creator & Online Exam

Most of this feature already exists (exam builder, question types, timer, autosave, auto-submit, grading, submissions views). This plan closes the real gaps: a public "Exam" entry with username/password-only login, per-candidate access control, one-attempt enforcement in the database, and the richer admin overview.

## 1. Rename and surface the admin tab

- Admin sidebar item "Exams" becomes "Exam Creator" (same route), and the exams page gets an "Add Exam" button label instead of "Create".
- Exam status wording stays Active (published) / Inactive (draft), matching the current pills.

## 2. Candidate credentials get access controls

Extend the exam candidate records with:
- Access start time (when login becomes possible) and optional access end time
- Per-candidate duration override (falls back to the exam duration)
- Access status (enabled / disabled)
- Globally unique username, so a candidate can log in from the home page without an exam link

The credentials form in the exam builder gains fields for these, plus an assigned-users table showing username, name/email, access window, status, attempt status (Pending / In progress / Completed), submitted date, and score, with enable/disable and delete actions.

## 3. Home page "Exam" option and login page

- Add a visible "Exam" link in the site header (and a small call-to-action on the home page) pointing to a new `/exam` login page.
- The login page asks only for Username and Password, validates server-side against the stored password hash, and resolves the exam automatically from the credential.
- Clear error messages for: wrong credentials, access disabled, exam not active, access window not open yet or already closed, and already completed.

The existing `/exam/$token` link-based entry keeps working.

## 4. Exam taking

Unchanged behaviour, reused as-is: instructions screen, countdown from the candidate's effective duration, MCQ / short answer / long answer inputs, autosave, auto-submit at zero, refresh-safe resume via the stored session.

On submit: answers saved, submitted timestamp recorded, attempt marked completed, and the confirmation reads "Your exam has been submitted successfully. Thank you!"

## 5. One attempt per candidate, enforced in the database

- A unique constraint on (exam, candidate) in the attempts table so no second attempt row can ever be created, even on concurrent requests or refresh.
- Login returns the existing in-progress session when one exists; after completion it returns "You already took an exam. Thank you!" and never opens the exam.

## 6. Admin overview

The Exam Creator list shows: Exam Name, Questions, Duration, Assigned Users, Completed Attempts, Pending Attempts, Status, Created Date, plus links to the assigned-users view and submissions.

## Technical notes

- Migration: add `access_start_at`, `access_end_at`, `duration_minutes` (nullable override), `access_enabled` to `public.exam_candidates`; add a unique index on `lower(username)` there; add a unique index on `exam_attempts (exam_id, candidate_id)`. Grants and staff-only RLS follow the existing pattern; no anon access — all candidate reads go through server functions.
- New public server functions in `src/lib/exams.functions.ts` (`candidateLoginGlobal`) backed by `src/lib/exam-attempt.server.ts`, reusing PBKDF2 verification and session tokens; duration comes from the candidate override when set.
- New route `src/routes/exam.index.tsx` (login) reusing the existing runner component, extracted from `src/routes/exam.$token.tsx` into a shared component so both entry points share one UI.
- Admin data additions in `src/lib/exams-api.ts` (pending counts, candidate attempt join) and UI in the exams list plus exam builder; existing routes and queries stay intact.
