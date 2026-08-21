import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { AdminShell, EmptyState, LoadingBlock } from "@/components/admin/admin-shell";
import { adminFormsQuery, recordAudit, type FormRow } from "@/lib/admin-api";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/job-utils";

export const Route = createFileRoute("/_authenticated/admin/forms")({
  head: () => ({
    meta: [
      { title: "Application Forms — Nexus Talent Admin" },
      { name: "description", content: "Manage reusable application form links." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FormsAdmin,
});

const formSchema = z.object({
  name: z.string().trim().min(3, "Give the form a recognisable name").max(120),
  google_form_url: z.string().trim().url("Enter a valid form URL").max(500),
  description: z.string().trim().max(300).optional(),
});

function FormsAdmin() {
  const queryClient = useQueryClient();
  const forms = useQuery(adminFormsQuery);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin"] });

  const createMutation = useMutation({
    mutationFn: async () => {
      const parsed = formSchema.safeParse({ name, google_form_url: url, description });
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid form");
      const { data, error: insertError } = await supabase
        .from("forms")
        .insert({
          name: parsed.data.name,
          google_form_url: parsed.data.google_form_url,
          description: parsed.data.description || null,
        })
        .select("id")
        .single();
      if (insertError) throw new Error(insertError.message);
      await recordAudit("form_created", "form", data.id, { name: parsed.data.name });
    },
    onSuccess: () => {
      toast.success("Form added");
      setName("");
      setUrl("");
      setDescription("");
      setError(null);
      invalidate();
    },
    onError: (mutationError: Error) => setError(mutationError.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (form: FormRow) => {
      const { error: deleteError } = await supabase.from("forms").delete().eq("id", form.id);
      if (deleteError) throw new Error(deleteError.message);
      await recordAudit("form_deleted", "form", form.id, { name: form.name });
    },
    onSuccess: () => {
      toast.success("Form removed");
      invalidate();
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  });

  const field =
    "mt-2 w-full rounded-lg border border-primary/10 bg-background px-4 py-2.5 text-sm outline-none focus:border-accent";
  const label = "text-xs font-bold tracking-widest uppercase text-muted-foreground";

  return (
    <AdminShell
      title="Application forms"
      description="Reusable form links that jobs can point to"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <section className="rounded-2xl border border-primary/5 bg-card p-6">
          <h2 className="font-bold text-primary">Add a form</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Today these are Google Forms. Because jobs reference a form record rather than a hard-coded
            link, swapping to an in-house application form later only means changing the URL here.
          </p>
          <div className="mt-5 space-y-4">
            <div>
              <label className={label} htmlFor="form-name">
                Form name
              </label>
              <input
                id="form-name"
                value={name}
                maxLength={120}
                onChange={(event) => setName(event.target.value)}
                className={field}
              />
            </div>
            <div>
              <label className={label} htmlFor="form-url">
                Form URL
              </label>
              <input
                id="form-url"
                value={url}
                maxLength={500}
                placeholder="https://docs.google.com/forms/..."
                onChange={(event) => setUrl(event.target.value)}
                className={field}
              />
            </div>
            <div>
              <label className={label} htmlFor="form-description">
                Description
              </label>
              <input
                id="form-description"
                value={description}
                maxLength={300}
                onChange={(event) => setDescription(event.target.value)}
                className={field}
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <button
              type="button"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-accent disabled:opacity-60"
            >
              Add form
            </button>
          </div>
        </section>

        <section>
          {forms.isPending ? (
            <LoadingBlock rows={3} />
          ) : (forms.data ?? []).length === 0 ? (
            <EmptyState title="No forms yet" hint="Add your first application form link." />
          ) : (
            <ul className="space-y-3">
              {(forms.data ?? []).map((form) => (
                <li
                  key={form.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/5 bg-card p-5"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-primary">{form.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {form.description ?? form.google_form_url}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Added {formatDate(form.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={form.google_form_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:border-accent hover:text-accent"
                    >
                      Open <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                    <button
                      type="button"
                      aria-label={`Delete ${form.name}`}
                      onClick={() => {
                        if (window.confirm(`Remove “${form.name}”?`)) deleteMutation.mutate(form);
                      }}
                      className="rounded-lg border border-primary/10 p-2 text-muted-foreground hover:border-destructive/40 hover:text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
