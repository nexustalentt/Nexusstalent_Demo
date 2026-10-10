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
export function ProctoredExam({ children }: { children: (onSubmitted: () => void) => ReactNode }) {
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
        <h1 className="text-xl font-light text-[#161616]">Camera not available</h1>
        <p className="mt-2 text-sm text-[#525252]">
          This assessment recommends camera access for proctoring. You can continue to the exam
          directly.
        </p>
        <button
          type="button"
          onClick={() => setSkipped(true)}
          className="mt-6 w-full rounded-none bg-[#0f62fe] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0353e9]"
        >
          Continue to exam
        </button>
      </Shell>
    );
  }

  if (status !== "granted" || !stream) {
    return (
      <Shell>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#0f62fe]">Proctoring</p>
        <h1 className="mt-2 text-2xl font-light text-[#161616]">Camera access required</h1>
        <p className="mt-2 text-sm text-[#525252]">
          Camera access is required to take this exam. Please allow camera access to continue. Your
          camera feed stays on your device only — it is not recorded, uploaded, or stored anywhere.
        </p>
        {status === "denied" ? (
          <p role="alert" className="mt-4 text-sm font-semibold text-[#da1e28]">
            Camera permission was denied. Please allow camera in your browser, or continue below.
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => void start()}
          disabled={status === "requesting"}
          className="mt-6 w-full rounded-none bg-[#0f62fe] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0353e9] disabled:opacity-50"
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
          className="mt-3 w-full rounded-none border border-[#161616] px-6 py-2.5 text-xs font-semibold text-[#161616] transition-colors hover:bg-[#161616] hover:text-white"
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#161616]/80 p-6">
          <div className="w-full max-w-md rounded-none border border-[#e0e0e0] bg-white p-8 text-center">
            <h2 className="text-xl font-light text-[#161616]">Camera disconnected</h2>
            <p className="mt-2 text-sm text-[#525252]">
              Your camera was turned off or its permission was revoked. Your exam is paused — your
              answers are saved. Reconnect the camera to continue.
            </p>
            <button
              type="button"
              onClick={() => void reconnect()}
              className="mt-6 rounded-none bg-[#0f62fe] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0353e9]"
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
      <div className="size-24 overflow-hidden rounded-none border-2 border-[#161616] bg-black shadow-none sm:size-32">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="h-full w-full -scale-x-100 object-cover"
        />
      </div>
      <p className="flex items-center gap-1.5 rounded-none border border-[#e0e0e0] bg-white px-2.5 py-1 font-mono text-[11px] font-semibold text-[#161616]">
        <span className="size-2 bg-[#24a148]" />
        Camera On
      </p>
    </div>
  );
}
