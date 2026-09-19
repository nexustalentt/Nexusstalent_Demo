import { createServerFn } from "@tanstack/react-start";
import { requireAuthedUser } from "./staff-auth.middleware";
import {
  candidateAccessSchema,
  candidateLoginSchema,
  examDetailsSchema,
  globalLoginSchema,
} from "./exam-schemas";
import { istLocalToIso } from "./exam-utils";

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
    (data: {
      sessionToken: string;
      questionId: string;
      answer?: { selected?: number[]; text?: string } | null;
      markedForReview?: boolean;
    }) => {
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
      const payload: {
        sessionToken: string;
        questionId: string;
        answer?: { selected?: number[]; text?: string } | null;
        markedForReview?: boolean;
      } = {
        sessionToken: String(data.sessionToken).slice(0, 200),
        questionId: String(data.questionId).slice(0, 60),
      };
      if (data.answer !== undefined) payload.answer = data.answer ? answer : null;
      if (typeof data.markedForReview === "boolean") {
        payload.markedForReview = data.markedForReview;
      }
      return payload;
    },
  )
  .handler(async ({ data }) => {
    const { saveAnswer } = await import("./exam-attempt.server");
    return saveAnswer(data);
  });

export const startExamAttempt = createServerFn({ method: "POST" })
  .inputValidator((data: { sessionToken: string }) => ({
    sessionToken: String(data.sessionToken).slice(0, 200),
  }))
  .handler(async ({ data }) => {
    const { startAttempt } = await import("./exam-attempt.server");
    return startAttempt(data.sessionToken);
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
  .inputValidator((data: unknown) => {
    const parsed = candidateAccessSchema.parse((data as { credentials: unknown }).credentials);
    return { examId: String((data as { examId: string }).examId).slice(0, 60), credentials: parsed };
  })
  .handler(async ({ data }) => {
    const { supabase } = await import("@/integrations/supabase/client");
    let supabaseClient = supabase;
    if (process.env["SUPABASE_SERVICE_ROLE_KEY"] || process.env["SUPABASE_SECRET_KEY"]) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        supabaseClient = supabaseAdmin;
      } catch {
        supabaseClient = supabase;
      }
    }

    const args: {
      p_exam_id: string;
      p_username: string;
      p_password: string;
      p_full_name?: string;
      p_email?: string;
      p_access_start_at?: string;
      p_access_end_at?: string;
      p_duration_minutes?: number;
    } = {
      p_exam_id: data.examId,
      p_username: data.credentials.username,
      p_password: data.credentials.password,
    };
    if (data.credentials.full_name) args.p_full_name = data.credentials.full_name;
    if (data.credentials.email) args.p_email = data.credentials.email;
    if (data.credentials.access_start_at) {
      args.p_access_start_at = istLocalToIso(data.credentials.access_start_at);
    }
    if (data.credentials.access_end_at) {
      args.p_access_end_at = istLocalToIso(data.credentials.access_end_at);
    }
    if (typeof data.credentials.duration_minutes === "number") {
      args.p_duration_minutes = data.credentials.duration_minutes;
    }

    const { error } = await supabaseClient.rpc("exam_upsert_candidate", args);

    if (error) {
      if (error.code === "PGRST205" || /schema cache|does not exist/i.test(error.message)) {
        throw new Error(
          "The 'exam_candidates' table or 'exam_upsert_candidate' function is not yet created in your Supabase database. Please run the provided SQL setup script in your Supabase SQL Editor.",
        );
      }
      throw new Error(error.message);
    }
    return { ok: true };
  });

export const candidateLoginGlobal = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => globalLoginSchema.parse(data))
  .handler(async ({ data }) => {
    const { loginByUsername } = await import("./exam-attempt.server");
    return loginByUsername(data);
  });

export const createAdminExam = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => examDetailsSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabase } = await import("@/integrations/supabase/client");
    let supabaseClient = supabase;
    if (process.env["SUPABASE_SERVICE_ROLE_KEY"] || process.env["SUPABASE_SECRET_KEY"]) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        supabaseClient = supabaseAdmin;
      } catch {
        supabaseClient = supabase;
      }
    }

    const { data: exam, error } = await supabaseClient
      .from("exams")
      .insert({
        title: data.title,
        description: data.description || null,
        duration_minutes: data.duration_minutes,
        passing_percentage: data.passing_percentage,
        instructions: data.instructions || null,
      })
      .select("id, title")
      .single();

    if (error) {
      if (error.code === "PGRST205" || /schema cache|does not exist/i.test(error.message)) {
        throw new Error(
          "The 'exams' table is not yet created in your Supabase database. Please run the provided SQL setup script in your Supabase SQL Editor.",
        );
      }
      throw new Error(error.message);
    }
    return exam;
  });
