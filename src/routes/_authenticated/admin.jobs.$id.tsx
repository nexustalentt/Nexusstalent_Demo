import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { AdminShell, EmptyState, LoadingBlock } from "@/components/admin/admin-shell";
import { JobForm } from "@/components/admin/job-form";
import { adminFormsQuery, adminJobQuery, recordAudit, type JobInsert } from "@/lib/admin-api";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/jobs/$id")({
  head: () => ({
    meta: [
      { title: "Edit Job — Nexus Talent Admin" },
      { name: "description", content: "Update role details and publication status." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditJobPage,
});

function EditJobPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const job = useQuery(adminJobQuery(id));
  const forms = useQuery(adminFormsQuery);

  const mutation = useMutation({
    mutationFn: async (values: JobInsert) => {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("jobs")
        .update({
          ...values,
          updated_by: userData.user?.id ?? null,
          published_at:
            values.status === "active"
              ? (job.data?.published_at ?? new Date().toISOString())
              : (job.data?.published_at ?? null),
        })
        .eq("id", id);
      if (error) throw new Error(error.message);
      await recordAudit("job_updated", "job", id, { title: values.title });
    },
    onSuccess: () => {
      toast.success("Job updated");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      navigate({ to: "/admin/jobs" });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AdminShell
      title="Edit job"
      description={job.data?.title ?? "Loading role"}
      actions={
        <div className="flex gap-2">
          {job.data?.status === "active" ? (
            <Link
              to="/careers/$slug"
              params={{ slug: job.data.slug }}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full border border-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:border-accent hover:text-accent"
            >
              View live <ExternalLink className="size-3.5" aria-hidden="true" />
            </Link>
          ) : null}
          <Link
            to="/admin/jobs"
            className="inline-flex items-center gap-2 rounded-full border border-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:border-accent hover:text-accent"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Back
          </Link>
        </div>
      }
    >
      {job.isPending ? (
        <LoadingBlock rows={6} />
      ) : !job.data ? (
        <EmptyState title="Job not found" hint="It may have been deleted." />
      ) : (
        <JobForm
          job={job.data}
          forms={forms.data ?? []}
          pending={mutation.isPending}
          onSubmit={(values) => mutation.mutate(values)}
        />
      )}
    </AdminShell>
  );
}
