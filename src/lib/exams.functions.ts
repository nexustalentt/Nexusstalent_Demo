import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { candidateAccessSchema, candidateLoginSchema } from "./exam-schemas";

export const getExamIntro = createServerFn({ method: "GET" })
  .inputValidator((data: { token: string }) => ({ token: String(data.token).slice(0, 120) }))
  .handler(async ({ data }) => {
    const { examIntro } = await import("./exam-attempt.server");
    return examIntro(data.token);
  });

export const candidateLogin = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => candidateLoginSchema.parse(data))
  .handler(async ({ data }) => {
    const { login } = await import("./exam-attempt.server");
    return login(data);
  });

export const getAttemptState = createServerFn({ method: "POST" })
  .inputValidator((data: { sessionToken: string }) => ({
    sessionToken: String(data.sessionToken).slice(0, 200),
  }))
  .handler(async ({ data }) => {
    const { attemptState } = await import("./exam-attempt.server");
    return attemptState(data.sessionToken);
  });

export const saveExamAnswer = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { sessionToken: string; questionId: string; answer: { selected?: number[]; text?: string } | null }) => {
      const answer: { selected?: number[]; text?: string } = {};
      if (Array.isArray(data.answer?.selected)) {
        answer.selected = data.answer.selected
          .map((value) => Number(value))
          .filter((value) => Number.isInteger(value))
          .slice(0, 40);
      }
      if (typeof data.answer?.text === "string") {
        answer.text = data.answer.text.slice(0, 20000);
      }
      return {
        sessionToken: String(data.sessionToken).slice(0, 200),
        questionId: String(data.questionId).slice(0, 60),
        answer: data.answer ? answer : null,
      };
    },
  )
  .handler(async ({ data }) => {
    const { saveAnswer } = await import("./exam-attempt.server");
    return saveAnswer(data);
  });

export const submitExamAttempt = createServerFn({ method: "POST" })
  .inputValidator((data: { sessionToken: string }) => ({
    sessionToken: String(data.sessionToken).slice(0, 200),
  }))
  .handler(async ({ data }) => {
    const { submitAttempt } = await import("./exam-attempt.server");
    return submitAttempt(data.sessionToken);
  });

export const createCandidateAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    const parsed = candidateAccessSchema.parse((data as { credentials: unknown }).credentials);
    return { examId: String((data as { examId: string }).examId).slice(0, 60), credentials: parsed };
  })
  .handler(async ({ data, context }) => {
    const { data: isStaff, error: roleError } = await context.supabase.rpc("is_staff", {
      _user_id: context.userId,
    });
    if (roleError) throw new Error(roleError.message);
    if (!isStaff) throw new Error("Forbidden");

    const { hashPassword } = await import("./exam-crypto.server");
    const password_hash = await hashPassword(data.credentials.password);
    const { error } = await context.supabase.from("exam_candidates").upsert(
      {
        exam_id: data.examId,
        username: data.credentials.username,
        password_hash,
        full_name: data.credentials.full_name || null,
        email: data.credentials.email || null,
      },
      { onConflict: "exam_id,username" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
