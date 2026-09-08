"use client";

import { useEffect, useRef, useState } from "react";
import { decodeAudioTrack, encodeMp3Range } from "@/lib/submissions/audio";
import { fmtDuration, fmtSize } from "@/lib/submissions/format";
import { KIND_LABEL, LIMITS } from "@/lib/submissions/shared";
import Modal from "./Modal";
import { Btn } from "./Buttons";
import { CheckCircleIcon, SpinnerIcon } from "./icons";
import type { QueueItem } from "./types";

export type CapturedFrame = { blob: Blob; atSeconds: number; width: number; height: number };
export type VideoEvidenceResult = { audio: Blob | null; frames: CapturedFrame[] };

type Props = {
  item: QueueItem;
  index: number;
  total: number;
  onSave: (result: VideoEvidenceResult) => void;
  onSkip: () => void;
};

// decodeAudioData needs the whole file in memory plus the decoded PCM, and
// memory cost tracks DURATION, not size. We gate on the duration the preview
// player reports; when the player cannot read the file (HEVC on Chrome, say)
// a conservative size gate stands in. The recording itself is never uploaded,
// so when the audio cannot be extracted here the client is told to send it
// another way.
const MAX_BYTES_WHEN_DURATION_UNKNOWN = 150 * 1024 * 1024;
const PROBE_TIMEOUT_MS = 5000;
// Screen recordings are 30 or 60 fps; 1/30 s lands on a distinct frame either way.
const FRAME_STEP = 1 / 30;

const TOO_LONG =
  "This recording is too long for your browser to extract the audio, so only the moments you capture will be sent. If the audio matters, please record a shorter clip of it or contact our office.";
const TOO_LARGE =
  "This recording is too large for your browser to extract the audio, so only the moments you capture will be sent. If the audio matters, please record a shorter clip of it or contact our office.";
const NO_AUDIO =
  "We could not read an audio track from this recording in your browser, so only the moments you capture will be sent. If the audio matters, please contact our office.";

type Probe = { status: "pending" } | { status: "known"; duration: number } | { status: "unknown" };

type AudioState =
  | { name: "working"; progress: number }
  | { name: "done"; blob: Blob }
  | { name: "unavailable"; message: string };

type Still = CapturedFrame & { id: number; url: string };

let nextStillId = 1;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * "Capture the moment that shows the violation." The recording itself never
 * leaves the device: here the client scrubs to the frames that matter (the
 * caller ID, the timestamp, the message on screen) and captures them as
 * images, while the recording's audio track is extracted as an MP3 in the
 * background — those are what get submitted. Mount one instance per recording
 * (key it by the item).
 */
