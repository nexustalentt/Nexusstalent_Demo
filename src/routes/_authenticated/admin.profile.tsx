import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AdminShell, LoadingBlock } from "@/components/admin/admin-shell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Nexus Talent Admin" },
      { name: "description", content: "Update your administrator profile and password." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const account = useQuery({
    queryKey: ["admin", "me"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Not signed in");
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      return {
        id: user.id,
        email: user.email ?? "",
        fullName: profile?.full_name ?? "",
        roles: (roles ?? []).map((row) => row.role),
      };
    },
  });

  useEffect(() => {
    if (account.data) setFullName(account.data.fullName);
  }, [account.data]);

  const nameMutation = useMutation({
    mutationFn: async () => {
      const parsed = z.string().trim().min(2).max(120).safeParse(fullName);
      if (!parsed.success) throw new Error("Enter your full name");
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: parsed.data })
        .eq("id", account.data!.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => toast.success("Profile updated"),
    onError: (error: Error) => toast.error(error.message),
  });

  const passwordMutation = useMutation({
    mutationFn: async () => {
      if (password.length < 8) throw new Error("Password must be at least 8 characters");
      if (password !== confirm) throw new Error("Passwords do not match");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Password changed");
      setPassword("");
      setConfirm("");
      setPasswordError(null);
    },
    onError: (error: Error) => setPasswordError(error.message),
  });

  const field =
    "mt-2 w-full rounded-lg border border-primary/10 bg-background px-4 py-2.5 text-sm outline-none focus:border-accent";
  const label = "text-xs font-bold tracking-widest uppercase text-muted-foreground";

  if (account.isPending) {
    return (
      <AdminShell title="My profile">
        <LoadingBlock rows={4} />
      </AdminShell>
    );
  }

  return (
    <AdminShell title="My profile" description="Your administrator account">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-primary/5 bg-card p-6">
          <h2 className="font-bold text-primary">Account details</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {account.data?.email} · {account.data?.roles.join(", ") || "no role assigned"}
          </p>
          <div className="mt-5">
            <label className={label} htmlFor="full-name">
              Full name
            </label>
            <input
              id="full-name"
              value={fullName}
              maxLength={120}
              onChange={(event) => setFullName(event.target.value)}
              className={field}
            />
          </div>
          <button
            type="button"
            onClick={() => nameMutation.mutate()}
            disabled={nameMutation.isPending}
            className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-accent disabled:opacity-60"
          >
            Save profile
          </button>
        </section>

        <section className="rounded-2xl border border-primary/5 bg-card p-6">
          <h2 className="font-bold text-primary">Change password</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label className={label} htmlFor="new-password">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                maxLength={72}
                onChange={(event) => setPassword(event.target.value)}
                className={field}
              />
            </div>
            <div>
              <label className={label} htmlFor="confirm-password">
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirm}
                maxLength={72}
                onChange={(event) => setConfirm(event.target.value)}
                className={field}
              />
            </div>
            {passwordError ? <p className="text-sm text-destructive">{passwordError}</p> : null}
            <button
              type="button"
              onClick={() => passwordMutation.mutate()}
              disabled={passwordMutation.isPending}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-accent disabled:opacity-60"
            >
              Update password
            </button>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
