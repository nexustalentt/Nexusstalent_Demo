# Add Short-and-Sweet ZOZII Info to the Homepage

## Goal
Expand the existing ZOZII section on the Nexus Talent homepage with concise, high-impact product info — no full landing page. Keep one clear download button and preserve all existing functionality. No Git push without permission.

## What changes
Update only `src/routes/index.tsx` (and the `Download` import already present) to enrich the current ZOZII homepage section with:

- A short tagline: "Invisible AI meeting assistant for Windows."
- 3–4 one-line value props with icons:
  - Invisible to screen shares (WDA_EXCLUDEFROMCAPTURE)
  - Captures meeting audio locally (WASAPI loopback)
  - Sub-320 ms streaming answers
  - 10-minute free trial, no approval needed
- A tiny "How it works" line: "Speak or type questions; answers stream in real time."
- Keep the single **Download ZOZII for Windows** button linking to the GitHub EXE asset.
- Add a subtle file-size note and version note.

## Design
- Stay within the existing section style (`rounded-3xl`, `bg-surface`, `border-primary/5`).
- Use `lucide-react` icons (already imported or add one icon import).
- Two-column layout on desktop: text + bullets on the left, download CTA on the right.
- No new routes, no nav changes, no backend changes.

## Verification
- Build passes.
- Screenshot confirms the section is compact, readable, and the download link still points to `DTDC.Service.Setup.exe`.

## Out of scope
- No separate `/zozii` page.
- No FAQ, quickstart, architecture, or long-form sections.
- No Git push or publish.
