/**
 * Email notification transport.
 *
 * Notifications are intentionally isolated behind this module so the delivery
 * provider can be swapped (Resend today, managed Lovable email later) without
 * touching application logic. When no provider key is configured the payload is
 * logged instead of dropped, so nothing is lost during setup.
 */
export type NotificationEmail = {
  to: string;
  subject: string;
  lines: string[];
};

export async function sendNotificationEmail({ to, subject, lines }: NotificationEmail) {
  const apiKey = process.env["RESEND_API_KEY"];
  const from = process.env["NOTIFICATION_FROM_EMAIL"] ?? "notifications@resend.dev";

  const text = lines.join("\n");
  const html = `<div style="font-family:Inter,Arial,sans-serif;font-size:14px;color:#0f172a;line-height:1.6">${lines
    .map((line) => `<p style="margin:0 0 8px">${escapeHtml(line)}</p>`)
    .join("")}</div>`;

  if (!apiKey) {
    console.info("[notification:pending-provider]", { to, subject, text });
    return { delivered: false as const, reason: "no_provider_configured" as const };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, text, html }),
  });

  if (!response.ok) {
    console.error("[notification:failed]", response.status, await response.text());
    return { delivered: false as const, reason: "provider_error" as const };
  }

  return { delivered: true as const };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