export default function VideoEvidenceDialog({ item, index, total, onSave, onSkip }: Props) {
  const [probe, setProbe] = useState<Probe>({ status: "pending" });
  const [audio, setAudio] = useState<AudioState>({ name: "working", progress: 0 });
  const [stills, setStills] = useState<Still[]>([]);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [frameReady, setFrameReady] = useState(false);
  const [videoBroken, setVideoBroken] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const urlsRef = useRef<string[]>([]);
  useEffect(
    () => () => {
      for (const url of urlsRef.current) URL.revokeObjectURL(url);
    },
    [],
  );

  // What the memory gate says, derived from the probe rather than stored.
  const gateMessage =
    probe.status === "known" && probe.duration > LIMITS.clip.maxDecodeSeconds
      ? TOO_LONG
      : probe.status === "unknown" && item.size > MAX_BYTES_WHEN_DURATION_UNKNOWN
        ? TOO_LARGE
        : null;

  // If the player never reports metadata, give up probing and use the size gate.
  useEffect(() => {
    if (probe.status !== "pending") return;
    const timer = setTimeout(() => setProbe({ status: "unknown" }), PROBE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [probe.status]);

  // Extract the whole audio track once the gate allows it.
  useEffect(() => {
    if (probe.status === "pending" || gateMessage) return;
    let cancelled = false;
    (async () => {
      const buffer = await decodeAudioTrack(item.blob);
      if (cancelled) return;
      const blob = await encodeMp3Range(buffer, 0, buffer.duration, (fraction) => {
        if (!cancelled) setAudio({ name: "working", progress: fraction });
      });
      if (!cancelled) setAudio({ name: "done", blob });
    })().catch(() => {
      if (!cancelled) setAudio({ name: "unavailable", message: NO_AUDIO });
    });
    return () => {
      cancelled = true;
    };
  }, [item.blob, probe.status, gateMessage]);

  const audioState: AudioState = gateMessage ? { name: "unavailable", message: gateMessage } : audio;

  const step = (delta: number) => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(v.duration)) return;
    v.pause();
    v.currentTime = clamp(v.currentTime + delta, 0, v.duration);
  };

  const capture = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    // A capture clicked mid-scrub must not grab the frame the seek is leaving:
    // wait for the seek to land, then capture what the client actually sees.
    if (v.seeking) {
      v.addEventListener("seeked", capture, { once: true });
      return;
    }
    if (v.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    if (stills.length >= LIMITS.maxFramesPerRecording) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext("2d")?.drawImage(v, 0, 0);
    const at = v.currentTime;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      urlsRef.current.push(url);
      setStills((prev) => [
        ...prev,
        { id: nextStillId++, blob, atSeconds: at, width: canvas.width, height: canvas.height, url },
      ]);
    }, "image/png");
  };

  const removeStill = (id: number) => setStills((prev) => prev.filter((s) => s.id !== id));

  const audioBusy = audioState.name === "working";
  const canSave = !audioBusy && (stills.length > 0 || audioState.name === "done");

  const save = () => {
    onSave({
      audio: audioState.name === "done" ? audioState.blob : null,
      frames: stills.map(({ blob, atSeconds, width, height }) => ({ blob, atSeconds, width, height })),
    });
  };

  const eyebrow = `${KIND_LABEL[item.kind]} ${index + 1} of ${total}`;

  return (
    <Modal open eyebrow={eyebrow} title="Capture the moment that shows the violation" size="lg">
      <p className="text-sm leading-relaxed text-muted">
        The recording itself stays on your device. Move it to the moment that shows the
        violation — the caller ID, the date and time, or the message on screen — and capture it
        as an image. You may capture more than one moment. The recording&rsquo;s audio is
        extracted and sent along with your captures.
      </p>

      {item.previewUrl && !videoBroken && (
        <div className="mt-5 overflow-hidden rounded-sm border border-bone-dark bg-ink-deep">
          <video
            ref={videoRef}
            src={item.previewUrl}
            controls
            playsInline
            preload="auto"
            className="mx-auto max-h-72 w-full"
            onLoadedMetadata={(e) => {
              const d = e.currentTarget.duration;
              setDuration(Number.isFinite(d) ? d : 0);
              setProbe(Number.isFinite(d) ? { status: "known", duration: d } : { status: "unknown" });
            }}
            onLoadedData={() => setFrameReady(true)}
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
            onSeeked={(e) => setTime(e.currentTarget.currentTime)}
            onError={() => {
              setVideoBroken(true);
              setProbe((p) => (p.status === "pending" ? { status: "unknown" } : p));
            }}
          />
        </div>
      )}
      {videoBroken && (
        <p className="mt-4 rounded-sm border border-bone-dark bg-white px-4 py-3 text-xs leading-relaxed text-muted">
          Your browser cannot play this recording (often an iPhone &ldquo;High Efficiency&rdquo;
          video), so frames cannot be captured here. Please take screenshots of the relevant
          moments on your device and upload those instead, or contact our office.
        </p>
      )}

      {!videoBroken && (
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <span className="font-mono text-sm tabular-nums text-ink">
              {fmtDuration(time, true)} / {fmtDuration(duration, true)}
            </span>
            <span className="flex flex-wrap items-center gap-1.5">
              <Btn variant="outline" small onClick={() => step(-1)} title="Back one second">
                −1s
              </Btn>
              <Btn variant="outline" small onClick={() => step(-FRAME_STEP)} title="Back one frame">
                −frame
              </Btn>
              <Btn variant="outline" small onClick={() => step(FRAME_STEP)} title="Forward one frame">
                +frame
              </Btn>
              <Btn variant="outline" small onClick={() => step(1)} title="Forward one second">
                +1s
              </Btn>
            </span>
            <Btn
              variant="dark"
              small
              disabled={!frameReady || stills.length >= LIMITS.maxFramesPerRecording}
              onClick={capture}
            >
              Capture this moment
            </Btn>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Pause on the moment you need — use the player, then fine-tune with the frame buttons
            — and capture it.
          </p>
        </div>
      )}

      {stills.length > 0 && (
        <ul className="mt-5 divide-y divide-bone-dark border-y border-bone-dark">
          {stills.map((still, i) => (
            <li key={still.id} className="flex items-center gap-4 py-3">
              <span className="w-6 shrink-0 font-mono text-[11px] text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element -- object URL, not an asset */}
              <img
                src={still.url}
                alt={`Captured moment at ${fmtDuration(still.atSeconds, true)}`}
                className="h-20 w-auto rounded-sm border border-bone-dark"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">
                  Moment at {fmtDuration(still.atSeconds, true)}
                </p>
                <p className="text-xs text-muted">
                  {still.width}×{still.height} · {fmtSize(still.blob.size)}
                </p>
              </div>
              <Btn variant="outline" small onClick={() => removeStill(still.id)}>
                Remove
              </Btn>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 rounded-sm border border-bone-dark bg-white px-4 py-3 text-sm">
        {audioState.name === "working" && (
          <p className="flex items-center gap-2 text-muted">
            <SpinnerIcon className="h-4 w-4 text-gold-deep" />
            Extracting the audio track…{" "}
            {audioState.progress > 0 && `${Math.round(audioState.progress * 100)}%`}
          </p>
        )}
        {audioState.name === "done" && (
          <p className="flex items-center gap-2 text-ink">
            <CheckCircleIcon className="h-4 w-4 text-emerald-700" />
            Audio track ready ({fmtSize(audioState.blob.size)} MP3) — it will be sent with your
            captures.
          </p>
        )}
        {audioState.name === "unavailable" && (
          <p className="leading-relaxed text-muted">{audioState.message}</p>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Btn disabled={!canSave} onClick={save}>
          {audioBusy ? (
            <>
              <SpinnerIcon className="h-4 w-4" /> Preparing…
            </>
          ) : (
            "Save and continue"
          )}
        </Btn>
        <Btn variant="outline" onClick={onSkip}>
          Skip — send nothing from this recording
        </Btn>
      </div>
      {!canSave && !audioBusy && (
        <p className="mt-3 text-xs text-muted">
          Capture at least one moment to continue. Skipping sends nothing from this recording.
        </p>
      )}
    </Modal>
  );
}
