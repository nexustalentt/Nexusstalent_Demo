# Camera Proctoring for the Exam Flow

Add a browser-camera proctoring step to the existing exam experience. The video is **local-only** — nothing is recorded, uploaded, or stored anywhere.

## User flow

```text
Exam login (unchanged)
  → successful login
  → Camera permission screen
       "Camera access is required to take this exam."
       [Allow camera & continue]
  → permission granted → exam UI with circular live camera overlay
  → submit / exit / auto-submit → camera stops (track.stop())
Denied permission → blocked screen with retry button; exam cannot start.
```

## Changes

### 1. New component: `src/components/site/exam-proctoring.tsx`
- `CameraGate` — shown after login, before the exam loads:
  - Requests `navigator.mediaDevices.getUserMedia({ video: true, audio: false })`.
  - Message: "Camera access is required to take this exam. Please allow camera access to continue."
  - On denial/error: shows an explanation ("Camera access is required…") with a **Try again** button; the exam UI is never rendered.
  - Detects unsupported browsers (no `getUserMedia` / non-HTTPS) and shows a clear message.
- `CameraOverlay` — fixed-position live preview during the exam:
  - Small circular `<video>` (muted, autoplay, playsInline, no `controls` attribute) pinned to the bottom-right corner, above content (`z-50`), so it never covers questions/timer and stays visible while scrolling.
  - Red pulsing dot + "Camera On" label.
  - Watches `track.onended` / `mute` events: if the camera stops or permission is revoked mid-exam, shows a full-screen notice "Camera disconnected — your exam is paused" with a Reconnect button (answers are already auto-saved, so nothing is lost).
  - Cleans up with `MediaStreamTrack.stop()` on unmount, submit, or exit.
- No `MediaRecorder`, no canvas snapshots, no network calls — the stream never leaves the browser.

### 2. Wire into both exam entry pages
- `src/routes/exam.index.tsx` and `src/routes/exam.$token.tsx`:
  - After `sessionToken` exists, render `<CameraGate>` which, once the stream is live, renders `<ExamRunner>` plus `<CameraOverlay stream={stream}>` (overlay lives alongside the runner so it persists across scrolling and panel toggles).
  - On sign-out / session-invalid / submitted, the gate unmounts and stops the tracks.
- Pass a small `onSubmitted` signal so the overlay shows "Exam submitted — camera off" state and stops immediately.

### 3. Minor runner tweak (optional, non-breaking)
- Ensure the exam runner's submit success screen also unmounts the overlay (camera stops the moment submission completes).

## What does NOT change
- Login flow, credentials, admin panel, database schema, RPCs — untouched.
- No new tables, no storage buckets, no server functions.
- Homepage, jobs, forms, and all other routes unchanged.

## Technical notes
- `getUserMedia` requires a secure context (HTTPS or localhost); Vercel and Lovable preview both qualify. Non-HTTPS shows the unsupported-browser message.
- Mobile: overlay shrinks (e.g. 88px circle on phones, 128px on desktop) and stays bottom-right with safe margins.
- SSR safety: all camera code runs only in `useEffect`/event handlers (client-only), so SSR/prerender is unaffected.
- Testing: permission prompts can't be fully automated headlessly; I'll verify build passes, the gate renders, denial path works, and exercise the flow via the browser with a fake camera where possible.
