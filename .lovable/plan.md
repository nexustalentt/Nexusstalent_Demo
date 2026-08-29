# Fix: published exam link fails on the live domain

## What is happening

`www.nexusstalent.com` is served by Vercel (confirmed from the response headers). The published exam link loads, shows "Loading…", then falls back to "Exam unavailable".

The exam is fine in the database — `Quality Assurance Engineer – Aptitude & Technical Assessment` is published with token `55dfa053fbe7f30516`. The problem is the code path: every candidate-side exam operation (link lookup, login, loading questions, saving answers, submitting) uses the private service-role backend key. That key is not available on Vercel (and cannot be exported from Lovable Cloud), so those calls throw and the page shows the generic "Exam unavailable" message. The rest of the site works because it already uses the public key with a fallback.

## The fix: make the exam flow work with the public key only

Move the privileged parts of the candidate exam flow into secure database-side functions (`SECURITY DEFINER`) that the app calls with the public key. The candidate exam then works on any host — Lovable, Vercel, custom domain — with no private key.

1. Exam link lookup returns title/description only for published exams.
2. Candidate login verifies username + password inside the database, checks access enabled / access window / exam published / one-attempt rule, and returns a session token (or the existing in-progress session).
3. Loading the paper returns questions without any answer key, plus saved answers, review flags and remaining time.
4. Saving an answer, marking for review and clearing an answer are scoped to the session token.
5. Submitting grades the attempt server-side and marks it completed; auto-submit at zero keeps working.

Nothing in the candidate UI changes: same sections, navigation grid, colour states, mark-for-review, summary and submit confirmation.

Admin side stays exactly as it is (staff-authenticated, RLS-scoped), except that saving candidate credentials now stores the password in the new database-verifiable format.

## One-time follow-up after the change

The existing candidate `prajwal123` has a password stored in the old format. Its password needs to be re-entered once in the exam's credentials form (there are no exam attempts yet, so nothing is lost). Any new candidate created after the change works immediately.

## Guardrails

- No answer key is ever readable by candidates or the public key.
- Candidate password hashes stay unreadable outside the database functions.
- One attempt per candidate stays enforced by the existing unique constraint.
- Jobs, applications, admin portal, intake API, sitemap and the public site are untouched.

## Technical notes

- Migration adds `password_crypt` (bcrypt via pgcrypto) to `public.exam_candidates` and creates `SECURITY DEFINER` functions with `search_path = public`, `EXECUTE` granted to `anon`/`authenticated` only where needed:
  `exam_public_intro(token)`, `exam_candidate_login(username, password, token default null)`, `exam_attempt_state(session_token)`, `exam_save_answer(session_token, question_id, answer, marked)`, `exam_submit(session_token)`, plus staff-only `exam_set_candidate_password(candidate_id, password)`.
- No new anon table policies; access is only through these functions, and table grants stay as they are.
- `src/lib/exam-attempt.server.ts` keeps its current exported function names and return shapes, but calls the RPCs through `publicClient()` from `src/lib/supabase-public.server.ts` instead of `supabaseAdmin`; `src/lib/exams.functions.ts` and both `/exam` routes stay unchanged.
- Grading (`src/lib/exam-grading.server.ts`) moves into the submit function's SQL so scoring no longer needs the service key; passing percentage and per-question marks logic is preserved.
- `/exam/$token` error copy gets a distinct message for a backend failure versus a genuinely closed/invalid link, so a future misconfiguration is not silently reported as "Exam unavailable".
- Verification: end-to-end Playwright run of link → login → answer → submit against the preview, plus a re-check of the live domain after publishing.
