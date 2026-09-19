import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Shell } from "./exam-runner";

type CameraStatus = "idle" | "requesting" | "granted" | "denied" | "unsupported";

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function cameraSupported() {
  return (
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    (window.isSecureContext || window.location.hostname === "localhost")
  );
}

async function requestCamera(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 640 }, facingMode: "user" },
    audio: false,
  });
}

/**
 * Camera permission gate + live local proctoring overlay for the exam.
 * The stream is never recorded, uploaded, or sent anywhere — it only feeds
 * the on-screen preview and is stopped when the exam ends.
 */
export function ProctoredExam({
  children,
}: {
  children: (onSubmitted: () => void) => ReactNode;
}) {
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraLost, setCameraLost] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [skipped, setSkipped] = useState(false);

  /** Called by the exam runner the moment the attempt is submitted. */
  const handleSubmitted = useCallback(() => {
    setSubmitted(true);
    setStream((current) => {
      stopStream(current);
      return null;
    });
  }, []);

  const start = useCallback(async () => {
    if (!cameraSupported()) {
      setStatus("unsupported");
      return;
    }
    setStatus("requesting");
    try {
      const media = await requestCamera();
      setStream(media);
      setCameraLost(false);
      setStatus("granted");
    } catch {
      setStatus("denied");
    }
  }, []);

  // Ask for the camera as soon as the candidate is logged in.
  useEffect(() => {
    void start();
  }, [start]);

  // Stop the camera completely when the exam session ends or the page closes.
  useEffect(() => {
    const handler = () => stopStream(stream);
    window.addEventListener("pagehide", handler);
    return () => {
      window.removeEventListener("pagehide", handler);
      stopStream(stream);
    };
  }, [stream]);

  // Detect the camera stopping or permission being revoked mid-exam.
  useEffect(() => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;
    const onEnded = () => setCameraLost(true);
    track.addEventListener("ended", onEnded);
    return () => track.removeEventListener("ended", onEnded);
  }, [stream]);

  const reconnect = useCallback(async () => {
    stopStream(stream);
    setStream(null);
    setCameraLost(false);
    await start();
  }, [stream, start]);

  // Exam submitted or skipped: render the child as-is.
  if (submitted || skipped) {
    return <>{children(handleSubmitted)}</>;
  }

  if (status === "unsupported") {
    return (
      <Shell>
        <h1 className="text-xl font-bold text-primary">Camera not available</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This assessment recommends camera access for proctoring. You can continue to the exam directly.
        </p>
        <button
          type="button"
          onClick={() => setSkipped(true)}
          className="mt-6 w-full rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-accent"
        >
          Continue to exam
        </button>
      </Shell>
    );
  }

  if (status !== "granted" || !stream) {
    return (
      <Shell>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Proctoring</p>
        <h1 className="mt-2 text-2xl font-bold text-primary">Camera access required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Camera access is required to take this exam. Please allow camera access to continue. Your
          camera feed stays on your device only — it is not recorded, uploaded, or stored anywhere.
        </p>
        {status === "denied" ? (
          <p role="alert" className="mt-4 text-sm font-semibold text-destructive">
            Camera permission was denied. Please allow camera in your browser, or continue below.
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => void start()}
          disabled={status === "requesting"}
          className="mt-6 w-full rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-accent disabled:opacity-60"
        >
          {status === "requesting"
            ? "Waiting for camera permission…"
            : status === "denied"
              ? "Try again"
              : "Allow camera & continue"}
        </button>
        <button
          type="button"
          onClick={() => setSkipped(true)}
          className="mt-3 w-full rounded-full border border-primary/10 px-6 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/20 transition-colors"
        >
          Continue without camera
        </button>
      </Shell>
    );
  }

  return (
    <>
      {children(handleSubmitted)}
      <CameraOverlay stream={stream} />
      {cameraLost ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-primary/70 p-6">
          <div className="w-full max-w-md rounded-2xl border border-primary/5 bg-card p-8 text-center">
            <h2 className="text-xl font-bold text-primary">Camera disconnected</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your camera was turned off or its permission was revoked. Your exam is paused — your
              answers are saved. Reconnect the camera to continue.
            </p>
            <button
              type="button"
              onClick={() => void reconnect()}
              className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-accent"
            >
              Reconnect camera
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function CameraOverlay({ stream }: { stream: MediaStream }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    void video.play().catch(() => undefined);
    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  return (
    <div
      aria-label="Proctoring camera active"
      className="fixed bottom-4 right-4 z-50 flex flex-col items-center gap-2"
    >
      <div className="size-24 overflow-hidden rounded-full border-4 border-card shadow-lg ring-2 ring-success sm:size-32">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="h-full w-full -scale-x-100 object-cover"
        />
      </div>
      <p className="flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1 text-xs font-bold text-primary shadow">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-destructive" />
        </span>
        Camera On
      </p>
    </div>
  );
}
