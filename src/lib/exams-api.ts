import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { recordAudit } from "./admin-api";

export type ExamRow = Database["public"]["Tables"]["exams"]["Row"];
export type ExamInsert = Database["public"]["Tables"]["exams"]["Insert"];
export type ExamQuestionRow = Database["public"]["Tables"]["exam_questions"]["Row"];
export type ExamCandidateRow = Database["public"]["Tables"]["exam_candidates"]["Row"];
export type ExamAttemptRow = Database["public"]["Tables"]["exam_attempts"]["Row"];
export type ExamAnswerRow = Database["public"]["Tables"]["exam_answers"]["Row"];

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

export const examsQuery = queryOptions({
  queryKey: ["admin", "exams"],
  queryFn: async () => {
    const exams = unwrap(
      await supabase.from("exams").select("*").order("created_at", { ascending: false }),
    );
    const [questions, candidates, attempts] = await Promise.all([
      unwrap(await supabase.from("exam_questions").select("id, exam_id")),
      unwrap(await supabase.from("exam_candidates").select("id, exam_id")),
      unwrap(await supabase.from("exam_attempts").select("id, exam_id, status")),
    ]);
    return exams.map((exam) => ({
      ...exam,
      question_count: questions.filter((row) => row.exam_id === exam.id).length,
      candidate_count: candidates.filter((row) => row.exam_id === exam.id).length,
      submission_count: attempts.filter(
        (row) => row.exam_id === exam.id && row.status !== "in_progress",
      ).length,
    }));
  },
});

export const examQuery = (id: string) =>
  queryOptions({
    queryKey: ["admin", "exam", id],
    queryFn: async () =>
      unwrap<ExamRow | null>(await supabase.from("exams").select("*").eq("id", id).maybeSingle()),
  });

export const examQuestionsQuery = (examId: string) =>
  queryOptions({
    queryKey: ["admin", "exam-questions", examId],
    queryFn: async () =>
      unwrap(
        await supabase
          .from("exam_questions")
          .select("*")
          .eq("exam_id", examId)
          .order("position", { ascending: true }),
      ),
  });

export const examCandidatesQuery = (examId: string) =>
  queryOptions({
    queryKey: ["admin", "exam-candidates", examId],
    queryFn: async () =>
      unwrap(
        await supabase
          .from("exam_candidates")
          .select("*")
          .eq("exam_id", examId)
          .order("created_at", { ascending: false }),
      ),
  });

export const examAttemptsQuery = (examId: string) =>
  queryOptions({
    queryKey: ["admin", "exam-attempts", examId],
    queryFn: async () =>
      unwrap(
        await supabase
          .from("exam_attempts")
          .select("*, exam_candidates(username, full_name, email)")
          .eq("exam_id", examId)
          .order("created_at", { ascending: false }),
      ) as (ExamAttemptRow & {
        exam_candidates: { username: string; full_name: string | null; email: string | null } | null;
      })[],
  });

export const examAttemptQuery = (attemptId: string) =>
  queryOptions({
    queryKey: ["admin", "exam-attempt", attemptId],
    queryFn: async () => {
      const attempt = unwrap(
        await supabase
          .from("exam_attempts")
          .select("*, exam_candidates(username, full_name, email), exams(title, passing_percentage)")
          .eq("id", attemptId)
          .maybeSingle(),
      ) as
        | (ExamAttemptRow & {
            exam_candidates: { username: string; full_name: string | null; email: string | null } | null;
            exams: { title: string; passing_percentage: number } | null;
          })
        | null;
      if (!attempt) return null;
      const [questions, answers] = await Promise.all([
        unwrap(
          await supabase
            .from("exam_questions")
            .select("*")
            .eq("exam_id", attempt.exam_id)
            .order("position", { ascending: true }),
        ),
        unwrap(await supabase.from("exam_answers").select("*").eq("attempt_id", attemptId)),
      ]);
      return { attempt, questions, answers };
    },
  });

export async function nextPosition(examId: string) {
  const { data } = await supabase
    .from("exam_questions")
    .select("position")
    .eq("exam_id", examId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.position ?? -1) + 1;
}

