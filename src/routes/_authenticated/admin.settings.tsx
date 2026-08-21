import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell, LoadingBlock } from "@/components/admin/admin-shell";
import { adminSettingsQuery, recordAudit, type SettingsRow } from "@/lib/admin-api";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Nexus Talent Admin" },
      { name: "description", content: "Company details, notifications and SEO defaults." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsAdmin,
});

type Editable = Partial<SettingsRow>;

const textFields: { key: keyof SettingsRow; label: string; max: number }[] = [
  { key: "company_name", label: "Company name", max: 120 },
  { key: "company_email", label: "General email", max: 255 },
  { key: "recruitment_email", label: "Recruitment email (notifications)", max: 255 },
  { key: "phone", label: "Phone", max: 40 },
  { key: "address", label: "Address", max: 240 },
  { key: "business_hours", label: "Business hours", max: 120 },
  { key: "linkedin_url", label: "LinkedIn URL", max: 300 },
  { key: "twitter_url", label: "X / Twitter URL", max: 300 },
  { key: "years_experience", label: "Stat: years of experience", max: 20 },
  { key: "professionals_placed", label: "Stat: professionals placed", max: 20 },
  { key: "enterprise_clients", label: "Stat: enterprise clients", max: 20 },
  { key: "successful_projects", label: "Stat: successful projects", max: 20 },
  { key: "seo_title", label: "Default SEO title", max: 70 },
  { key: "seo_description", label: "Default SEO description", max: 180 },
];

const toggles: { key: keyof SettingsRow; label: string; hint: string }[] = [
  {
    key: "notify_on_new_application",
    label: "New application received",
    hint: "Email the recruitment inbox as soon as an application arrives.",
  },
  { key: "notify_on_shortlist", label: "Candidate shortlisted", hint: "Notify on shortlist moves." },
  { key: "notify_on_interview", label: "Interview scheduled", hint: "Notify on interview stage." },
  { key: "notify_on_selected", label: "Candidate selected", hint: "Notify when an offer is made." },
];

function SettingsAdmin() {
  const queryClient = useQueryClient();
  const settings = useQuery(adminSettingsQuery);
  const [values, setValues] = useState<Editable>({});

  useEffect(() => {
    if (settings.data) setValues(settings.data);
  }, [settings.data]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: Editable = { ...values, id: true };
      const { error } = await supabase.from("site_settings").upsert(payload as never);
      if (error) throw new Error(error.message);
      await recordAudit("settings_updated", "site_settings", null);
    },
    onSuccess: () => {
      toast.success("Settings saved");
      queryClient.invalidateQueries();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const field =
    "mt-2 w-full rounded-lg border border-primary/10 bg-background px-4 py-2.5 text-sm outline-none focus:border-accent";
  const label = "text-xs font-bold tracking-widest uppercase text-muted-foreground";

  if (settings.isPending) {
    return (
      <AdminShell title="Settings">
        <LoadingBlock rows={6} />
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Settings"
      description="Company profile, notifications and public SEO defaults"
      actions={
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-accent disabled:opacity-60"
        >
          Save changes
        </button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-primary/5 bg-card p-6">
          <h2 className="font-bold text-primary">Company &amp; SEO</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {textFields.map((item) => (
              <div key={String(item.key)}>
                <label className={label} htmlFor={String(item.key)}>
                  {item.label}
                </label>
                <input
                  id={String(item.key)}
                  value={String(values[item.key] ?? "")}
                  maxLength={item.max}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [item.key]: event.target.value }))
                  }
                  className={field}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-primary/5 bg-card p-6">
          <h2 className="font-bold text-primary">Email notifications</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Alerts are sent to the recruitment email above.
          </p>
          <ul className="mt-5 space-y-4">
            {toggles.map((toggle) => (
              <li key={String(toggle.key)} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-primary">{toggle.label}</p>
                  <p className="text-xs text-muted-foreground">{toggle.hint}</p>
                </div>
                <input
                  type="checkbox"
                  aria-label={toggle.label}
                  checked={Boolean(values[toggle.key])}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [toggle.key]: event.target.checked }))
                  }
                  className="mt-1 size-5 accent-accent"
                />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AdminShell>
  );
}
