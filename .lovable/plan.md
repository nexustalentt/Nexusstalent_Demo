# Build a Dedicated ZOZII Product Landing Page

## Goal
Turn the pasted ZOZII product content into a full product landing page on the Nexus Talent site. The page will explain the product, show its engine, interaction modes, architecture, quickstart, and FAQ, with clear download CTAs throughout. Existing functionality stays untouched and nothing is pushed to Git without permission.

## Proposed structure
Create a new route `/zozii` and link to it from the homepage section added earlier.

### New page: `/zozii`
A single long-form page inside `PublicShell` with these sections, using existing design tokens:

1. **Hero**
   - Eyebrow: "Product"
   - Headline: "Meet Zozii — invisible AI meeting assistant"
   - Subheadline about listening, speaking/typing questions, and streaming answers invisible to screen shares.
   - Two CTAs: primary "Download for Windows (.exe) v1.09.01" and secondary "Explore Engine" (anchor scroll).
   - Trust pills: WDA_EXCLUDEFROMCAPTURE, WASAPI Loopback Tap, <320ms Realtime Stream, 10-Min Instant Trial.

2. **Live Runtime Card**
   - Styled code-block card showing the `assistant` config object and a simulated meeting Q&A stream.
   - Labels: "zozii-engine.ts · LIVE RUNTIME".

3. **Core Engineering**
   - Four feature cards:
     - WIN32 DIRECTCOMPOSITION — invisible in screen shares.
     - WASAPI LOOPBACK — digital loopback audio tap.
     - TOKEN STREAMING — sub-second token streaming.
     - (Add a fourth for local-first zero retention / privacy.)

4. **Interaction Modalities**
   - Four cards: Voice Prompts, Meeting Audio Tap, Stealth Keyboard, Real-Time Stream.
   - Small note: "Prompts and meeting transcription currently supported in English."

5. **Architecture**
   - Five stacked/horizontal items with labels:
     - RUNTIME — Electron 32 & TypeScript
     - DWM WIN32 — Direct3D Screen Guard
     - AUDIO PIPELINE — WASAPI Audio Session
     - LLM ENGINE — Groq & Gemini Dual Backend
     - INFRASTRUCTURE — Supabase Auth & Storage
     - PRIVACY — Local-First Zero Retention

6. **Quickstart**
   - Numbered steps (1–7) from download installer → register → trial → connect API key → start listening → ask question → read stream → request more time.
   - Include a repeated "Download DTDC.Service.Setup.exe" button.

7. **FAQ**
   - Five questions covering activation, trial extensions, audio privacy, LLM providers, and screen-share safety.

8. **Final CTA**
   - "Ready to experience invisible AI co-piloting?" with "Download for Windows (.exe)" button.
   - Footer note: "Zozii by Nexus Talent · a Nexus Talent product".

## Files to create / edit
- **Create** `src/routes/zozii.tsx` — the full landing page.
- **Edit** `src/routes/index.tsx` — update the existing ZOZII homepage section so the download button stays and an "Explore ZOZII" link points to `/zozii`.
- **Edit** `src/components/site/site-header.tsx` — add a "ZOZII" item to the main nav and mobile nav.
- **Edit** `src/components/site/site-footer.tsx` — add a "ZOZII" footer link (if footer has product/legal links).

## Design approach
- Use only existing Tailwind semantic tokens (`bg-surface`, `bg-card`, `text-primary`, `text-accent`, `border-primary/5`, etc.).
- Use `lucide-react` icons for each feature/modality/architecture item.
- Keep the page responsive: stacked on mobile, grids on desktop.
- No new images required; rely on icons and the code-block card for visual interest.

## Behavior
- All download buttons link to the verified GitHub asset:
  `https://github.com/nexustalentt/ZOZII/releases/download/v1.09.01/DTDC.Service.Setup.exe`
- Anchor links within the page scroll to Engine, Modalities, Architecture, Quickstart, and FAQ sections.
- No backend changes, no database changes, no auth changes.

## Verification
- Build passes without errors.
- Playwright checks confirm `/zozii` renders, nav link works, download buttons point to the EXE, and anchor scrolling functions.
- Confirm homepage ZOZII section still downloads the EXE and links to the new page.

## Out of scope
- No Git push or publish.
- No changes to the actual ZOZII executable or GitHub release.
- No candidate login, admin portal, or exam feature changes.
