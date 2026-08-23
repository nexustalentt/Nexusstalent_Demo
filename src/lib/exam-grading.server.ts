type QuestionRow = {
  id: string;
  question_type: string;
  correct_options: unknown;
  expected_answer: string | null;
  marks: number;
};

export type StoredAnswer = { selected?: number[]; text?: string } | null;

function indices(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item))
    .sort((a, b) => a - b);
}

function normalize(text: string) {
  return text.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.,!?;:]+$/g, "");
}

export function gradeAnswer(question: QuestionRow, answer: StoredAnswer): number | null {
  const marks = Number(question.marks) || 0;
  const selected = indices(answer?.selected);
  const correct = indices(question.correct_options);

  switch (question.question_type) {
    case "multiple_choice":
    case "true_false":
      return selected.length === 1 && correct.length >= 1 && selected[0] === correct[0] ? marks : 0;
    case "multiple_select":
      return correct.length > 0 &&
        selected.length === correct.length &&
        selected.every((value, index) => value === correct[index])
        ? marks
        : 0;
    case "short_answer": {
      const expected = question.expected_answer ?? "";
      const given = answer?.text ?? "";
      if (!expected.trim()) return null;
      const accepted = expected.split("|").map(normalize).filter(Boolean);
      return accepted.includes(normalize(given)) ? marks : 0;
    }
    default:
      return null;
  }
}

export function summarize(
  questions: QuestionRow[],
  awardedByQuestion: Map<string, number | null>,
  passingPercentage: number,
) {
  const totalMarks = questions.reduce((sum, question) => sum + (Number(question.marks) || 0), 0);
  let autoScore = 0;
  let manualScore = 0;
  let pendingManual = false;

  for (const question of questions) {
    const awarded = awardedByQuestion.get(question.id) ?? null;
    const auto = question.question_type !== "long_answer";
    if (awarded === null) {
      if (!auto) pendingManual = true;
      continue;
    }
    if (auto) autoScore += awarded;
    else manualScore += awarded;
  }

  const totalScore = autoScore + manualScore;
  const percentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 10000) / 100 : 0;
  return {
    total_marks: totalMarks,
    auto_score: autoScore,
    manual_score: manualScore,
    total_score: totalScore,
    percentage,
    passed: percentage >= passingPercentage,
    status: pendingManual ? "pending_review" : "evaluated",
  };
}
