import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Check,
  Copy,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  GraduationCap,
  Key,
  RefreshCw,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { AdminShell, LoadingBlock, StatusPill } from "@/components/admin/admin-shell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteJobApply, jobApplyQuery, updateJobApply } from "@/lib/admin-api";
import { formatDate } from "@/lib/job-utils";
import {
  jobApplicationStatuses,
  maskPan,
  type JobApplicationStatus,
} from "@/lib/job-application-schema";
import { getResumeDownloadUrl } from "@/lib/job-applications.functions";
import { examsQuery } from "@/lib/exams-api";
import { createCandidateAccess } from "@/lib/exams.functions";
import { candidateAccessSchema } from "@/lib/exam-schemas";
import { formatCandidateCredentials, formatIst, isoToIstLocal } from "@/lib/exam-utils";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/job-applies/$id")({
  head: () => ({
    meta: [
      { title: "Application detail — Nexus Talent Admin" },
      { name: "description", content: "Full candidate application details." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: JobApplyDetail,
});

function generateCandidateCredentials(candidate: {
  first_name: string;
  last_name: string;
  phone?: string | null;
  pan_number?: string | null;
}) {
  const cleanFirst = (candidate.first_name || "candidate")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const suffix = (candidate.pan_number || candidate.phone || "2026")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-4)
    .toLowerCase();

  let defaultUsername = `${cleanFirst}_${suffix || "9999"}`;
  if (defaultUsername.length < 4) {
    defaultUsername = `cand_${defaultUsername}`;
  }

  const phoneDigits = (candidate.phone || "").replace(/\D/g, "").slice(-4);
  const panDigits = (candidate.pan_number || "").replace(/[^a-zA-Z0-9]/g, "").slice(-4);
  const passDigits = phoneDigits || panDigits || "2026";
  const defaultPassword = `Nexus@${passDigits}!`;

  return {
    fullName: `${candidate.first_name || ""} ${candidate.last_name || ""}`.trim(),
    username: defaultUsername,
    password: defaultPassword,
  };
}

const CANDIDATE_PASSWORDS_KEY = "nexus_candidate_passwords";

function getStoredCandidatePasswords(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CANDIDATE_PASSWORDS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredCandidatePassword(username: string, pass: string) {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredCandidatePasswords();
    current[username.toLowerCase()] = pass;
    localStorage.setItem(CANDIDATE_PASSWORDS_KEY, JSON.stringify(current));
  } catch {
    // Ignore
  }
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-primary">{value?.toString().trim() ? value : "—"}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-primary/5 bg-card p-6">
      <h2 className="font-bold text-primary">{title}</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

function JobApplyDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const application = useQuery(jobApplyQuery(id));
  const exams = useQuery(examsQuery);
  const [notes, setNotes] = useState("");
  const [downloading, setDownloading] = useState(false);

  // Assign Exam modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [candFullName, setCandFullName] = useState("");
  const [candUsername, setCandUsername] = useState("");
  const [candPassword, setCandPassword] = useState("");
  const [showCandPassword, setShowCandPassword] = useState(false);
  const [candAccessStart, setCandAccessStart] = useState("");
  const [candAccessEnd, setCandAccessEnd] = useState("");
  const [candDuration, setCandDuration] = useState("");
  const [assignError, setAssignError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{
    examTitle: string;
    publicToken: string;
    fullName: string;
    username: string;
    password: string;
    accessStart: string;
    accessEnd: string;
    duration: number | string;
  } | null>(null);

  const data = application.data;

  // Query existing exam assignments for this candidate
  const candidateExamsQuery = useQuery({
    queryKey: ["admin", "candidate-exams", data?.email, data?.pan_number],
    enabled: !!data,
    queryFn: async () => {
      if (!data) return [];
      const filters = [];
      if (data.email) filters.push(`email.eq.${data.email}`);
      const cleanFirst = data.first_name?.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (cleanFirst) filters.push(`username.ilike.${cleanFirst}%`);

      const query = supabase
        .from("exam_candidates")
        .select("*, exams(id, title, duration_minutes, public_token, status)");

      const { data: rows, error } = filters.length > 0
        ? await query.or(filters.join(","))
        : await query.limit(0);

      if (error) {
        console.warn("Could not query candidate exams:", error.message);
        return [];
      }
      return rows ?? [];
    },
  });

  function openAssignModal() {
    if (!data) return;
    const creds = generateCandidateCredentials(data);
    setCandFullName(creds.fullName);
    setCandUsername(creds.username);
    setCandPassword(creds.password);
    setShowCandPassword(false);
    setCandAccessStart(isoToIstLocal(new Date().toISOString()));
    setCandAccessEnd(
      isoToIstLocal(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()),
    );
    setAssignError(null);
    setCreatedCredentials(null);

    // Default to the first available exam if not already selected
    if (exams.data && exams.data.length > 0 && !selectedExamId) {
      const firstExam = exams.data[0];
      if (firstExam) {
        setSelectedExamId(firstExam.id);
        setCandDuration(String(firstExam.duration_minutes || ""));
      }
    }
    setAssignModalOpen(true);
  }

  function handleExamChange(examId: string) {
    setSelectedExamId(examId);
    const chosen = exams.data?.find((e) => e.id === examId);
    if (chosen) {
      setCandDuration(String(chosen.duration_minutes || ""));
    }
  }

  function regeneratePassword() {
    if (!data) return;
    const randomChars = Math.random().toString(36).slice(-4).toUpperCase();
    const phoneDigits = (data.phone || "").replace(/\D/g, "").slice(-4) || "2026";
    setCandPassword(`Nexus@${randomChars}${phoneDigits}!`);
  }

  async function copyToClipboard(text: string, fieldName: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }

  function getInvitationText(creds: NonNullable<typeof createdCredentials>) {
    const examUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/exam/${creds.publicToken}`
        : `/exam/${creds.publicToken}`;

    return formatCandidateCredentials({
      candidateName: creds.fullName,
      examTitle: creds.examTitle,
      examLink: examUrl,
      username: creds.username,
      password: creds.password,
      accessStart: creds.accessStart,
      accessEnd: creds.accessEnd,
    });
  }

  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!selectedExamId) throw new Error("Please select an exam to assign");
      const chosenExam = exams.data?.find((e) => e.id === selectedExamId);
      if (!chosenExam) throw new Error("Selected exam not found");

      const parsed = candidateAccessSchema.safeParse({
        username: candUsername.trim(),
        password: candPassword,
        full_name: candFullName.trim(),
        email: data?.email?.trim() || undefined,
        access_start_at: candAccessStart,
        access_end_at: candAccessEnd,
        duration_minutes: candDuration === "" ? "" : candDuration,
      });

      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Check candidate credentials");
      }

      await createCandidateAccess({
        data: {
          examId: selectedExamId,
          credentials: parsed.data,
        },
      });

      return {
        examTitle: chosenExam.title,
        publicToken: chosenExam.public_token,
        fullName: parsed.data.full_name || `${data?.first_name} ${data?.last_name}`,
        username: parsed.data.username,
        password: parsed.data.password,
        accessStart: candAccessStart,
        accessEnd: candAccessEnd,
        duration: candDuration || chosenExam.duration_minutes,
      };
    },
    onSuccess: (result) => {
      toast.success("Exam assigned successfully!");
      saveStoredCandidatePassword(result.username, result.password);
      setCreatedCredentials(result);
      setAssignError(null);
      void invalidate();
      void queryClient.invalidateQueries({
        queryKey: ["admin", "candidate-exams", data?.email, data?.pan_number],
      });
    },
    onError: (err: Error) => {
      setAssignError(err.message);
      toast.error(err.message);
    },
  });

  useEffect(() => {
    if (application.data) setNotes(application.data.admin_notes ?? "");
  }, [application.data?.id, application.data?.admin_notes]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin"] });

  const statusMutation = useMutation({
    mutationFn: (status: JobApplicationStatus) => updateJobApply(id, { status }),
    onSuccess: () => {
      toast.success("Status updated");
      void invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const notesMutation = useMutation({
    mutationFn: () => updateJobApply(id, { admin_notes: notes.trim() || null }),
    onSuccess: () => {
      toast.success("Notes saved");
      void invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteJobApply(id),
    onSuccess: () => {
      toast.success("Application deleted");
      void invalidate();
      navigate({ to: "/admin/job-applies" });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  async function downloadResume() {
    setDownloading(true);
    try {
      const { url } = await getResumeDownloadUrl({ data: { applicationId: id } });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Could not open the resume");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <AdminShell
      title={data ? `${data.first_name} ${data.last_name}` : "Application"}
      description={data ? `Application ID ${data.application_code}` : ""}
      actions={
        <Link
          to="/admin/job-applies"
          className="inline-flex items-center gap-2 rounded-full border border-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:border-accent hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back
        </Link>
      }
    >
      {application.isPending ? (
        <LoadingBlock rows={5} />
      ) : !data ? (
        <p className="text-sm text-muted-foreground">This application no longer exists.</p>
      ) : (
        <div className="space-y-6">
          <section className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-primary/5 bg-card p-6">
            <div className="flex flex-wrap items-center gap-4">
              <StatusPill status={data.status} />
              <select
                aria-label="Change status"
                value={data.status}
                disabled={statusMutation.isPending}
                onChange={(event) =>
                  statusMutation.mutate(event.target.value as JobApplicationStatus)
                }
                className="rounded-lg border border-primary/10 bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
              >
                {jobApplicationStatuses.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-muted-foreground">
                Applied {formatDate(data.created_at)} for{" "}
                <span className="font-semibold text-primary">
                  {data.jobs?.title ?? data.job_title ?? "—"}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={openAssignModal}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground hover:bg-accent/90 shadow-sm transition-colors"
              >
                <GraduationCap className="size-4" aria-hidden="true" /> Assign Exam
              </button>
              <button
                type="button"
                onClick={() => void downloadResume()}
                disabled={downloading}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-accent disabled:opacity-60"
              >
                <Download className="size-4" aria-hidden="true" />
                {downloading ? "Preparing…" : "Resume"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Delete this application permanently?")) {
                    deleteMutation.mutate();
                  }
                }}
                className="inline-flex items-center gap-2 rounded-full border border-destructive/20 px-5 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/5"
              >
                <Trash2 className="size-4" aria-hidden="true" /> Delete
              </button>
            </div>
          </section>

          {candidateExamsQuery.data && candidateExamsQuery.data.length > 0 ? (
            <section className="rounded-2xl border border-accent/20 bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-primary flex items-center gap-2">
                    <GraduationCap className="size-5 text-accent" />
                    Assigned Assessments
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Assessments assigned to this candidate
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAssignModal}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/10 px-4 py-1.5 text-xs font-semibold text-primary hover:border-accent hover:text-accent"
                >
                  <GraduationCap className="size-3.5" /> Assign another exam
                </button>
              </div>

              <div className="mt-4 divide-y divide-primary/5">
                {candidateExamsQuery.data.map((item) => (
                  <div key={item.id} className="py-3 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-primary">
                          {item.exams?.title || "Assessment"}
                        </p>
                        {item.exams?.status ? (
                          <StatusPill status={item.exams.status} />
                        ) : null}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          Username: <strong className="font-mono text-foreground">{item.username}</strong>
                        </span>
                        {(() => {
                          const isSha256 =
                            typeof item.password_hash === "string" &&
                            /^[0-9a-f]{64}$/i.test(item.password_hash);
                          const itemPassword =
                            (item as { password_note?: string }).password_note ||
                            (!isSha256 && item.password_hash ? item.password_hash : null) ||
                            getStoredCandidatePasswords()[item.username?.toLowerCase() || ""];
                          return itemPassword ? (
                            <span className="inline-flex items-center gap-1.5">
                              Password:{" "}
                              <strong className="font-mono text-foreground bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                                {itemPassword}
                              </strong>
                              <button
                                type="button"
                                onClick={() => void copyToClipboard(itemPassword, `pwd-${item.id}`)}
                                className="inline-flex items-center gap-1 font-semibold text-accent hover:underline ml-0.5"
                                title="Copy password"
                              >
                                {copiedField === `pwd-${item.id}` ? (
                                  <Check className="size-3 text-emerald-600 inline" />
                                ) : (
                                  <Copy className="size-3 inline" />
                                )}
                                {copiedField === `pwd-${item.id}` ? "Copied" : "Copy"}
                              </button>
                            </span>
                          ) : null;
                        })()}
                        {item.access_start_at || item.access_end_at ? (
                          <span>
                            Window: {formatIst(item.access_start_at) || "Anytime"} → {formatIst(item.access_end_at) || "No end"}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const isSha256 =
                            typeof item.password_hash === "string" &&
                            /^[0-9a-f]{64}$/i.test(item.password_hash);
                          const itemPassword =
                            (item as { password_note?: string }).password_note ||
                            (!isSha256 && item.password_hash ? item.password_hash : null) ||
                            getStoredCandidatePasswords()[item.username?.toLowerCase() || ""];
                          const examUrl = item.exams?.public_token
                            ? `${window.location.origin}/exam/${item.exams.public_token}`
                            : null;
                          const allText = formatCandidateCredentials({
                            candidateName: `${data.first_name} ${data.last_name}`,
                            examTitle: item.exams?.title,
                            examLink: examUrl,
                            username: item.username,
                            password: itemPassword,
                            accessStart: item.access_start_at,
                            accessEnd: item.access_end_at,
                          });
                          void copyToClipboard(allText, `all-${item.id}`);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 hover:bg-accent/20 text-accent px-3 py-1 text-xs font-bold transition-colors"
                        title="Copy all candidate assessment credentials"
                      >
                        {copiedField === `all-${item.id}` ? (
                          <>
                            <Check className="size-3 text-emerald-600" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" /> Copy
                          </>
                        )}
                      </button>
                      {item.exams?.public_token ? (
                        <button
                          type="button"
                          onClick={() => {
                            const url = `${window.location.origin}/exam/${item.exams.public_token}`;
                            void copyToClipboard(url, `url-${item.id}`);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                        >
                          <Copy className="size-3" />
                          {copiedField === `url-${item.id}` ? "Copied" : "Copy link"}
                        </button>
                      ) : null}
                      {item.exams?.id ? (
                        <Link
                          to="/admin/exams/$examId"
                          params={{ examId: item.exams.id }}
                          className="inline-flex items-center gap-1 rounded-full border border-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:border-accent hover:text-accent"
                        >
                          View exam <ExternalLink className="size-3" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <Section title="Personal details">
            <Row label="Full name" value={`${data.first_name} ${data.last_name}`} />
            <Row label="Email" value={data.email} />
            <Row label="Phone" value={data.phone} />
            <Row label="Date of birth" value={formatDate(data.date_of_birth)} />
            <Row label="Gender" value={data.gender} />
            <Row label="Current location" value={data.current_location} />
            <Row label="Preferred location" value={data.preferred_location} />
            <Row label="PAN" value={maskPan(data.pan_number)} />
          </Section>

          <Section title="Education details">
            <Row label="Highest qualification" value={data.highest_qualification} />
            <Row label="Specialization" value={data.specialization} />
            <Row label="College / university" value={data.college} />
            <Row label="Marks / CGPA" value={data.marks} />
            <Row label="Year of passing" value={String(data.year_of_passing ?? "")} />
          </Section>

          <Section title="Technical details">
            <Row label="Primary skills" value={data.primary_skills} />
            <Row label="Secondary skills" value={data.secondary_skills} />
            <Row label="Programming languages" value={data.programming_languages} />
            <Row label="Tools / technologies" value={data.tools_technologies} />
            <Row label="Certifications" value={data.certifications} />
          </Section>

          <Section title="Experience details">
            <Row
              label="Experience type"
              value={data.experience_type === "fresher" ? "Fresher" : "Experienced"}
            />
            <Row label="Total experience" value={data.total_experience} />
            <Row label="Relevant experience" value={data.relevant_experience} />
            <Row label="Current company" value={data.current_company} />
            <Row label="Current job title" value={data.current_job_title} />
            <Row label="Current CTC" value={data.current_ctc} />
            <Row label="Expected CTC" value={data.expected_ctc} />
            <Row label="Notice period" value={data.notice_period} />
          </Section>

          <Section title="Additional details">
            <Row label="Resume" value={data.resume_name} />
            <Row label="LinkedIn" value={data.linkedin_url} />
            <Row label="GitHub" value={data.github_url} />
            <Row label="Portfolio" value={data.portfolio_url} />
            <Row
              label="Willing to relocate"
              value={data.willing_to_relocate == null ? "—" : data.willing_to_relocate ? "Yes" : "No"}
            />
            <Row label="Availability to join" value={data.availability_to_join} />
            <Row label="Heard about us" value={data.heard_about_us} />
          </Section>

          {data.cover_letter ? (
            <section className="rounded-2xl border border-primary/5 bg-card p-6">
              <h2 className="font-bold text-primary">Cover letter</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {data.cover_letter}
              </p>
            </section>
          ) : null}

          <section className="rounded-2xl border border-primary/5 bg-card p-6">
            <h2 className="font-bold text-primary">Internal notes</h2>
            <textarea
              rows={4}
              maxLength={4000}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Interview feedback, screening notes…"
              className="mt-4 w-full rounded-lg border border-primary/10 bg-background px-4 py-3 text-sm outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={() => notesMutation.mutate()}
              disabled={notesMutation.isPending}
              className="mt-4 inline-flex rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-accent-foreground disabled:opacity-60"
            >
              {notesMutation.isPending ? "Saving…" : "Save notes"}
            </button>
          </section>

          {/* Assign Exam Modal Dialog */}
          <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-bold text-primary">
                  <GraduationCap className="size-6 text-accent" />
                  Assign Exam to Candidate
                </DialogTitle>
                <DialogDescription>
                  Select an exam and provide access credentials for{" "}
                  <strong className="text-foreground">
                    {data.first_name} {data.last_name}
                  </strong>
                  .
                </DialogDescription>
              </DialogHeader>

              {createdCredentials ? (
                <div className="space-y-4 py-2">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-300">
                    <div className="flex items-center gap-2 font-bold text-base">
                      <Check className="size-5 text-emerald-600 dark:text-emerald-400" />
                      Candidate access created successfully!
                    </div>
                    <p className="mt-1 text-xs">
                      The candidate can now sign in and take the assessment with the credentials below.
                    </p>
                  </div>

                  <div className="space-y-3 rounded-xl border border-primary/10 bg-surface p-4 text-sm">
                    <div className="flex items-center justify-between border-b border-primary/5 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Exam</span>
                      <span className="font-semibold text-primary">{createdCredentials.examTitle}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-primary/5 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Candidate</span>
                      <span className="font-semibold text-primary">{createdCredentials.fullName}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-primary/5 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Exam Link</span>
                      <div className="flex items-center gap-2">
                        <span className="max-w-[200px] truncate text-xs font-mono text-accent">
                          {typeof window !== "undefined"
                            ? `${window.location.origin}/exam/${createdCredentials.publicToken}`
                            : `/exam/${createdCredentials.publicToken}`}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              `${window.location.origin}/exam/${createdCredentials.publicToken}`,
                              "exam-link",
                            )
                          }
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/5"
                        >
                          {copiedField === "exam-link" ? (
                            <Check className="size-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-primary/5 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Username</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground">
                          {createdCredentials.username}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(createdCredentials.username, "username")}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/5"
                        >
                          {copiedField === "username" ? (
                            <Check className="size-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-primary/5 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground">
                          {showCandPassword ? createdCredentials.password : "••••••••••••"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowCandPassword(!showCandPassword)}
                          className="rounded p-1 text-muted-foreground hover:text-foreground"
                          title={showCandPassword ? "Hide password" : "Show password"}
                        >
                          {showCandPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(createdCredentials.password, "password")}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/5"
                        >
                          {copiedField === "password" ? (
                            <Check className="size-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {createdCredentials.accessStart || createdCredentials.accessEnd ? (
                      <div className="flex items-center justify-between border-b border-primary/5 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Window (IST)</span>
                        <span className="text-xs text-muted-foreground">
                          {createdCredentials.accessStart ? formatIst(createdCredentials.accessStart) : "Anytime"} →{" "}
                          {createdCredentials.accessEnd ? formatIst(createdCredentials.accessEnd) : "No end"}
                        </span>
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Duration</span>
                      <span className="text-xs font-semibold text-foreground">{createdCredentials.duration} mins</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const text = getInvitationText(createdCredentials);
                        void copyToClipboard(text, "all-creds");
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground hover:bg-accent/90 shadow-sm"
                    >
                      {copiedField === "all-creds" ? (
                        <>
                          <Check className="size-4" /> Copied Invitation!
                        </>
                      ) : (
                        <>
                          <Copy className="size-4" /> Copy Full Invitation
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignModalOpen(false)}
                      className="rounded-full border border-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:border-accent hover:text-accent"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  {/* Exam selection */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Select Exam <span className="text-destructive">*</span>
                    </label>
                    {exams.isLoading ? (
                      <p className="text-xs text-muted-foreground">Loading exams…</p>
                    ) : !exams.data || exams.data.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-primary/20 p-4 text-center">
                        <p className="text-sm font-semibold text-primary">No exams created yet</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Please create an exam first to assign it to candidates.
                        </p>
                        <Link
                          to="/admin/exams/new"
                          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground hover:bg-accent"
                        >
                          Create New Exam
                        </Link>
                      </div>
                    ) : (
                      <select
                        value={selectedExamId}
                        onChange={(e) => handleExamChange(e.target.value)}
                        className="w-full rounded-lg border border-primary/10 bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
                      >
                        <option value="" disabled>
                          Select an exam…
                        </option>
                        {exams.data.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.title} ({item.duration_minutes} mins · {item.question_count ?? 0} questions · {item.status})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Candidate Full Name */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Candidate Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <input
                        value={candFullName}
                        maxLength={120}
                        onChange={(e) => setCandFullName(e.target.value)}
                        placeholder="Candidate full name"
                        className="w-full rounded-lg border border-primary/10 bg-background pl-9 pr-4 py-2.5 text-sm outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Username (for candidate login) <span className="text-destructive">*</span>
                    </label>
                    <input
                      value={candUsername}
                      maxLength={60}
                      autoComplete="off"
                      onChange={(e) => setCandUsername(e.target.value)}
                      placeholder="e.g. john_9876"
                      className="w-full rounded-lg border border-primary/10 bg-background px-4 py-2.5 text-sm font-mono outline-none focus:border-accent"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Auto-generated from candidate&apos;s name and PAN / phone. Letters, numbers, dot, dash, underscore.
                    </p>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Password <span className="text-destructive">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={regeneratePassword}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                      >
                        <RefreshCw className="size-3" /> Regenerate
                      </button>
                    </div>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <input
                        type={showCandPassword ? "text" : "password"}
                        value={candPassword}
                        maxLength={100}
                        autoComplete="new-password"
                        onChange={(e) => setCandPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full rounded-lg border border-primary/10 bg-background pl-9 pr-10 py-2.5 text-sm font-mono outline-none focus:border-accent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCandPassword(!showCandPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        title={showCandPassword ? "Hide password" : "Show password"}
                      >
                        {showCandPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Pre-filled default secure password (min 8 characters).
                    </p>
                  </div>

                  {/* Access Window: Start & End (IST) */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Access Start (IST)
                      </label>
                      <input
                        type="datetime-local"
                        value={candAccessStart}
                        onChange={(e) => setCandAccessStart(e.target.value)}
                        className="w-full rounded-lg border border-primary/10 bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Access End (IST)
                      </label>
                      <input
                        type="datetime-local"
                        value={candAccessEnd}
                        onChange={(e) => setCandAccessEnd(e.target.value)}
                        className="w-full rounded-lg border border-primary/10 bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  {/* Duration override */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Time Limit Override (Minutes, optional)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={600}
                      value={candDuration}
                      onChange={(e) => setCandDuration(e.target.value)}
                      placeholder="Leave empty to use exam default"
                      className="w-full rounded-lg border border-primary/10 bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </div>

                  {assignError ? (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                      {assignError}
                    </div>
                  ) : null}

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setAssignModalOpen(false)}
                      className="rounded-full border border-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:border-accent hover:text-accent"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => assignMutation.mutate()}
                      disabled={assignMutation.isPending || !selectedExamId || !candUsername || !candPassword}
                      className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-accent-foreground hover:bg-accent/90 disabled:opacity-60 shadow-sm"
                    >
                      <GraduationCap className="size-4" />
                      {assignMutation.isPending ? "Assigning…" : "Assign Exam & Generate Access"}
                    </button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}
    </AdminShell>
  );
}
