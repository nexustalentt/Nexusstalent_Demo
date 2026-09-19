import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ExamRunner, Shell, fieldClass } from "@/components/site/exam-runner";
import { ProctoredExam } from "@/components/site/exam-proctoring";
import { candidateLoginGlobal } from "@/lib/exams.functions";

const STORAGE_KEY = "exam-session-current";

export const Route = createFileRoute("/exam/")({
  head: () => ({
    meta: [
      { title: "Exam Login — Nexus Talent" },
      {
        name: "description",
        content: "Sign in with the exam username and password shared by the Nexus Talent team.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ExamLoginPage,
});

function ExamLoginPage() {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && stored !== "undefined" && stored !== "null") {
      setSessionToken(stored);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setReady(true);
  }, []);

  function signOut() {
    window.localStorage.removeItem(STORAGE_KEY);
    setSessionToken(null);
  }

  if (!ready) return <Shell>Loading…</Shell>;

  if (sessionToken) {
    return (
      <ProctoredExam>
        {(onSubmitted) => (
          <ExamRunner
            sessionToken={sessionToken}
            onSessionInvalid={signOut}
            onSubmitted={onSubmitted}
          />
        )}
      </ProctoredExam>
    );
  }

  return (
    <LoginCard
      onAuthenticated={(value) => {
        if (!value || value === "undefined" || value === "null") return;
        window.localStorage.setItem(STORAGE_KEY, value);
        setSessionToken(value);
      }}
    />
  );
}

function LoginCard({ onAuthenticated }: { onAuthenticated: (sessionToken: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => candidateLoginGlobal({ data: { username: username.trim(), password } }),
    onSuccess: (result) => {
      if (result.ok && result.sessionToken) {
        onAuthenticated(result.sessionToken);
      } else {
        setError(result.ok ? "Unable to start exam session. Please try again." : result.error);
      }
    },
    onError: (mutationError: Error) => setError(mutationError.message),
  });


  return (
    <Shell>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Nexus Talent</p>
      <h1 className="mt-2 text-2xl font-bold text-primary">Exam Login</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter the username and password shared with you by the recruitment team.
      </p>
      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          if (!username.trim() || !password) {
            setError("Enter both username and password.");
            return;
          }
          mutation.mutate();
        }}
      >
        <div>
          <label
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground"
            htmlFor="candidate-username"
          >
            Username
          </label>
          <input
            id="candidate-username"
            value={username}
            maxLength={60}
            autoComplete="username"
            onChange={(event) => setUsername(event.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground"
            htmlFor="candidate-password"
          >
            Password
          </label>
          <input
            id="candidate-password"
            type="password"
            value={password}
            maxLength={100}
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            className={fieldClass}
          />
        </div>
        {error ? (
          <p role="alert" className="text-sm font-semibold text-destructive">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-accent disabled:opacity-60"
        >
          {mutation.isPending ? "Signing in…" : "Start Exam"}
        </button>
      </form>
      <Link to="/" className="mt-6 inline-block text-sm font-semibold text-accent hover:underline">
        Back to home
      </Link>
    </Shell>
  );
}
