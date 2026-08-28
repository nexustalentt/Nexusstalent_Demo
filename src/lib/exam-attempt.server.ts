import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { randomToken, verifyPassword } from "./exam-crypto.server";
import { gradeAnswer, summarize, type StoredAnswer } from "./exam-grading.server";

export type CandidateQuestion = {
  id: string;
  position: number;
  question_type: string;
  prompt: string;
  options: string[];
  marks: number;
};

export type AttemptState = {
  exam: { title: string; description: string | null; instructions: string | null; duration_minutes: number };
  questions: CandidateQuestion[];
  answers: Record<string, StoredAnswer>;
  secondsRemaining: number;
  status: string;
  submittedAt: string | null;
};

const QUESTION_COLUMNS = "id, position, question_type, prompt, options, marks";

export async function examIntro(token: string) {
  const { data, error } = await supabaseAdmin
    .from("exams")
    .select("title, description, status")
    .eq("public_token", token)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data || data.status !== "published") return null;
  return { title: data.title, description: data.description };
}

const CANDIDATE_COLUMNS =
  "id, exam_id, password_hash, access_enabled, access_start_at, access_end_at, duration_minutes";

type CandidateRecord = {
  id: string;
  exam_id: string;
  password_hash: string;
  access_enabled: boolean;
  access_start_at: string | null;
  access_end_at: string | null;
  duration_minutes: number | null;
};

const INVALID = "Invalid username or password.";
export const ALREADY_TAKEN = "You already took an exam. Thank you!";

function formatWindow(value: string) {
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

/** Shared credential + access-window validation, then attempt start/resume. */
async function authorize(candidate: CandidateRecord, password: string) {
  if (!(await verifyPassword(password, candidate.password_hash))) throw new Error(INVALID);

  const { data: exam, error: examError } = await supabaseAdmin
    .from("exams")
    .select("id, status, duration_minutes")
    .eq("id", candidate.exam_id)
    .maybeSingle();
  if (examError) throw new Error(examError.message);
  if (!exam) throw new Error(INVALID);
  if (exam.status !== "published") {
    throw new Error("This exam is not active right now. Please contact the recruitment team.");
  }
  if (!candidate.access_enabled) {
    throw new Error("Your exam access has been disabled. Please contact the recruitment team.");
  }
  const now = Date.now();
  if (candidate.access_start_at && new Date(candidate.access_start_at).getTime() > now) {
    throw new Error(`This exam opens on ${formatWindow(candidate.access_start_at)}.`);
  }
  if (candidate.access_end_at && new Date(candidate.access_end_at).getTime() < now) {
    throw new Error("The access window for this exam has closed.");
  }

  const { data: existing } = await supabaseAdmin
    .from("exam_attempts")
    .select("session_token, status")
    .eq("exam_id", exam.id)
    .eq("candidate_id", candidate.id)
    .maybeSingle();

  if (existing) {
    if (existing.status !== "in_progress") throw new Error(ALREADY_TAKEN);
    return { sessionToken: existing.session_token };
  }

  const minutes = candidate.duration_minutes ?? exam.duration_minutes;
  const sessionToken = randomToken(24);
  const expiresAt = new Date(Date.now() + minutes * 60_000).toISOString();
  const { error: insertError } = await supabaseAdmin.from("exam_attempts").insert({
    exam_id: exam.id,
    candidate_id: candidate.id,
    session_token: sessionToken,
    expires_at: expiresAt,
  });

  if (insertError) {
    // Unique (exam_id, candidate_id) index blocks a second attempt: reuse the existing one.
    const { data: raced } = await supabaseAdmin
      .from("exam_attempts")
      .select("session_token, status")
      .eq("exam_id", exam.id)
      .eq("candidate_id", candidate.id)
      .maybeSingle();
    if (!raced) throw new Error(insertError.message);
    if (raced.status !== "in_progress") throw new Error(ALREADY_TAKEN);
    return { sessionToken: raced.session_token };
  }

  return { sessionToken };
}

export async function login(input: { token: string; username: string; password: string }) {
  const { data: exam, error: examError } = await supabaseAdmin
    .from("exams")
    .select("id")
    .eq("public_token", input.token)
    .maybeSingle();
  if (examError) throw new Error(examError.message);
  if (!exam) throw new Error(INVALID);

  const { data: candidate, error: candidateError } = await supabaseAdmin
    .from("exam_candidates")
    .select(CANDIDATE_COLUMNS)
    .eq("exam_id", exam.id)
    .eq("username", input.username)
    .maybeSingle();
  if (candidateError) throw new Error(candidateError.message);
  if (!candidate) throw new Error(INVALID);
  return authorize(candidate as CandidateRecord, input.password);
}

/** Username/password sign-in from the public /exam page — no exam link needed. */
export async function loginByUsername(input: { username: string; password: string }) {
  const { data: candidate, error } = await supabaseAdmin
    .from("exam_candidates")
    .select(CANDIDATE_COLUMNS)
    .eq("username", input.username)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!candidate) throw new Error(INVALID);
  return authorize(candidate as CandidateRecord, input.password);
}


