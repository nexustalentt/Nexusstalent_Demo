import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { supabase } from "@/integrations/supabase/client";
import { recordAudit } from "@/lib/admin-api";
import { createAdminExam } from "@/lib/exams.functions";
import { examDetailsSchema } from "@/lib/exam-schemas";

export const Route = createFileRoute("/_authenticated/admin/exams/new")({
  head: () => ({
    meta: [
      { title: "Create Exam — Nexus Talent Admin" },
      { name: "description", content: "Set up a new assessment." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NewExamPage,
});

const fieldClass =
  "w-full rounded-lg border border-primary/10 bg-card px-4 py-2.5 text-sm outline-none focus:border-accent";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground";

function NewExamPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [passing, setPassing] = useState(60);
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const parsed = examDetailsSchema.safeParse({
        title,
        description,
        duration_minutes: duration,
        passing_percentage: passing,
        instructions,
      });
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the details");
      const data = await createAdminExam({ data: parsed.data });
      try {
        await recordAudit("exam_created", "exam", data.id, { title: data.title });
      } catch (auditErr) {
        console.warn("[audit] exam created:", auditErr);
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success("Exam created — now add questions");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      navigate({ to: "/admin/exams/$examId", params: { examId: data.id } });
    },
    onError: (mutationError: Error) => setError(mutationError.message),
  });

  return (
    <AdminShell
      title="Create New Exam"
      description="Exam details first, then add your questions"
      actions={
        <Link
          to="/admin/exams"
          className="inline-flex items-center gap-2 rounded-full border border-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:border-accent hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back
        </Link>
      }
    >
      <div className="max-w-2xl space-y-5 rounded-2xl border border-primary/5 bg-card p-6">
        <div>
          <label className={labelClass} htmlFor="exam-title">
            Exam name
          </label>
          <input
            id="exam-title"
            value={title}
            maxLength={150}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Aptitude Test"
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="exam-description">
            Description
          </label>
          <textarea
            id="exam-description"
            rows={3}
            value={description}
            maxLength={2000}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Enter description"
            className={fieldClass}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="exam-duration">
              Duration (minutes)
            </label>
            <input
              id="exam-duration"
              type="number"
              min={1}
              max={600}
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="exam-passing">
              Passing score (%)
            </label>
            <input
              id="exam-passing"
              type="number"
              min={0}
              max={100}
              value={passing}
              onChange={(event) => setPassing(Number(event.target.value))}
              className={fieldClass}
            />
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="exam-instructions">
            Instructions
          </label>
          <textarea
            id="exam-instructions"
            rows={4}
            value={instructions}
            maxLength={4000}
            onChange={(event) => setInstructions(event.target.value)}
            placeholder="Enter instructions shown to the candidate before they start"
            className={fieldClass}
          />
        </div>
        {error ? <p className="text-sm font-semibold text-destructive">{error}</p> : null}
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="rounded-full bg-primary px-7 py-2.5 text-sm font-bold text-primary-foreground hover:bg-accent disabled:opacity-60"
        >
          {mutation.isPending ? "Creating…" : "Continue"}
        </button>
      </div>
    </AdminShell>
  );
}
