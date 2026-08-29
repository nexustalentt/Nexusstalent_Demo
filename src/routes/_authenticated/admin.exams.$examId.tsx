import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowDown, ArrowUp, Copy, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, EmptyState, LoadingBlock, StatusPill } from "@/components/admin/admin-shell";
import { QuestionEditor, type QuestionDraft } from "@/components/admin/question-editor";
import { QuestionBankImport } from "@/components/admin/question-bank-import";
import { letterLabel, type ParsedQuestion } from "@/lib/question-bank-parser";
import { supabase } from "@/integrations/supabase/client";
import { recordAudit } from "@/lib/admin-api";
import { candidateAccessSchema, examDetailsSchema } from "@/lib/exam-schemas";
import { questionTypeLabel } from "@/lib/exam-utils";
import {
  deleteQuestion,
  duplicateQuestion,
  examCandidatesQuery,
  examQuery,
  examQuestionsQuery,
  nextPosition,
  reorderQuestion,
  setExamStatus,
  type ExamQuestionRow,
  type ExamRow,
} from "@/lib/exams-api";
import { createCandidateAccess } from "@/lib/exams.functions";

export const Route = createFileRoute("/_authenticated/admin/exams/$examId")({
  head: () => ({
    meta: [
      { title: "Edit Exam — Nexus Talent Admin" },
      { name: "description", content: "Add questions, publish and share the exam." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ExamBuilder,
});

const fieldClass =
  "w-full rounded-lg border border-primary/10 bg-card px-4 py-2.5 text-sm outline-none focus:border-accent";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground";

function ExamBuilder() {
  const { examId } = Route.useParams();
  const queryClient = useQueryClient();
  const exam = useQuery(examQuery(examId));
  const questions = useQuery(examQuestionsQuery(examId));
  const candidates = useQuery(examCandidatesQuery(examId));

  const [tab, setTab] = useState<"questions" | "answers">("questions");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<ExamQuestionRow | null>(null);
  const [details, setDetails] = useState<null | {
    title: string;
    description: string;
    duration_minutes: number;
    passing_percentage: number;
    instructions: string;
  }>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [accessError, setAccessError] = useState<string | null>(null);
  const [accessStart, setAccessStart] = useState("");
  const [accessEnd, setAccessEnd] = useState("");
  const [candidateDuration, setCandidateDuration] = useState("");

  useEffect(() => {
    if (exam.data && !details) {
      setDetails({
        title: exam.data.title,
        description: exam.data.description ?? "",
        duration_minutes: exam.data.duration_minutes,
        passing_percentage: Number(exam.data.passing_percentage),
        instructions: exam.data.instructions ?? "",
      });
    }
  }, [exam.data, details]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin"] });

  const detailsMutation = useMutation({
    mutationFn: async () => {
      const parsed = examDetailsSchema.safeParse(details);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the details");
      const { error } = await supabase
        .from("exams")
        .update({
          title: parsed.data.title,
          description: parsed.data.description || null,
          duration_minutes: parsed.data.duration_minutes,
          passing_percentage: parsed.data.passing_percentage,
          instructions: parsed.data.instructions || null,
        })
        .eq("id", examId);
      if (error) throw new Error(error.message);
      await recordAudit("exam_updated", "exam", examId, { title: parsed.data.title });
    },
    onSuccess: () => {
      toast.success("Exam details saved");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const saveQuestionMutation = useMutation({
    mutationFn: async (draft: QuestionDraft) => {
      const payload = {
        question_type: draft.question_type,
        prompt: draft.prompt,
        options: draft.options as never,
        correct_options: draft.correct_options as never,
        expected_answer: draft.expected_answer || null,
        marks: draft.marks,
      };
      if (editing) {
        const { error } = await supabase.from("exam_questions").update(payload).eq("id", editing.id);
        if (error) throw new Error(error.message);
      } else {
        const position = await nextPosition(examId);
        const { error } = await supabase
          .from("exam_questions")
          .insert({ ...payload, exam_id: examId, position });
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Question saved");
      setAdding(false);
      setEditing(null);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const bulkImportMutation = useMutation({
    mutationFn: async ({
      items,
      mode,
    }: {
      items: ParsedQuestion[];
      mode: "append" | "replace";
    }) => {
      if (mode === "replace") {
        const { error } = await supabase.from("exam_questions").delete().eq("exam_id", examId);
        if (error) throw new Error(error.message);
      }
      const start = mode === "replace" ? 0 : await nextPosition(examId);
      const rows = items.map((item, index) => ({
        exam_id: examId,
        position: start + index,
        question_type: item.question_type,
        prompt: item.prompt,
        options: item.options as never,
        correct_options: item.correct_options as never,
        expected_answer: null,
        marks: item.marks,
      }));
      const { error } = await supabase.from("exam_questions").insert(rows);
      if (error) throw new Error(error.message);
      await recordAudit("exam_questions_imported", "exam", examId, { count: rows.length, mode });
      return rows.length;
    },
    onSuccess: (count) => {
      toast.success(`${count} questions added`);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const questionActionMutation = useMutation({
    mutationFn: async (action:
      | { type: "delete"; question: ExamQuestionRow }
      | { type: "duplicate"; question: ExamQuestionRow }
      | { type: "move"; question: ExamQuestionRow; direction: -1 | 1 }) => {
      if (action.type === "delete") return deleteQuestion(action.question);
      if (action.type === "duplicate") return duplicateQuestion(action.question);
      return reorderQuestion(questions.data ?? [], action.question.id, action.direction);
    },
    onSuccess: () => invalidate(),
    onError: (error: Error) => toast.error(error.message),
  });

  const statusMutation = useMutation({
    mutationFn: ({ target, status }: { target: ExamRow; status: "draft" | "published" | "closed" }) =>
      setExamStatus(target, status),
    onSuccess: () => {
      toast.success("Exam status updated");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const accessMutation = useMutation({
    mutationFn: async () => {
      const parsed = candidateAccessSchema.safeParse({
        username,
        password,
        full_name: fullName,
        access_start_at: accessStart,
        access_end_at: accessEnd,
        duration_minutes: candidateDuration === "" ? "" : candidateDuration,
      });
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check credentials");
      await createCandidateAccess({ data: { examId, credentials: parsed.data } });
    },
    onSuccess: () => {
      toast.success("Candidate access created");
      setUsername("");
      setPassword("");
      setFullName("");
      setAccessStart("");
      setAccessEnd("");
      setCandidateDuration("");
      setAccessError(null);
      invalidate();
    },
    onError: (error: Error) => setAccessError(error.message),
  });

  const list = questions.data ?? [];
  const totalMarks = list.reduce((sum, question) => sum + (Number(question.marks) || 0), 0);
  const examLink =
    typeof window !== "undefined" && exam.data
      ? `${window.location.origin}/exam/${exam.data.public_token}`
      : "";

  if (exam.isLoading || !details) {
    return (
      <AdminShell title="Exam">
        <LoadingBlock />
      </AdminShell>
    );
  }

  if (!exam.data) {
    return (
      <AdminShell title="Exam">
        <EmptyState title="Exam not found" hint="It may have been deleted." />
      </AdminShell>
    );
  }

  const examRow = exam.data;

  return (
    <AdminShell
      title={exam.data.title}
      description={`${list.length} questions · ${totalMarks} total marks · ${exam.data.duration_minutes} minutes`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/exams/submissions/$examId"
            params={{ examId }}
            className="rounded-full border border-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:border-accent hover:text-accent"
          >
            View submissions
          </Link>
          <Link
            to="/admin/exams"
            className="inline-flex items-center gap-2 rounded-full border border-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:border-accent hover:text-accent"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Back
          </Link>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <section className="space-y-5 rounded-2xl border border-primary/5 bg-card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary">Exam details</h2>
            <div>
              <label className={labelClass} htmlFor="exam-title">
                Exam name
              </label>
              <input
                id="exam-title"
                value={details.title}
                maxLength={150}
                onChange={(event) => setDetails({ ...details, title: event.target.value })}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="exam-description">
                Description
              </label>
              <textarea
                id="exam-description"
                rows={2}
                value={details.description}
                maxLength={2000}
                onChange={(event) => setDetails({ ...details, description: event.target.value })}
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
                  value={details.duration_minutes}
                  onChange={(event) =>
                    setDetails({ ...details, duration_minutes: Number(event.target.value) })
                  }
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
                  value={details.passing_percentage}
                  onChange={(event) =>
                    setDetails({ ...details, passing_percentage: Number(event.target.value) })
                  }
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
                rows={3}
                value={details.instructions}
                maxLength={4000}
                onChange={(event) => setDetails({ ...details, instructions: event.target.value })}
                className={fieldClass}
              />
            </div>
            <button
              type="button"
              onClick={() => detailsMutation.mutate()}
              disabled={detailsMutation.isPending}
              className="rounded-full border border-primary/10 px-6 py-2.5 text-sm font-semibold text-primary hover:border-accent hover:text-accent disabled:opacity-60"
            >
              {detailsMutation.isPending ? "Saving…" : "Save draft"}
            </button>
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary">
                Questions ({list.length})
              </h2>
              {!adding && !editing ? (
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-accent"
                >
                  <Plus className="size-4" aria-hidden="true" /> Add Question
                </button>
              ) : null}
            </div>

            {adding || editing ? (
              <QuestionEditor
                question={editing}
                pending={saveQuestionMutation.isPending}
                onCancel={() => {
                  setAdding(false);
                  setEditing(null);
                }}
                onSave={(draft) => saveQuestionMutation.mutate(draft)}
              />
            ) : null}

            {questions.isLoading ? <LoadingBlock rows={2} /> : null}
            {list.length === 0 && !adding ? (
              <EmptyState title="No questions yet" hint="Add your first question to build the exam." />
            ) : null}

            <ol className="space-y-3">
              {list.map((question, index) => (
                <li key={question.id} className="rounded-2xl border border-primary/5 bg-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {index + 1}. {questionTypeLabel(question.question_type)} ·{" "}
                        {Number(question.marks)} {Number(question.marks) === 1 ? "mark" : "marks"}
                      </p>
                      <p className="mt-1 font-semibold text-primary">{question.prompt}</p>
                      {Array.isArray(question.options) && question.options.length > 0 ? (
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                          {(question.options as string[]).map((option, optionIndex) => {
                            const correct = Array.isArray(question.correct_options)
                              ? (question.correct_options as number[]).map(Number)
                              : [];
                            return (
                              <li key={optionIndex}>
                                {correct.includes(optionIndex) ? "●" : "○"} {option}
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                      {question.expected_answer ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Expected: {question.expected_answer}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Move up"
                        onClick={() =>
                          questionActionMutation.mutate({ type: "move", question, direction: -1 })
                        }
                        className="rounded-lg border border-primary/10 p-2 text-muted-foreground hover:border-accent hover:text-accent"
                      >
                        <ArrowUp className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label="Move down"
                        onClick={() =>
                          questionActionMutation.mutate({ type: "move", question, direction: 1 })
                        }
                        className="rounded-lg border border-primary/10 p-2 text-muted-foreground hover:border-accent hover:text-accent"
                      >
                        <ArrowDown className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label="Duplicate question"
                        onClick={() => questionActionMutation.mutate({ type: "duplicate", question })}
                        className="rounded-lg border border-primary/10 p-2 text-muted-foreground hover:border-accent hover:text-accent"
                      >
                        <Copy className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAdding(false);
                          setEditing(question);
                        }}
                        className="rounded-lg border border-primary/10 px-3 py-2 text-xs font-bold text-primary hover:border-accent hover:text-accent"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        aria-label="Delete question"
                        onClick={() => {
                          if (window.confirm("Delete this question?")) {
                            questionActionMutation.mutate({ type: "delete", question });
                          }
                        }}
                        className="rounded-lg border border-primary/10 p-2 text-muted-foreground hover:border-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
          ) : (
          <section className="space-y-4 rounded-2xl border border-primary/5 bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary">
                Answer key ({list.length})
              </h2>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    list
                      .map((question, index) => `${index + 1} - ${answerLetters(question)}`)
                      .join("\n"),
                  );
                  toast.success("Answer key copied");
                }}
                className="inline-flex items-center gap-2 rounded-full border border-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:border-accent hover:text-accent"
              >
                <Copy className="size-4" aria-hidden="true" /> Copy answer key
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Candidates never see this key — it stays inside the admin portal.
            </p>
            {list.length === 0 ? (
              <EmptyState title="No questions yet" hint="Paste a question bank to generate the key." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-primary/10 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="py-2 pr-4">Question</th>
                      <th className="py-2 pr-4">Question text</th>
                      <th className="py-2 pr-4">Correct answer</th>
                      <th className="py-2">Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((question, index) => (
                      <tr key={question.id} className="border-b border-primary/5">
                        <td className="py-2.5 pr-4 font-bold text-primary">{index + 1}</td>
                        <td className="max-w-md truncate py-2.5 pr-4 text-muted-foreground">
                          {question.prompt}
                        </td>
                        <td className="py-2.5 pr-4 font-bold text-accent">
                          {answerLetters(question)}
                        </td>
                        <td className="py-2.5 text-muted-foreground">{Number(question.marks)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-primary/5 bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary">Publishing</h2>
              <StatusPill status={exam.data.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              Publishing generates the secure candidate link. Candidates still need a username and
              password to enter.
            </p>
            <div className="flex flex-wrap gap-2">
              {exam.data.status !== "published" ? (
                <button
                  type="button"
                  disabled={list.length === 0 || statusMutation.isPending}
                  onClick={() => statusMutation.mutate({ target: examRow, status: "published" })}
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-accent disabled:opacity-60"
                >
                  Publish
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => statusMutation.mutate({ target: examRow, status: "closed" })}
                  className="rounded-full border border-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:border-destructive hover:text-destructive"
                >
                  Close exam
                </button>
              )}
              {exam.data.status === "closed" ? (
                <button
                  type="button"
                  onClick={() => statusMutation.mutate({ target: examRow, status: "draft" })}
                  className="rounded-full border border-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:border-accent hover:text-accent"
                >
                  Back to draft
                </button>
              ) : null}
            </div>
            {exam.data.status === "published" ? (
              <div className="space-y-2 rounded-lg bg-surface p-4">
                <p className={labelClass}>Exam link</p>
                <p className="break-all text-sm font-semibold text-primary">{examLink}</p>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(examLink);
                    toast.success("Link copied");
                  }}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-accent"
                >
                  <Copy className="size-4" aria-hidden="true" /> Copy link
                </button>
              </div>
            ) : null}
          </section>

          <section className="space-y-4 rounded-2xl border border-primary/5 bg-card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary">
              Candidate access
            </h2>
            <div>
              <label className={labelClass} htmlFor="candidate-name">
                Candidate name (optional)
              </label>
              <input
                id="candidate-name"
                value={fullName}
                maxLength={120}
                onChange={(event) => setFullName(event.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="candidate-username">
                Username
              </label>
              <input
                id="candidate-username"
                value={username}
                maxLength={60}
                autoComplete="off"
                onChange={(event) => setUsername(event.target.value)}
                placeholder="candidate123"
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="candidate-password">
                Password
              </label>
              <input
                id="candidate-password"
                type="password"
                value={password}
                maxLength={100}
                autoComplete="new-password"
                onChange={(event) => setPassword(event.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="candidate-start">
                  Access from (optional)
                </label>
                <input
                  id="candidate-start"
                  type="datetime-local"
                  value={accessStart}
                  onChange={(event) => setAccessStart(event.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="candidate-end">
                  Access until (optional)
                </label>
                <input
                  id="candidate-end"
                  type="datetime-local"
                  value={accessEnd}
                  onChange={(event) => setAccessEnd(event.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="candidate-duration">
                Time limit override in minutes (optional)
              </label>
              <input
                id="candidate-duration"
                type="number"
                min={1}
                max={600}
                value={candidateDuration}
                onChange={(event) => setCandidateDuration(event.target.value)}
                placeholder={String(exam.data?.duration_minutes ?? "")}
                className={fieldClass}
              />
            </div>
            {accessError ? (
              <p className="text-sm font-semibold text-destructive">{accessError}</p>
            ) : null}
            <button
              type="button"
              onClick={() => accessMutation.mutate()}
              disabled={accessMutation.isPending}
              className="w-full rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-accent disabled:opacity-60"
            >
              {accessMutation.isPending ? "Creating…" : "Create access"}
            </button>
            <ul className="space-y-2 text-sm">
              {(candidates.data ?? []).map((candidate) => (
                <li key={candidate.id} className="rounded-lg bg-surface px-3 py-2">
                  <span className="font-semibold text-primary">{candidate.username}</span>
                  {candidate.full_name ? (
                    <span className="text-muted-foreground"> · {candidate.full_name}</span>
                  ) : null}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              Passwords are stored hashed and cannot be read back. Re-submitting the same username
              resets that candidate&apos;s password, window and time limit. Candidates can also sign
              in from the public Exam page with just this username and password.
            </p>

          </section>
        </aside>
      </div>
    </AdminShell>
  );
}