export async function reorderQuestion(
  questions: ExamQuestionRow[],
  questionId: string,
  direction: -1 | 1,
) {
  const index = questions.findIndex((question) => question.id === questionId);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= questions.length) return;
  const ordered = [...questions];
  const [moved] = ordered.splice(index, 1);
  if (!moved) return;
  ordered.splice(target, 0, moved);
  await Promise.all(
    ordered.map((question, position) =>
      supabase.from("exam_questions").update({ position }).eq("id", question.id),
    ),
  );
}

export async function duplicateQuestion(question: ExamQuestionRow) {
  const position = await nextPosition(question.exam_id);
  const { error } = await supabase.from("exam_questions").insert({
    exam_id: question.exam_id,
    position,
    question_type: question.question_type,
    prompt: `${question.prompt} (copy)`,
    options: question.options as never,
    correct_options: question.correct_options as never,
    expected_answer: question.expected_answer,
    marks: question.marks,
  });
  if (error) throw new Error(error.message);
}

export async function deleteQuestion(question: ExamQuestionRow) {
  const { error } = await supabase.from("exam_questions").delete().eq("id", question.id);
  if (error) throw new Error(error.message);
}

export async function setExamStatus(exam: ExamRow, status: "draft" | "published" | "closed") {
  const { error } = await supabase
    .from("exams")
    .update({
      status,
      published_at: status === "published" ? (exam.published_at ?? new Date().toISOString()) : exam.published_at,
    })
    .eq("id", exam.id);
  if (error) throw new Error(error.message);
  await recordAudit(`exam_${status}`, "exam", exam.id, { title: exam.title });
}

export async function deleteExam(exam: ExamRow) {
  const { error } = await supabase.from("exams").delete().eq("id", exam.id);
  if (error) throw new Error(error.message);
  await recordAudit("exam_deleted", "exam", exam.id, { title: exam.title });
}

/** Recomputes attempt totals after manual grading. */
export async function recalculateAttempt(attemptId: string) {
  const attempt = unwrap(
    await supabase
      .from("exam_attempts")
      .select("id, exam_id, exams(passing_percentage)")
      .eq("id", attemptId)
      .single(),
  ) as { id: string; exam_id: string; exams: { passing_percentage: number } | null };

  const [questions, answers] = await Promise.all([
    unwrap(
      await supabase.from("exam_questions").select("id, question_type, marks").eq("exam_id", attempt.exam_id),
    ),
    unwrap(await supabase.from("exam_answers").select("question_id, awarded_marks").eq("attempt_id", attemptId)),
  ]);

  const awarded = new Map(answers.map((row) => [row.question_id, row.awarded_marks]));
  let autoScore = 0;
  let manualScore = 0;
  let pending = false;
  let totalMarks = 0;

  for (const question of questions) {
    const marks = Number(question.marks) || 0;
    totalMarks += marks;
    const value = awarded.get(question.id);
    const score = value === null || value === undefined ? null : Number(value);
    const isManual = question.question_type === "long_answer";
    if (score === null) {
      if (isManual) pending = true;
      continue;
    }
    if (isManual) manualScore += score;
    else autoScore += score;
  }

  const totalScore = autoScore + manualScore;
  const percentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 10000) / 100 : 0;
  const { error } = await supabase
    .from("exam_attempts")
    .update({
      auto_score: autoScore,
      manual_score: manualScore,
      total_score: totalScore,
      total_marks: totalMarks,
      percentage,
      passed: percentage >= (Number(attempt.exams?.passing_percentage) || 0),
      status: pending ? "pending_review" : "evaluated",
    })
    .eq("id", attemptId);
  if (error) throw new Error(error.message);
}

export async function saveEvaluation(input: {
  attemptId: string;
  questionId: string;
  marks: number;
  feedback: string;
}) {
  const { error } = await supabase.from("exam_answers").upsert(
    {
      attempt_id: input.attemptId,
      question_id: input.questionId,
      awarded_marks: input.marks,
      feedback: input.feedback || null,
      graded: true,
    },
    { onConflict: "attempt_id,question_id" },
  );
  if (error) throw new Error(error.message);
  await recalculateAttempt(input.attemptId);
}
