import { publicClient } from "./supabase-public.server";
import type { StoredAnswer } from "./exam-grading.server";

export type CandidateQuestion = {
  id: string;
  position: number;
  section: string | null;
  question_type: string;
  prompt: string;
  options: string[];
  marks: number;
};

export type AttemptState = {
  exam: {
    title: string;
    description: string | null;
    instructions: string | null;
    duration_minutes: number;
  };
  candidateName: string | null;
  candidateUsername: string | null;
  questions: CandidateQuestion[];
  answers: Record<string, StoredAnswer>;
  reviewFlags: string[];
  started: boolean;
  secondsRemaining: number;
  status: string;
  submittedAt: string | null;
};

export const ALREADY_TAKEN = "You already took an exam. Thank you!";

/**
 * All candidate-side exam operations run through SECURITY DEFINER database
 * functions, so the flow only needs the publishable key and works on any host
 * (Vercel, Netlify, custom domain) without a service-role key.
 */
async function callRpc<T>(name: string, args?: Record<string, unknown>): Promise<T> {
  const client = publicClient() as unknown as {
    rpc: (
      fn: string,
      params?: Record<string, unknown>,
    ) => Promise<{ data: unknown; error: { message: string } | null }>;
  };
  const { data, error } = await client.rpc(name, args);
  if (error) throw new Error(cleanMessage(error.message));
  return data as T;
}

/** Postgres prefixes raised messages in some clients; keep the candidate-facing text. */
function cleanMessage(message: string) {
  return message.replace(/^ERROR:\s*/i, "").trim() || "Something went wrong. Please try again.";
}

export async function examIntro(token: string) {
  return callRpc<{ title: string; description: string | null } | null>("exam_public_intro", {
    p_token: token,
  });
}

export type LoginResult = { ok: true; sessionToken: string } | { ok: false; error: string };

/** Bad credentials are an expected outcome, so return them instead of throwing. */
async function attemptLogin(args: {
  username: string;
  password: string;
  token: string | null;
}): Promise<LoginResult> {
  try {
    const raw = await callRpc<any>(
      "exam_candidate_login",
      {
        p_username: args.username.trim(),
        p_password: args.password,
        p_token: args.token,
      },
    );
    let result = raw;
    if (typeof result === "string") {
      try {
        result = JSON.parse(result);
      } catch {
        // ignore
      }
    }
    const sessionToken = result?.sessionToken || result?.session_token;
    if (!sessionToken) {
      return { ok: false, error: "Unable to start exam session. Please try again." };
    }
    return { ok: true, sessionToken };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Login failed." };
  }
}

export async function login(input: { token: string; username: string; password: string }) {
  return attemptLogin({ username: input.username, password: input.password, token: input.token });
}

/** Username/password sign-in from the public /exam page — no exam link needed. */
export async function loginByUsername(input: { username: string; password: string }) {
  return attemptLogin({ username: input.username, password: input.password, token: null });
}

export async function attemptState(sessionToken: string): Promise<AttemptState> {
  const raw = await callRpc<any>("exam_attempt_state", { p_session_token: sessionToken });

  // Map answers: if raw.answers is an array (e.g. from older RPC), convert to dictionary { [questionId]: answer }
  let answersDict: Record<string, StoredAnswer> = {};
  if (Array.isArray(raw.answers)) {
    for (const ans of raw.answers) {
      if (ans && ans.question_id) {
        answersDict[ans.question_id] = ans.answer ?? null;
      }
    }
  } else if (raw.answers && typeof raw.answers === "object") {
    answersDict = raw.answers;
  }

  // Construct exam object safely regardless of RPC version
  const exam = raw.exam ?? {
    title: raw.exam_title ?? "Assessment",
    description: raw.description ?? raw.exam_description ?? null,
    instructions: raw.instructions ?? null,
    duration_minutes: Number(raw.duration_minutes) || 30,
  };

  const candidateName = raw.candidateName ?? raw.candidate_name ?? null;
  const candidateUsername = raw.candidateUsername ?? raw.candidate_username ?? null;
  const started = Boolean(raw.started || raw.exam_started_at);
  const secondsRemaining = Math.max(
    0,
    Math.floor(Number(raw.secondsRemaining ?? raw.remaining_seconds) || 0),
  );

  return {
    exam,
    candidateName,
    candidateUsername,
    questions: (raw.questions ?? []).map((question: any) => ({
      id: question.id,
      position: Number(question.position) || 0,
      section: question.section ?? null,
      question_type: question.question_type ?? "multiple_choice",
      prompt: question.prompt ?? "",
      options: Array.isArray(question.options) ? (question.options as string[]) : [],
      marks: Number(question.marks) || 1,
    })),
    answers: answersDict,
    reviewFlags: Array.isArray(raw.reviewFlags) ? raw.reviewFlags : [],
    started,
    secondsRemaining,
    status: raw.status ?? "in_progress",
    submittedAt: raw.submittedAt ?? raw.submitted_at ?? null,
  };
}

/** Starts the countdown from the moment the candidate clicks "Start Exam". */
export async function startAttempt(sessionToken: string) {
  const res = await callRpc<{ ok?: boolean; started?: boolean }>("exam_start_attempt", {
    p_session_token: sessionToken,
  });
  return { ok: Boolean(res?.ok || res?.started) };
}

export async function saveAnswer(input: {
  sessionToken: string;
  questionId: string;
  answer?: StoredAnswer;
  markedForReview?: boolean;
}) {
  return callRpc<{ ok: boolean }>("exam_save_answer", {
    p_session_token: input.sessionToken,
    p_question_id: input.questionId,
    p_answer: input.answer ?? null,
    p_set_answer: input.answer !== undefined,
    p_marked: input.markedForReview ?? null,
  });
}

export async function submitAttempt(sessionToken: string) {
  return callRpc<{ ok: boolean }>("exam_submit", { p_session_token: sessionToken });
}
