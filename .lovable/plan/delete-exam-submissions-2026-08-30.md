# Delete exam submissions

Add deletion controls to the exam Submissions page (`/admin/exams/submissions/:examId`).

## What you get

- A **Delete** button in the Actions column of each candidate row, next to "View".
- A confirmation prompt naming the candidate, warning that the attempt, its answers and scores are removed permanently.
- A **Delete all submissions** button in the page header, also behind a confirmation, for clearing the whole attempt list for that exam.
- After deleting, the table refreshes immediately and a toast confirms the removal. Candidate logins/credentials are untouched, so a candidate whose attempt is deleted can take the exam again.
- Deletions are recorded in the audit log, matching how job and exam deletions already work.

## Technical notes

- `src/lib/exams-api.ts`: add `deleteExamAttempt(attempt)` — delete rows in `exam_answers` for the attempt, then the `exam_attempts` row, then `recordAudit("exam_attempt_deleted", ...)`. Add `deleteAllExamAttempts(examId)` that fetches attempt ids for the exam and reuses the same path.
- `src/routes/_authenticated/admin.exams.submissions.$examId.tsx`: wire both via `useMutation` + `queryClient.invalidateQueries({ queryKey: ["admin"] })`, `window.confirm` guard, `sonner` toasts, trash icon styling consistent with the exams list page.
- No schema or RLS change: staff already have full manage policies on `exam_attempts` and `exam_answers`.
