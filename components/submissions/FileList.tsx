"use client";

import { useState } from "react";
import { fmtDuration, fmtSize, formatCaptureShort } from "@/lib/submissions/format";
import { KIND_LABEL } from "@/lib/submissions/shared";
import type { QueueItem } from "./types";
import { Btn } from "./Buttons";
import {
  AlertIcon,
  AudioIcon,
  CheckCircleIcon,
  ClockIcon,
  ImageIcon,
  RetryIcon,
  SpinnerIcon,
  VideoIcon,
} from "./icons";

type FileListProps = {
  items: QueueItem[];
  onRetry: (localId: string) => void;
};

function Thumb({ item }: { item: QueueItem }) {
  const [broken, setBroken] = useState(false);
  const frame =
    "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-bone-dark bg-white text-muted";
  if (item.kind === "image" && item.previewUrl && !broken) {
    return (
      <div className={frame}>
        {/* eslint-disable-next-line @next/next/no-img-element -- object URL, not an asset */}
        <img
          src={item.previewUrl}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setBroken(true)}
        />
      </div>
    );
  }
  const Icon = item.kind === "video" ? VideoIcon : item.kind === "audio" ? AudioIcon : ImageIcon;
  return (
    <div className={frame}>
      <Icon className="h-7 w-7" />
    </div>
  );
}

function UploadBadge({ item, onRetry }: { item: QueueItem; onRetry: () => void }) {
  const { upload } = item;
  if (upload.status === "done") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
        <CheckCircleIcon className="h-4 w-4" /> Received
      </span>
    );
  }
  if (upload.status === "failed") {
    return (
      <span className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-red-700">
          <AlertIcon className="h-4 w-4" /> Not received
        </span>
        {upload.retryable && (
          <Btn variant="outline" small onClick={onRetry}>
            <RetryIcon className="h-3.5 w-3.5" /> Retry
          </Btn>
        )}
      </span>
    );
  }
  if (upload.status === "uploading") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-gold-deep">
        <SpinnerIcon className="h-4 w-4" /> Uploading {Math.round(upload.progress * 100)}%
      </span>
    );
  }
  if (upload.status === "local") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        <VideoIcon className="h-4 w-4" /> Stays on your device
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
      <ClockIcon className="h-4 w-4" /> {item.parentLocalId ? "Waiting for the recording" : "Waiting"}
    </span>
  );
}

function CaptureLine({ item }: { item: QueueItem }) {
  if (item.parentLocalId) {
    if (item.frameAtSeconds !== null) {
      return (
        <p className="text-xs text-muted">
          Moment at {fmtDuration(item.frameAtSeconds, true)} of the recording above
        </p>
      );
    }
    if (item.clip) {
      return (
        <p className="text-xs text-muted">
          Audio {fmtDuration(item.clip.startSeconds)}–{fmtDuration(item.clip.endSeconds)} of the
          recording above
        </p>
      );
    }
    return <p className="text-xs text-muted">Audio track of the recording above</p>;
  }
  const c = item.confirmation;
  if (c) {
    if ((c.status === "confirmed" || c.status === "corrected") && c.attestedAt) {
      return (
        <p className="text-xs text-muted">
          Captured{" "}
          <span className="font-medium text-ink">{formatCaptureShort(c.attestedAt)}</span>
          <span className="ml-1.5 text-emerald-700">
            · {c.status === "confirmed" ? "confirmed" : "corrected"} by you
          </span>
        </p>
      );
    }
    return <p className="text-xs text-muted">Capture date: not sure — noted for our team</p>;
  }
  if (!item.capture) return <p className="text-xs text-muted">Reading file details…</p>;
  if (item.capture.value) {
    return (
      <p className="text-xs text-muted">
        Detected {formatCaptureShort(item.capture.value)}
        <span className="ml-1.5 text-gold-deep">· awaiting your confirmation</span>
      </p>
    );
  }
  return <p className="text-xs text-muted">No capture date found · awaiting your answer</p>;
}

export default function FileList({ items, onRetry }: FileListProps) {
  if (items.length === 0) return null;
  return (
    <ul className="divide-y divide-bone-dark border-y border-bone-dark">
      {items.map((item) => (
        <li
          key={item.localId}
          className={`flex gap-4 py-4 ${item.parentLocalId ? "pl-6 sm:pl-10" : ""}`}
        >
          <Thumb item={item} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                <p className="text-xs text-muted">
                  {item.parentLocalId
                    ? item.frameAtSeconds !== null
                      ? "Captured moment"
                      : "Audio track"
                    : KIND_LABEL[item.kind]}{" "}
                  ·{" "}
                  {fmtSize(item.size)}
                  {item.upload.status === "local" &&
                    " · the moments you capture and its audio are sent instead"}
                </p>
              </div>
              <UploadBadge item={item} onRetry={() => onRetry(item.localId)} />
            </div>
            <div className="mt-2">
              <CaptureLine item={item} />
            </div>
            {item.upload.status === "uploading" && (
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-bone-dark">
                <div
                  className="h-full bg-gold transition-[width] duration-300"
                  style={{ width: `${Math.round(item.upload.progress * 100)}%` }}
                />
              </div>
            )}
            {item.upload.status === "failed" && item.upload.error && (
              <p className="mt-2 text-xs text-red-700">{item.upload.error}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
