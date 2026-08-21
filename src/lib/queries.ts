import { queryOptions } from "@tanstack/react-query";
import { getPublicJob, getSiteSettings, listActiveJobs } from "./public-data.functions";

export const activeJobsQuery = queryOptions({
  queryKey: ["public", "jobs"],
  queryFn: () => listActiveJobs(),
  staleTime: 60_000,
});

export const publicJobQuery = (slug: string) =>
  queryOptions({
    queryKey: ["public", "job", slug],
    queryFn: () => getPublicJob({ data: { slug } }),
    staleTime: 60_000,
  });

export const siteSettingsQuery = queryOptions({
  queryKey: ["public", "settings"],
  queryFn: () => getSiteSettings(),
  staleTime: 300_000,
});
