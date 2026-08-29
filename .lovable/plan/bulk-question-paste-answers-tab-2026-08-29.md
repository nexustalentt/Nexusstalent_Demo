# Bulk Question Paste + Answers Tab

Admins paste a whole question bank once; the system parses it into a structured paper, stores the answer key separately, and shows a preview before saving. Existing one-by-one question editor stays untouched.

## 1. Paste question bank (Admin → Exam Creator → exam)

New "Paste question bank" panel above the question list, with a large text area and an "Options are lettered A–D" hint. Supported paste format (flexible on spacing, blank lines, `Q1.` / `Question 1.` / `1.`):

```text
Question 1. What is 25% of 200?
A. 25
B. 40
C. 50
D. 75
Answer: C

Question 2. If a train travels 60 km in 1.5 hours, what distance in 30 minutes?
A. 20 km
B. 30 km
C. 40 km
D. 50 km
Answer: A
```

Also accepted: `Ans: C`, `Correct Answer: C`, `Answer - C`, multi-letter answers (`Answer: A, C` → multiple select), and an answer key block at the end instead of per-question answers:

```text
Answers
1 - C
2 - A
3 - D
```

Marks per question default to 1, with an editable "Marks per question" field applied to the whole paste.

## 2. Preview and validation before saving

Parsing happens in the browser instantly as the admin pastes. The panel shows a preview of the generated paper in exam-paper format (number, question text, lettered options) plus a compact answer-key table.

Blocking errors listed per question number, in plain language:
- missing question number, missing question text
- fewer than two options
- missing correct answer
- answer letter not among the listed options
- duplicate question numbers
- gaps allowed, but original numbering is preserved as the order

Save is disabled until all errors are cleared. Two save modes: "Append to exam" and "Replace all questions" (with confirmation).

## 3. Answers tab

New tab in the exam editor: **Questions | Answers | Candidates**.

The Answers tab shows a read-only table: Question number, question text (truncated), correct answer letter(s), marks — plus a "Copy answer key" button. Answers appear only here; nothing changes on the candidate side.

## 4. Candidate view

Candidates keep the current runner but options are labelled A, B, C, D and questions are numbered in the stored order, matching the pasted paper. No answer key is ever sent to the browser (grading already happens server-side).

## 5. Non-goals

No file upload (paste only), no schema change, and the manual question editor, timer, autosave, one-attempt rule, grading and submissions views all stay exactly as they are.

## Technical notes

- New `src/lib/question-bank-parser.ts`: pure parser returning `{ questions: QuestionDraft[]; errors: { number: number; message: string }[] }`, reusing `QuestionDraft` from `question-editor.tsx` and validating each item with the existing `questionSchema`. Letters map to `correct_options` indices; more than one letter → `multiple_select`, otherwise `multiple_choice`.
- New `src/components/admin/question-bank-import.tsx` for the paste box, error list and paper preview.
- `src/routes/_authenticated/admin.exams.$examId.tsx` gains a tab switcher, the import panel, and an answers table built from the existing `examQuestionsQuery` data; bulk insert via a single `supabase.from("exam_questions").insert([...])` with sequential `position` from `nextPosition`, replace mode deleting existing rows first.
- Candidate-side numbering/lettering is a display change in `src/components/site/exam-runner.tsx` (`optionLabel` in `exam-utils.ts` returns `A`, `B`, …).
