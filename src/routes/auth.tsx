import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLogo } from "@/components/site/site-header";


export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Administrator Sign In — Nexus Talent" },
      { name: "description", content: "Secure sign in for Nexus Talent administrators." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Administrator Sign In — Nexus Talent" },
      { property: "og:description", content: "Secure administrator access." },
    ],
  }),
  component: AuthPage,
});

const credentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "reset">("signin");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);



  async function handleSignIn(event: React.FormEvent) {
    event.preventDefault();
    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }
    setError(null);
    setPending(true);
    const { error: signInError } = await supabase.auth.signInWithPassword(parsed.data);
    setPending(false);
    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : signInError.message,
      );
      return;
    }
    navigate({ to: "/admin", replace: true });
  }

  async function handleReset(event: React.FormEvent) {
    event.preventDefault();
    const parsed = z.string().email().safeParse(email.trim());
    if (!parsed.success) {
      setError("Enter the email address linked to your admin account.");
      return;
    }
    setError(null);
    setPending(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/auth`,
    });
    setPending(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    toast.success("If that account exists, a reset link is on its way.");
    setMode("signin");
  }

  const fieldClass =
    "mt-2 w-full rounded-lg border border-primary/10 bg-background px-4 py-3 text-sm text-primary outline-none focus:border-accent";
  const labelClass = "text-xs font-semibold tracking-widest uppercase text-muted-foreground";

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-primary/5 bg-background">
        <div className="container-page flex h-20 items-center justify-between">
          <SiteLogo />
          <Link to="/" className="text-sm font-semibold text-muted-foreground hover:text-accent">
            Back to website
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-2xl border border-primary/5 bg-card p-8 shadow-elegant">
          <div className="mb-6 flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-primary">
            {mode === "signin" ? "Administrator sign in" : "Reset your password"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "This portal is for authorised Nexus Talent administrators only."
              : "We'll email you a secure link to set a new password."}
          </p>

          <form
            onSubmit={mode === "signin" ? handleSignIn : handleReset}
            noValidate
            className="mt-8 space-y-5"
          >


            <div>
              <label className={labelClass} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                maxLength={255}
                onChange={(event) => setEmail(event.target.value)}
                className={fieldClass}
              />
            </div>

            {mode !== "reset" ? (
              <div>
                <label className={labelClass} htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  maxLength={72}
                  onChange={(event) => setPassword(event.target.value)}
                  className={fieldClass}
                />
              </div>
            ) : null}

            {error ? (
              <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={pending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-accent disabled:opacity-60"
            >
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              {mode === "signin"
                ? "Sign In"
                : mode === "reset"
                  ? "Send reset link"
                  : "Create administrator"}
            </button>

            <div className="space-y-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signin" ? "reset" : "signin");
                  setError(null);
                }}
                className="w-full text-sm font-semibold text-accent"
              >
                {mode === "signin" ? "Forgot Password?" : "Back to sign in"}
              </button>

              {needsSetup && mode !== "setup" ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode("setup");
                    setError(null);
                  }}
                  className="w-full text-xs font-semibold text-muted-foreground hover:text-accent"
                >
                  No administrator yet — run first-time setup
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
