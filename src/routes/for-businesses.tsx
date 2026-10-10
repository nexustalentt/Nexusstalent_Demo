import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/for-businesses")({
  beforeLoad: () => {
    throw redirect({ to: "/products", replace: true });
  },
  component: () => null,
});
