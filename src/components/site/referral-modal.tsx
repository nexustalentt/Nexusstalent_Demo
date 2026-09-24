import { useState } from "react";
import { CheckCircle2, FileText, Loader2, Upload, UserPlus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { submitJobReferral } from "@/lib/job-referrals.functions";

interface ReferralModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: {
    id: string;
    title: string;
    location?: string | null;
  };
}

interface FormState {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
}

export function ReferralModal({ open, onOpenChange, job }: ReferralModalProps) {
  const [values, setValues] = useState<FormState>({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
  });
  const [resume, setResume] = useState<{ file: File; name: string; base64: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  function resetForm() {
    setValues({
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
    });
    setResume(null);
    setErrors({});
    setServerError(null);
    setSuccessCode(null);
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  }

  function handleInputChange(field: keyof FormState, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        resume: "Resume file must be smaller than 5 MB",
      }));
      return;
    }

    // Check extension
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    const allowed = [".pdf", ".doc", ".docx"];
    if (!allowed.includes(extension)) {
      setErrors((prev) => ({
        ...prev,
        resume: "Please upload a valid document (.pdf, .doc, or .docx)",
      }));
      return;
    }

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read file"));
        reader.readAsDataURL(file);
      });

      setResume({ file, name: file.name, base64 });
      setErrors((prev) => ({ ...prev, resume: "" }));
    } catch {
      setErrors((prev) => ({
        ...prev,
        resume: "Error reading resume file. Please try again.",
      }));
    }
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};

    if (!values.first_name.trim()) {
      nextErrors.first_name = "First name is required";
    }

    if (!values.last_name.trim()) {
      nextErrors.last_name = "Last name is required";
    }

    const phoneTrimmed = values.phone.trim();
    if (!phoneTrimmed) {
      nextErrors.phone = "Phone number is required";
    } else if (!/^[+0-9\s().-]{7,25}$/.test(phoneTrimmed)) {
      nextErrors.phone = "Please enter a valid phone number (at least 7 digits)";
    }

    const emailTrimmed = values.email.trim();
    if (!emailTrimmed) {
      nextErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      nextErrors.email = "Please enter a valid email address (e.g. name@example.com)";
    }

    if (!resume) {
      nextErrors.resume = "Please upload candidate's resume (.pdf, .doc, .docx)";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    const payload = {
      job_id: job.id,
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      resume_name: resume!.name,
      resume_base64: resume!.base64,
    };

    try {
      // 1. Primary path: TanStack Start Server Function
      const result = await submitJobReferral({ data: payload });
      if (result.ok) {
        setSuccessCode(result.referralCode);
        return;
      }
      // If server function returns handled error
      setServerError(result.error || "Failed to submit referral. Please try again.");
    } catch (err: unknown) {
      // 2. Fallback path: REST API route /api/public/referrals
      try {
        const response = await fetch("/api/public/referrals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (response.ok && data.ok) {
          setSuccessCode(data.referral_code);
          return;
        }
        setServerError(data.error || "Failed to submit referral. Please check your details.");
      } catch (fallbackErr: unknown) {
        console.error("[ReferralModal] submission error:", err, fallbackErr);
        setServerError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while submitting your referral. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl border-primary/10 bg-background shadow-2xl">
        {/* Header */}
        <div className="bg-primary px-6 py-5 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground font-bold shadow-sm">
              <UserPlus className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-primary-foreground">
                Refer a Candidate
              </DialogTitle>
              <DialogDescription className="text-xs text-primary-foreground/80">
                Position: <span className="font-semibold text-accent">{job.title}</span>
                {job.location ? ` • ${job.location}` : ""}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6">
          {successCode ? (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
                <CheckCircle2 className="size-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">Referral Submitted!</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Thank you for referring{" "}
                  <span className="font-semibold text-primary">
                    {values.first_name} {values.last_name}
                  </span>{" "}
                  for the <span className="font-semibold text-primary">{job.title}</span> position.
                </p>
                <div className="mt-4 inline-block rounded-xl border border-primary/10 bg-surface px-4 py-2 font-mono text-xs text-primary">
                  Referral ID: <span className="font-bold text-accent">{successCode}</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-primary/20 px-6 py-2.5 text-xs font-semibold text-primary hover:border-accent hover:text-accent transition-colors"
                >
                  Refer Another Candidate
                </button>
                <button
                  type="button"
                  onClick={() => handleClose(false)}
                  className="rounded-full bg-accent px-6 py-2.5 text-xs font-bold text-accent-foreground hover:bg-accent/90 shadow-sm transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {serverError && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive">
                  <p className="font-semibold">Unable to submit referral</p>
                  <p className="mt-0.5">{serverError}</p>
                </div>
              )}

              {/* First & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="referral-first-name"
                    className="block text-xs font-bold tracking-wider uppercase text-muted-foreground"
                  >
                    First Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="referral-first-name"
                    type="text"
                    required
                    value={values.first_name}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    placeholder="Candidate's first name"
                    disabled={isSubmitting}
                    className={`mt-1.5 w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-primary outline-none transition-colors ${
                      errors.first_name
                        ? "border-destructive focus:border-destructive"
                        : "border-primary/15 focus:border-accent"
                    }`}
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-xs text-destructive">{errors.first_name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="referral-last-name"
                    className="block text-xs font-bold tracking-wider uppercase text-muted-foreground"
                  >
                    Last Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="referral-last-name"
                    type="text"
                    required
                    value={values.last_name}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    placeholder="Candidate's last name"
                    disabled={isSubmitting}
                    className={`mt-1.5 w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-primary outline-none transition-colors ${
                      errors.last_name
                        ? "border-destructive focus:border-destructive"
                        : "border-primary/15 focus:border-accent"
                    }`}
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-xs text-destructive">{errors.last_name}</p>
                  )}
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label
                  htmlFor="referral-phone"
                  className="block text-xs font-bold tracking-wider uppercase text-muted-foreground"
                >
                  Phone Number <span className="text-destructive">*</span>
                </label>
                <input
                  id="referral-phone"
                  type="tel"
                  required
                  value={values.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  disabled={isSubmitting}
                  className={`mt-1.5 w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-primary outline-none transition-colors ${
                    errors.phone
                      ? "border-destructive focus:border-destructive"
                      : "border-primary/15 focus:border-accent"
                  }`}
                />
                {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="referral-email"
                  className="block text-xs font-bold tracking-wider uppercase text-muted-foreground"
                >
                  Email Address <span className="text-destructive">*</span>
                </label>
                <input
                  id="referral-email"
                  type="email"
                  required
                  value={values.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="e.g. candidate@example.com"
                  disabled={isSubmitting}
                  className={`mt-1.5 w-full rounded-lg border bg-background px-3.5 py-2 text-sm text-primary outline-none transition-colors ${
                    errors.email
                      ? "border-destructive focus:border-destructive"
                      : "border-primary/15 focus:border-accent"
                  }`}
                />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>

              {/* Upload Resume */}
              <div>
                <label
                  htmlFor="referral-resume"
                  className="block text-xs font-bold tracking-wider uppercase text-muted-foreground"
                >
                  Upload Resume <span className="text-destructive">*</span>
                </label>
                <div
                  className={`mt-1.5 rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
                    errors.resume
                      ? "border-destructive bg-destructive/5"
                      : resume
                        ? "border-accent/40 bg-accent/5"
                        : "border-primary/15 hover:border-accent/50 bg-surface/50"
                  }`}
                >
                  {resume ? (
                    <div className="flex items-center justify-between gap-3 text-left">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <FileText className="size-5 shrink-0 text-accent" />
                        <div className="overflow-hidden">
                          <p className="truncate text-xs font-semibold text-primary">
                            {resume.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {(resume.file.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setResume(null)}
                        className="rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        aria-label="Remove file"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto size-6 text-muted-foreground/80" />
                      <p className="mt-1.5 text-xs font-medium text-primary">
                        <label
                          htmlFor="referral-resume"
                          className="cursor-pointer text-accent hover:underline font-semibold"
                        >
                          Click to upload resume
                        </label>{" "}
                        or drag and drop
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Accepts PDF, DOC, or DOCX (up to 5 MB)
                      </p>
                    </div>
                  )}
                  <input
                    id="referral-resume"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    required
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                    className="sr-only"
                  />
                </div>
                {errors.resume && <p className="mt-1 text-xs text-destructive">{errors.resume}</p>}
              </div>

              {/* Submit button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-accent-foreground shadow-accent transition-transform hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Referring…
                    </>
                  ) : (
                    "Refer"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
