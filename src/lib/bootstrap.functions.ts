import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * First-run administrator setup.
 *
 * There is no public sign-up: candidates never get accounts. The very first
 * administrator is created here, and only while the project has zero admins.
 * After that this endpoint refuses every request, and further staff accounts are
 * invited from inside the portal.
 */
export const adminSetupStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count } = await supabaseAdmin
    .from("user_roles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");
  return { needsSetup: (count ?? 0) === 0 };
});

const setupSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(10, "Use at least 10 characters").max(72),
});

export const createFirstAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => setupSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) {
      throw new Error("An administrator already exists. Ask them to invite you.");
    }

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { name: data.fullName },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Could not create the account");

    await supabaseAdmin
      .from("profiles")
      .upsert({ id: created.user.id, email: data.email, name: data.fullName });

    // A signup trigger may already have granted a role, so upsert instead of insert.
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: created.user.id, role: "admin" }, { onConflict: "user_id,role" });
    if (roleError) throw new Error(roleError.message);

    return { ok: true };
  });
