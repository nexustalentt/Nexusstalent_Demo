import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { JobForm } from "@/components/admin/job-form";
import { adminFormsQuery, recordAudit, type JobInsert } from "@/lib/admin-api";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/jobs/new")({
  head: () => ({
    meta: [
      { title: "Create Job — Nexus Talent Admin" },
      { name: "description", content: "Add a new role to the careers board." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NewJobPage,
});

function NewJobPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const forms = useQuery(adminFormsQuery);

  const mutation = useMutation({
    mutationFn: async (values: JobInsert) => {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("jobs")
        .insert({
          ...values,
          created_by: userData.user?.id ?? null,
          updated_by: userData.user?.id ?? null,
          published_at: values.status === "active" ? new Date().toISOString() : null,
        })
        .select("id, title")
        .single();
      if (error) throw new Error(error.message);
      await recordAudit("job_created", "job", data.id, { title: data.title });
      return data;
    },
    onSuccess: () => {
      toast.success("Job created");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      navigate({ to: "/admin/jobs" });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AdminShell
      title="Create job"
      description="New roles start as drafts until you set them active"
      actions={
        <Link
          to="/admin/jobs"
          className="inline-flex items-center gap-2 rounded-full border border-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:border-accent hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back
        </Link>
      }
    >
      <JobForm
        forms={forms.data ?? []}
        pending={mutation.isPending}
        onSubmit={(values) => mutation.mutate(values)}
      />
    </AdminShell>
  );
}
