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
 * (Lovable, Vercel, custom domain) without a service-role key.
 */
async function callRpc<T>(name: string, args?: Record<string, unknown>): Promise<T> {
  const client = publicClient() as unknown as {
    rpc: (fn: string, params?: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
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
    const result = await callRpc<{ sessionToken: string }>("exam_candidate_login", {
      p_username: args.username,
      p_password: args.password,
      p_token: args.token,
    });
    return { ok: true, sessionToken: result.sessionToken };
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
  const state = await callRpc<AttemptState & { secondsRemaining: number | string }>(
    "exam_attempt_state",
    { p_session_token: sessionToken },
  );
  return {
    ...state,
    questions: (state.questions ?? []).map((question) => ({
      id: question.id,
      position: question.position,
      section: question.section ?? null,
      question_type: question.question_type,
      prompt: question.prompt,
      options: Array.isArray(question.options) ? (question.options as string[]) : [],
      marks: Number(question.marks) || 0,
    })),
    answers: state.answers ?? {},
    reviewFlags: state.reviewFlags ?? [],
    secondsRemaining: Math.max(0, Math.floor(Number(state.secondsRemaining) || 0)),
  };
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
