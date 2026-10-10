import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/screenshot-saver-download")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/downloads/Screenshot.Saver.1.exe",
            "Content-Disposition": 'attachment; filename="Screenshot.Saver.1.exe"',
          },
        });
      },
    },
  },
});
