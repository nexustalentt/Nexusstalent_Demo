import { createServerFn } from "@tanstack/react-start";
import type { JobInsert } from "./admin-api";
import { supabase } from "@/integrations/supabase/client";

export const createAdminJob = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => data as JobInsert)
  .handler(async ({ data }) => {
    if (process.env["SUPABASE_SERVICE_ROLE_KEY"] || process.env["SUPABASE_SECRET_KEY"]) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: job, error } = await supabaseAdmin
        .from("jobs")
        .insert(data)
        .select("id, title")
        .single();
      if (error) throw new Error(error.message);
      return job;
    }

    // Fallback: use anon client
    const { data: job, error } = await supabase
      .from("jobs")
      .insert(data)
      .select("id, title")
      .single();

    if (error) {
      if (/row-level security/i.test(error.message) || error.code === "42501") {
        throw new Error(
          "Permission error (RLS): Add SUPABASE_SERVICE_ROLE_KEY to your .env from Supabase Dashboard -> Project Settings -> API, or disable RLS on the 'jobs' table in Table Editor.",
        );
      }
      throw new Error(error.message);
    }
    return job;
  });

export const updateAdminJob = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; values: Partial<JobInsert> }) => data)
  .handler(async ({ data }) => {
    if (process.env["SUPABASE_SERVICE_ROLE_KEY"] || process.env["SUPABASE_SECRET_KEY"]) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.from("jobs").update(data.values).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    const { error } = await supabase.from("jobs").update(data.values).eq("id", data.id);
    if (error) {
      if (/row-level security/i.test(error.message) || error.code === "42501") {
        throw new Error(
          "Permission error (RLS): Add SUPABASE_SERVICE_ROLE_KEY to your .env from Supabase Dashboard -> Project Settings -> API, or disable RLS on the 'jobs' table in Table Editor.",
        );
      }
      throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteAdminJob = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    if (process.env["SUPABASE_SERVICE_ROLE_KEY"] || process.env["SUPABASE_SECRET_KEY"]) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.from("jobs").delete().eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    const { error } = await supabase.from("jobs").delete().eq("id", data.id);
    if (error) {
      if (/row-level security/i.test(error.message) || error.code === "42501") {
        throw new Error(
          "Permission error (RLS): Add SUPABASE_SERVICE_ROLE_KEY to your .env from Supabase Dashboard -> Project Settings -> API, or disable RLS on the 'jobs' table in Table Editor.",
        );
      }
      throw new Error(error.message);
    }
    return { ok: true };
  });
