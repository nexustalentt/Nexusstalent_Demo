# ZOZII Product Page

## Goal
Give ZOZII a proper product landing page (`/zozii`) using the content provided, and replace the current homepage block with a compact teaser card that links to it.

## Scope
- New public route: `/zozii` with full landing-page content.
- Refactor existing homepage ZOZII section into a short teaser.
- Add "Zozii" to the site header navigation.
- Preserve the existing slate/minimal design system and download link to `DTDC.Service.Setup.exe`.
- No backend, auth, or database changes.
- No Git push or publish.

## Page structure (`/zozii`)
1. **Hero**: "Meet Zozii — invisible AI meeting assistant" with description, download CTA, version badge, and four capability pills.
2. **Live runtime card**: Stylized code snippet showing the assistant config and a simulated meeting Q&A stream.
3. **Core engineering**: Three feature cards (screen-share invisibility, WASAPI loopback, sub-second streaming).
4. **Interaction modalities**: Four input methods (voice, meeting audio, stealth keyboard, real-time stream).
5. **Architecture**: Six-item breakdown of the native stack.
6. **Quickstart**: Numbered steps from download to first answer.
7. **FAQ**: Five questions with answers.
8. **Final CTA**: Download button + footer note.

## Homepage change
Replace the current ZOZII card with a concise teaser: heading, one-line description, file note, and a "Explore Zozii" button that links to `/zozii`, plus a secondary direct download link.

## Header change
Add `{ label: "Zozii", to: "/zozii" }` to `navItems`.

## Verification
- Build passes.
- Playwright checks the `/zozii` page renders all sections and the download link points to the correct `.exe` asset.
- Homepage teaser links to `/zozii`.
