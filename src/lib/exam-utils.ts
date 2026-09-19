export type QuestionType =
  | "multiple_choice"
  | "multiple_select"
  | "true_false"
  | "short_answer"
  | "long_answer";

export const questionTypes: { value: QuestionType; label: string; hint: string }[] = [
  { value: "multiple_choice", label: "Multiple Choice", hint: "One correct option" },
  { value: "multiple_select", label: "Multiple Select", hint: "Several correct options" },
  { value: "true_false", label: "True / False", hint: "Two fixed options" },
  { value: "short_answer", label: "Short Answer", hint: "Auto-matched, admin can override" },
  { value: "long_answer", label: "Long Answer", hint: "Manually evaluated" },
];

export function questionTypeLabel(type: string) {
  return questionTypes.find((item) => item.value === type)?.label ?? type;
}

export const autoGradedTypes: QuestionType[] = [
  "multiple_choice",
  "multiple_select",
  "true_false",
  "short_answer",
];

export function isAutoGraded(type: string) {
  return autoGradedTypes.includes(type as QuestionType);
}

export type ExamStatus = "draft" | "published" | "closed";

export const examStatusLabels: Record<string, string> = {
  draft: "Draft",
  published: "Active",
  closed: "Closed",
};

export const attemptStatusLabels: Record<string, string> = {
  in_progress: "In progress",
  submitted: "Submitted",
  pending_review: "Pending review",
  evaluated: "Completed",
};

export function formatDuration(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function optionLabel(index: number) {
  return `Option ${index + 1}`;
}

/** Default aptitude sections offered in the exam creator. */
export const examSections = [
  "English",
  "Logical Reasoning",
  "Manual Testing",
  "Automation Testing",
] as const;

export const generalSection = "General";

export function normalizeSection(value?: string | null) {
  const trimmed = (value ?? "").trim();
  return trimmed.length > 0 ? trimmed : generalSection;
}

export type SectionGroup<T> = { name: string; items: T[]; startIndex: number };

/** Groups questions by section, preserving their saved order. */
export function groupBySection<T extends { section?: string | null }>(items: T[]): SectionGroup<T>[] {
  const groups: SectionGroup<T>[] = [];
  items.forEach((item, index) => {
    const name = normalizeSection(item.section);
    const existing = groups.find((group) => group.name === name);
    if (existing) existing.items.push(item);
    else groups.push({ name, items: [item], startIndex: index });
  });
  return groups;
}

/** Exam access windows are always interpreted and displayed in India Standard Time. */
export const examTimeZone = "Asia/Kolkata";

/**
 * Converts a `datetime-local` value ("YYYY-MM-DDTHH:mm") entered by admins into an
 * absolute ISO timestamp, treating the entered time as IST (+05:30).
 */
export function istLocalToIso(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const withSeconds = trimmed.length === 16 ? `${trimmed}:00` : trimmed;
  return new Date(`${withSeconds}+05:30`).toISOString();
}

/** Formats an absolute timestamp as IST in 24-hour clock, e.g. "29 Aug 2026, 13:14 IST". */
export function formatIst(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: examTimeZone,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("day")} ${get("month")} ${get("year")}, ${get("hour")}:${get("minute")} IST`;
}

/** Converts an absolute timestamp into a `datetime-local` value in IST. */
export function isoToIstLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: examTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** Formats candidate credentials into the standard Nexus Talent text format for copy/email. */
export function formatCandidateCredentials(params: {
  candidateName?: string | null | undefined;
  examTitle?: string | null | undefined;
  examLink?: string | null | undefined;
  username: string;
  password?: string | null | undefined;
  accessStart?: string | null | undefined;
  accessEnd?: string | null | undefined;
}) {
  const startStr = params.accessStart ? formatIst(params.accessStart) : "";
  const endStr = params.accessEnd ? formatIst(params.accessEnd) : "";

  let windowStr = "Anytime";
  if (startStr && endStr) {
    windowStr = `${startStr} to ${endStr}`;
  } else if (startStr) {
    windowStr = `${startStr} to No end`;
  } else if (endStr) {
    windowStr = `Anytime to ${endStr}`;
  }

  const lines = [
    "Nexus Talent - Assessment Credentials",
    "==================================",
    `Candidate: ${params.candidateName?.trim() || params.username}`,
    `Exam: ${params.examTitle?.trim() || "Assessment"}`,
    params.examLink ? `Exam Link: ${params.examLink}` : null,
    `Username: ${params.username}`,
    params.password ? `Password: ${params.password}` : null,
    `Access Window: ${windowStr}`,
    "==================================",
  ].filter(Boolean);

  return lines.join("\n");
}
