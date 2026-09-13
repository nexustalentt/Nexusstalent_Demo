# Add ZOZII Product Section to Nexus Talent Homepage

## Goal
Add a visible "ZOZII Product" section to the main Nexus Talent homepage (`/`) with a single download button. Clicking the button must download the Windows executable from the GitHub release without breaking any existing page functionality. No Git push will happen without explicit permission.

## Where it goes
Insert a new section on `src/routes/index.tsx` between the existing **Trusted By** client-logos section and the final **CTA** section, so it sits naturally above the "Talk to Us" call-to-action.

## What it looks like
- Eyebrow label: "Product"
- Heading: "ZOZII — Our Windows Utility"
- Short description explaining what ZOZII is (kept generic and safe; no claims beyond the release notes).
- One primary button labeled **Download ZOZII for Windows** with a download icon.
- Button links directly to the GitHub release asset:
  `https://github.com/nexustalentt/ZOZII/releases/download/v1.09.01/DTDC.Service.Setup.exe`
- Use existing design tokens (`bg-surface`, `border-primary/5`, `bg-primary`, `text-primary-foreground`, `rounded-3xl`) to match the current premium slate style.
- Include a small helper line showing the file name and approximate size (~91 MB) so visitors know what to expect.

## Behavior
- The button is a plain `<a>` tag with `download` and `target="_blank"`/`rel="noopener noreferrer"` attributes so browsers initiate the EXE download.
- No new routes, no backend changes, no database changes.
- Existing homepage sections, navigation, job cards, stats, and admin flows remain untouched.

## Files to change
- `src/routes/index.tsx` — add the new ZOZII section and import a download icon from `lucide-react`.

## Verification
- Build the project and confirm the homepage renders without errors.
- Visually confirm the new section appears between "Trusted By" and the CTA.
- Confirm the download button points to the exact GitHub asset URL above.

## Out of scope
- No Git push or publish; this will stay in the Lovable preview until the user explicitly asks to publish/push.
- No changes to the GitHub release, product branding, or executable itself.