async function loadAttempt(sessionToken: string) {
  const { data, error } = await supabaseAdmin
    .from("exam_attempts")
    .select("id, exam_id, status, expires_at, submitted_at")
    .eq("session_token", sessionToken)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Session expired. Please sign in again.");
  return data;
}

export async function attemptState(sessionToken: string): Promise<AttemptState> {
  let attempt = await loadAttempt(sessionToken);

  if (attempt.status === "in_progress" && new Date(attempt.expires_at).getTime() <= Date.now()) {
    await finalize(attempt.id, attempt.exam_id);
    attempt = await loadAttempt(sessionToken);
  }

  const [examResult, questionResult, answerResult] = await Promise.all([
    supabaseAdmin
      .from("exams")
      .select("title, description, instructions, duration_minutes")
      .eq("id", attempt.exam_id)
      .single(),
    supabaseAdmin
      .from("exam_questions")
      .select(QUESTION_COLUMNS)
      .eq("exam_id", attempt.exam_id)
      .order("position", { ascending: true }),
    supabaseAdmin.from("exam_answers").select("question_id, answer").eq("attempt_id", attempt.id),
  ]);

  if (examResult.error) throw new Error(examResult.error.message);
  if (questionResult.error) throw new Error(questionResult.error.message);
  if (answerResult.error) throw new Error(answerResult.error.message);

  const answers: Record<string, StoredAnswer> = {};
  for (const row of answerResult.data ?? []) {
    answers[row.question_id] = (row.answer ?? null) as StoredAnswer;
  }

  return {
    exam: examResult.data,
    questions: (questionResult.data ?? []).map((question) => ({
      id: question.id,
      position: question.position,
      question_type: question.question_type,
      prompt: question.prompt,
      options: Array.isArray(question.options) ? (question.options as string[]) : [],
      marks: Number(question.marks) || 0,
    })),
    answers,
    secondsRemaining: Math.max(
      0,
      Math.floor((new Date(attempt.expires_at).getTime() - Date.now()) / 1000),
    ),
    status: attempt.status,
    submittedAt: attempt.submitted_at,
  };
}

export async function saveAnswer(input: {
  sessionToken: string;
  questionId: string;
  answer: StoredAnswer;
}) {
  const attempt = await loadAttempt(input.sessionToken);
  if (attempt.status !== "in_progress") throw new Error("This exam has already been submitted.");
  if (new Date(attempt.expires_at).getTime() <= Date.now()) {
    await finalize(attempt.id, attempt.exam_id);
    throw new Error("Time is up. Your exam has been submitted.");
  }

  const { data: question, error: questionError } = await supabaseAdmin
    .from("exam_questions")
    .select("id")
    .eq("id", input.questionId)
    .eq("exam_id", attempt.exam_id)
    .maybeSingle();
  if (questionError) throw new Error(questionError.message);
  if (!question) throw new Error("Unknown question.");

  const { error } = await supabaseAdmin.from("exam_answers").upsert(
    {
      attempt_id: attempt.id,
      question_id: input.questionId,
      answer: input.answer as never,
    },
    { onConflict: "attempt_id,question_id" },
  );
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function submitAttempt(sessionToken: string) {
  const attempt = await loadAttempt(sessionToken);
  if (attempt.status !== "in_progress") return { ok: true };
  await finalize(attempt.id, attempt.exam_id);
  return { ok: true };
}

export async function finalize(attemptId: string, examId: string) {
  const [examResult, questionResult, answerResult] = await Promise.all([
    supabaseAdmin.from("exams").select("passing_percentage").eq("id", examId).single(),
    supabaseAdmin
      .from("exam_questions")
      .select("id, question_type, correct_options, expected_answer, marks")
      .eq("exam_id", examId),
    supabaseAdmin.from("exam_answers").select("question_id, answer").eq("attempt_id", attemptId),
  ]);
  if (examResult.error) throw new Error(examResult.error.message);
  if (questionResult.error) throw new Error(questionResult.error.message);
  if (answerResult.error) throw new Error(answerResult.error.message);

  const questions = (questionResult.data ?? []).map((question) => ({
    ...question,
    marks: Number(question.marks) || 0,
  }));
  const answerMap = new Map<string, StoredAnswer>();
  for (const row of answerResult.data ?? []) {
    answerMap.set(row.question_id, (row.answer ?? null) as StoredAnswer);
  }

  const awarded = new Map<string, number | null>();
  for (const question of questions) {
    if (question.question_type === "long_answer") {
      awarded.set(question.id, null);
      continue;
    }
    const score = gradeAnswer(question, answerMap.get(question.id) ?? null);
    awarded.set(question.id, score);
    if (score !== null) {
      await supabaseAdmin.from("exam_answers").upsert(
        {
          attempt_id: attemptId,
          question_id: question.id,
          answer: (answerMap.get(question.id) ?? null) as never,
          awarded_marks: score,
          graded: true,
        },
        { onConflict: "attempt_id,question_id" },
      );
    }
  }

  const totals = summarize(questions, awarded, Number(examResult.data.passing_percentage) || 0);
  const { error } = await supabaseAdmin
    .from("exam_attempts")
    .update({ ...totals, submitted_at: new Date().toISOString() })
    .eq("id", attemptId);
  if (error) throw new Error(error.message);
  return totals;
}
