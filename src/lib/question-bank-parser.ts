import { questionSchema } from "./exam-schemas";
import { examSections } from "./exam-utils";
import type { QuestionDraft } from "@/components/admin/question-editor";

export type ParsedQuestion = QuestionDraft & { number: number };
export type ParseError = { number: number | null; message: string };
export type ParseResult = { questions: ParsedQuestion[]; errors: ParseError[] };

export function letterLabel(index: number) {
  return String.fromCharCode(65 + index);
}

function letterToIndex(letter: string) {
  const code = letter.trim().toUpperCase().charCodeAt(0);
  if (Number.isNaN(code) || code < 65 || code > 90) return -1;
  return code - 65;
}

const questionStart = /^(?:q(?:uestion)?\s*)?(\d{1,4})\s*[).:.\-]?\s*(.*)$/i;
const optionStart = /^\(?([A-Za-z])\)?\s*[).:.\-]\s*(.*)$/;
const answerLine = /^(?:answer|ans|correct\s*answer|key)\s*[:\-–)]?\s*(.+)$/i;
const keyLine = /^(\d{1,4})\s*[).:.\-–>]+\s*([A-Za-z](?:\s*[,/&]\s*[A-Za-z])*)\s*$/;
const answersHeader = /^(?:answers?|answer\s*key)\s*[:.]?\s*$/i;
const sectionHeader = /^(?:section|part)\s*\d*\s*[:\-–.)]?\s*(.*)$/i;

/** Recognises "Section: English", "Part 2 - Logical Reasoning" or a bare known section name. */
function detectSection(line: string): string | null {
  const known = examSections.find(
    (section) => section.toLowerCase() === line.toLowerCase().replace(/[:\-–.]+$/, "").trim(),
  );
  if (known) return known;
  const match = line.match(sectionHeader);
  if (!match) return null;
  const name = (match[1] ?? "").trim();
  if (!name || name.length > 80) return null;
  if (/^[A-Za-z]\s*[).:]/.test(line)) return null;
  return name;
}

type Raw = {
  section: string;
  number: number | null;
  prompt: string[];
  options: string[];
  answerLetters: string[];
};

/** Parses a pasted question bank into structured questions plus per-question errors. */
export function parseQuestionBank(
  input: string,
  marksPerQuestion = 1,
  defaultSection = "",
): ParseResult {
  const lines = input.replace(/\r\n?/g, "\n").split("\n");
  const raws: Raw[] = [];
  const keyMap = new Map<number, string[]>();
  let current: Raw | null = null;
  let section = defaultSection.trim();
  let inKeySection = false;
  const errors: ParseError[] = [];

  const push = () => {
    if (current) raws.push(current);
    current = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (!inKeySection) {
      const detected = detectSection(line);
      if (detected) {
        push();
        section = detected;
        continue;
      }
    }

    if (answersHeader.test(line)) {
      push();
      inKeySection = true;
      continue;
    }

    if (inKeySection) {
      const key = line.match(keyLine);
      if (key) {
        keyMap.set(Number(key[1]), (key[2] ?? "").split(/[,/&\s]+/).filter(Boolean));
        continue;
      }
      inKeySection = false;
    }

    const answer = line.match(answerLine);
    if (answer && current) {
      current.answerLetters = (answer[1] ?? "")
        .split(/[,/&\s]+/)
        .map((part) => part.replace(/[).:-]/g, ""))
        .filter(Boolean);
      continue;
    }

    const option = current ? line.match(optionStart) : null;
    if (option && letterToIndex(option[1] ?? "") >= 0 && current) {
      // Only treat as an option when it follows the expected letter sequence-ish.
      current.options.push((option[2] ?? "").trim());
      continue;
    }

    const start = line.match(questionStart);
    if (start && (!current || current.options.length > 0 || current.prompt.length > 0)) {
      const looksNumbered = /^(?:q(?:uestion)?\s*)?\d/i.test(line);
      if (looksNumbered) {
        push();
        current = {
          section,
          number: Number(start[1]),
          prompt: start[2] ? [start[2]!.trim()] : [],
          options: [],
          answerLetters: [],
        };
        continue;
      }
    }

    if (!current) {
      current = { section, number: null, prompt: [line], options: [], answerLetters: [] };
      continue;
    }
    if (current.options.length === 0) current.prompt.push(line);
    else current.options[current.options.length - 1] += ` ${line}`;
  }
  push();

  const seen = new Set<number>();
  const questions: ParsedQuestion[] = [];

  raws.forEach((raw, position) => {
    const number = raw.number ?? position + 1;
    const label = raw.number ?? position + 1;
    if (raw.number === null) {
      errors.push({ number: null, message: `A block near question ${label} has no question number.` });
    }
    if (seen.has(number)) {
      errors.push({ number, message: `Question ${number} appears more than once.` });
      return;
    }
    seen.add(number);

    const prompt = raw.prompt.join(" ").trim();
    const options = raw.options.map((option) => option.trim()).filter(Boolean);
    const letters = raw.answerLetters.length > 0 ? raw.answerLetters : (keyMap.get(number) ?? []);

    if (!prompt) {
      errors.push({ number, message: `Question ${number} has no question text.` });
      return;
    }
    if (options.length < 2) {
      errors.push({ number, message: `Question ${number} needs at least two options.` });
      return;
    }
    if (letters.length === 0) {
      errors.push({
        number,
        message: `Question ${number} has no correct answer. Add "Answer: C" or an answer key at the end.`,
      });
      return;
    }

    const indices: number[] = [];
    for (const letter of letters) {
      const index = letterToIndex(letter);
      if (index < 0 || index >= options.length) {
        errors.push({
          number,
          message: `Question ${number}: answer "${letter}" is not one of the listed options.`,
        });
        return;
      }
      if (!indices.includes(index)) indices.push(index);
    }
    indices.sort((a, b) => a - b);

    const draft: ParsedQuestion = {
      number,
      question_type: indices.length > 1 ? "multiple_select" : "multiple_choice",
      prompt,
      options,
      correct_options: indices,
      expected_answer: "",
      section: raw.section,
      marks: marksPerQuestion,
    };

    const parsed = questionSchema.safeParse({
      question_type: draft.question_type,
      prompt: draft.prompt,
      options: draft.options,
      correct_options: draft.correct_options,
      expected_answer: "",
      section: draft.section,
      marks: draft.marks,
    });
    if (!parsed.success) {
      errors.push({
        number,
        message: `Question ${number}: ${parsed.error.issues[0]?.message ?? "invalid question"}`,
      });
      return;
    }

    questions.push(draft);
  });

  const order = new Map<string, number>();
  questions.forEach((question) => {
    if (!order.has(question.section)) order.set(question.section, order.size);
  });
  questions.sort(
    (a, b) =>
      (order.get(a.section) ?? 0) - (order.get(b.section) ?? 0) || a.number - b.number,
  );
  return { questions, errors };
}
