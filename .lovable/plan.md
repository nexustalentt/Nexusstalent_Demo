# Professional Exam Paper UI + Watermark + Anti-Copy

Redesign the exam-taking screen to look like a premium corporate assessment paper. All existing behaviour stays untouched: login, instructions gate, timer/auto-submit, autosave, mark-for-review, camera proctoring, submission.

## What changes visually

**Exam header (sticky)**
- Left: exam title, candidate name (username), current section.
- Right: duration, remaining-time chip (calm styling, turns amber under 5 min, red under 1 min), status "In progress".
- Progress bar showing answered / total.

**Left panel — "Question Paper"**
- Own card with zero-padded numbers (01, 02, 03…) in a grid, grouped by section as today.
- Four states: answered (green), not visited (white/neutral), visited but not answered (outlined/neutral-dark), active (accent ring/filled).
- Legend + counts (total, answered, not answered, marked for review) kept in the same card.
- Clicking a number jumps to that question (existing behaviour).
- On mobile it collapses into the existing show/hide toggle above the question.

**Right panel — question card**
- Clear hierarchy: "Question 01" badge line with type and marks → question text in larger serif-free display size → "Select your answer:" label → options as full-width bordered rows that highlight when selected (radio/checkbox behaviour unchanged) → divider → action row.
- Action row: `Previous | Save & Next | Next`, plus existing Mark for review and Clear answer. "Save & Next" saves the current answer (same autosave call) and advances.
- Submit card below stays, restyled to match.

**Watermark**
- Repeating diagonal tiled text `CONFIDENTIAL • APTITUDE TEST • DO NOT COPY • <username>` behind the question card content, low opacity, `pointer-events-none` + `select-none` + `aria-hidden`, so it never blocks clicks or typing.

**Anti-copy (deterrent only)**
- Question/option text gets `select-none` and copy/cut blocked; context menu blocked inside the exam area.
- Keyboard: block Ctrl/Cmd+C, U, S, P inside the exam area.
- Inputs (short/long answer) explicitly keep selection, typing, paste-out-of-scope behaviour, scrolling, navigation, submit and camera fully functional.

## Technical notes

- Single file for the main work: `src/components/site/exam-runner.tsx` — restructure JSX and Tailwind classes only; no changes to state logic, queries, mutations, or `src/lib/exams.functions.ts`.
- Add small presentational helpers in the same file: watermark overlay component and a `useExamGuards` hook wiring `copy`/`cut`/`contextmenu`/`keydown` listeners on the exam container ref.
- Add a `visited` set in local component state purely to drive the fourth navigation-panel state (does not touch the backend).
- Watermark pattern via an inline repeating CSS gradient/SVG using existing semantic tokens; no new colors hardcoded. If a token is needed it goes in `src/styles.css`.
- `src/components/site/exam-proctoring.tsx` untouched.
