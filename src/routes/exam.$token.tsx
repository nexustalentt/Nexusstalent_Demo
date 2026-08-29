import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ExamRunner, Shell, fieldClass } from "@/components/site/exam-runner";
import { candidateLogin, getExamIntro } from "@/lib/exams.functions";

export const Route = createFileRoute("/exam/$token")({
  head: () => ({
    meta: [
      { title: "Online Assessment — Nexus Talent" },
      { name: "description", content: "Secure candidate assessment portal." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ExamPage,
});

function ExamPage() {
  const { token } = Route.useParams();
  const storageKey = `exam-session-${token}`;
  const queryClient = useQueryClient();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSessionToken(window.localStorage.getItem(storageKey));
    setReady(true);
  }, [storageKey]);

  const intro = useQuery({
    queryKey: ["exam-intro", token],
    queryFn: () => getExamIntro({ data: { token } }),
  });

  function onAuthenticated(value: string) {
    window.localStorage.setItem(storageKey, value);
    setSessionToken(value);
    queryClient.invalidateQueries({ queryKey: ["exam-attempt"] });
  }

  function signOut() {
    window.localStorage.removeItem(storageKey);
    setSessionToken(null);
  }

  if (!ready || intro.isLoading) return <Shell>Loading…</Shell>;

  if (intro.isError) {
    return (
      <Shell>
        <h1 className="text-xl font-bold text-primary">Exam temporarily unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We could not reach the exam service. Please refresh in a moment, or contact the
          recruitment team if this keeps happening.
        </p>
      </Shell>
    );
  }

  if (!intro.data) {
    return (
      <Shell>
        <h1 className="text-xl font-bold text-primary">Exam unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This exam link is invalid or the exam is no longer open.
        </p>
      </Shell>
    );
  }


  if (!sessionToken) {
    return <LoginCard token={token} title={intro.data.title} onAuthenticated={onAuthenticated} />;
  }

  return <ExamRunner sessionToken={sessionToken} onSessionInvalid={signOut} />;
}

function LoginCard({
  token,
  title,
  onAuthenticated,
}: {
  token: string;
  title: string;
  onAuthenticated: (sessionToken: string) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => candidateLogin({ data: { token, username, password } }),
    onSuccess: (result) => {
      if (result.ok) onAuthenticated(result.sessionToken);
      else setError(result.error);
    },
    onError: (mutationError: Error) => setError(mutationError.message),
  });


  return (
    <Shell>
      <h1 className="text-2xl font-bold text-primary">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter the username and password provided by the recruitment team.
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
            htmlFor="exam-username"
          >
            Username
          </label>
          <input
            id="exam-username"
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
            htmlFor="exam-password"
          >
            Password
          </label>
          <input
            id="exam-password"
            type="password"
            value={password}
            maxLength={100}
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            className={fieldClass}
          />
        </div>
        {error ? <p className="text-sm font-semibold text-destructive">{error}</p> : null}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-accent disabled:opacity-60"
        >
          {mutation.isPending ? "Signing in…" : "Login"}
        </button>
      </form>
    </Shell>
  );
}
