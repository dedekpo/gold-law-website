"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fmtDuration, fmtSize } from "@/lib/submissions/format";
import { detectCapture, fromLastModified } from "@/lib/submissions/metadata";
import {
  detectKind,
  KIND_LABEL,
  LIMITS,
  resolveContentType,
  type DetectedCapture,
} from "@/lib/submissions/shared";
import {
  confirmCapture,
  UploadError,
  uploadSubmissionFile,
} from "@/lib/submissions/upload-client";
import DateConfirmDialog, { type DateAnswer } from "./DateConfirmDialog";
import Dropzone from "./Dropzone";
import FileList from "./FileList";
import VideoEvidenceDialog, { type VideoEvidenceResult } from "./VideoEvidenceDialog";
import { AlertIcon, CheckCircleIcon, CloseIcon, SpinnerIcon } from "./icons";
import type { QueueItem, ReviewTask } from "./types";

/**
 * The client-facing evidence upload flow for one contact.
 *
 *  - Files are queued the moment they are picked and uploaded one at a time,
 *    each straight to storage, untouched (see lib/submissions/upload-client).
 *  - In parallel, the browser reads each file's capture date and the client
 *    is walked through one review dialog per file: confirm the date, and for
 *    screen recordings, capture the frames that show the violation (saved as
 *    PNGs) while the audio track is extracted (saved as an MP3).
 *  - Nothing waits on the dialogs: an abandoned review still leaves the
 *    files safely uploaded.
 *
 * The queue lives in a ref that is updated synchronously alongside React
 * state, so the upload pump can read it without waiting for a render.
 */

type Props = {
  contactId: string;
  /** Files this link had already received before this visit (null if unknown). */
  previouslyReceived: number | null;
};

// Server errors that a retry cannot fix.
const FINAL_ERROR_CODES = new Set([
  "quota_exceeded",
  "too_large",
  "unsupported_type",
  "bad_contact",
  "bad_name",
  "bad_size",
  "bad_parent",
  "bad_clip",
  "bad_capture",
]);

const PARENT_FAILED_MESSAGE =
  "The recording this was taken from could not be uploaded, so this file was not sent.";

function newLocalId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const baseName = (name: string) => name.replace(/\.[^.]+$/, "");
/** 95.4 s → "1m35s", safe inside a filename. */
const stamp = (seconds: number) => fmtDuration(seconds).replace(":", "m") + "s";

const NO_CAPTURE: DetectedCapture = { value: null, source: "none", offsetKnown: false, raw: {} };

const QUEUED = {
  status: "queued",
  progress: 0,
  fileId: null,
  error: null,
  retryable: true,
  attempts: 0,
} as const;

/** Is this queued item allowed to upload yet? Derived files wait for their recording. */
function readiness(
  item: QueueItem,
  all: QueueItem[],
): "ready" | "waiting" | "parent-failed" {
  if (!item.parentLocalId) return "ready";
  const parent = all.find((p) => p.localId === item.parentLocalId);
  if (!parent || parent.upload.status === "done") return "ready";
  if (parent.upload.status === "failed" && !parent.upload.retryable) return "parent-failed";
  return "waiting";
}

export default function SubmissionPortal({ contactId, previouslyReceived }: Props) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [tasks, setTasks] = useState<ReviewTask[]>([]);
  const [notices, setNotices] = useState<string[]>([]);

  const itemsRef = useRef<QueueItem[]>([]);
  const captureRef = useRef(new Map<string, Promise<DetectedCapture>>());
  const pumpingRef = useRef(false);
  const sendingRef = useRef(new Set<string>());
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flushRef = useRef<() => void>(() => undefined);
  const urlsRef = useRef<string[]>([]);

  useEffect(
    () => () => {
      for (const url of urlsRef.current) URL.revokeObjectURL(url);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    },
    [],
  );

  /** Every change to the queue goes through here so the ref and state agree. */
  const commit = useCallback((updater: (prev: QueueItem[]) => QueueItem[]) => {
    const next = updater(itemsRef.current);
    itemsRef.current = next;
    setItems(next);
  }, []);

  const patchItem = useCallback(
    (id: string, fn: (it: QueueItem) => Partial<QueueItem>) =>
      commit((prev) => prev.map((it) => (it.localId === id ? { ...it, ...fn(it) } : it))),
    [commit],
  );

  const trackUrl = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    urlsRef.current.push(url);
    return url;
  };

  // ---- the upload queue (one file at a time) --------------------------------

  const runUpload = useCallback(
    async (item: QueueItem) => {
      const id = item.localId;
      patchItem(id, (it) => ({
        upload: {
          ...it.upload,
          status: "uploading",
          progress: 0,
          error: null,
          attempts: it.upload.attempts + 1,
        },
      }));
      // Excerpts inherit the recording's capture date.
      const capture =
        (await captureRef.current.get(item.parentLocalId ?? id)) ?? NO_CAPTURE;
      const parent = item.parentLocalId
        ? itemsRef.current.find((it) => it.localId === item.parentLocalId)
        : null;
      try {
        const { fileId } = await uploadSubmissionFile({
          contactId,
          blob: item.blob,
          name: item.name,
          contentType: item.contentType,
          lastModified: item.lastModified,
          capture,
          derivedFrom: parent?.upload.fileId ?? null,
          clip: item.clip,
          frameAtSeconds: item.frameAtSeconds,
          // A retry reuses the record from the failed attempt when it still exists.
          resignFileId: item.upload.fileId,
          onFileId: (fid) =>
            patchItem(id, (it) => ({
              upload: { ...it.upload, fileId: fid },
              // A new record needs the date answer delivered again.
              confirmation:
                it.confirmation && it.upload.fileId !== fid
                  ? { ...it.confirmation, sent: false, attempts: 0, nextAttemptAt: 0 }
                  : it.confirmation,
            })),
          onProgress: (f) => patchItem(id, (it) => ({ upload: { ...it.upload, progress: f } })),
        });
        patchItem(id, (it) => ({
          upload: { ...it.upload, status: "done", progress: 1, fileId },
        }));
      } catch (err) {
        const e =
          err instanceof UploadError
            ? err
            : new UploadError("The upload failed.", { code: "unknown", retryable: true });
        patchItem(id, (it) => ({
          upload: {
            ...it.upload,
            status: "failed",
            error: e.message,
            retryable: !FINAL_ERROR_CODES.has(e.code),
          },
        }));
      }
    },
    [contactId, patchItem],
  );

  /** Drain the queue in order. Safe to call any time; no-op while running. */
  const pump = useCallback(async () => {
    if (pumpingRef.current) return;
    pumpingRef.current = true;
    try {
      for (;;) {
        let next: QueueItem | null = null;
        for (const it of itemsRef.current) {
          if (it.upload.status !== "queued") continue;
          const state = readiness(it, itemsRef.current);
          if (state === "ready") {
            next = it;
            break;
          }
          if (state === "parent-failed") {
            patchItem(it.localId, (cur) => ({
              upload: {
                ...cur.upload,
                status: "failed",
                retryable: false,
                error: PARENT_FAILED_MESSAGE,
              },
            }));
          }
        }
        if (!next) break;
        await runUpload(next);
      }
    } finally {
      pumpingRef.current = false;
    }
  }, [patchItem, runUpload]);

  // ---- intake ---------------------------------------------------------------

  const addFiles = useCallback(
    (files: File[]) => {
      const rejected: string[] = [];
      const fresh: QueueItem[] = [];
      const freshTasks: ReviewTask[] = [];
      let budget =
        LIMITS.maxFilesPerContact - itemsRef.current.length - (previouslyReceived ?? 0);

      for (const file of files) {
        const kind = detectKind(file.type, file.name);
        if (!kind) {
          rejected.push(
            `"${file.name}" was not added — only screenshots, screen recordings, and audio recordings can be submitted.`,
          );
          continue;
        }
        if (file.size <= 0) {
          rejected.push(`"${file.name}" was not added — the file is empty.`);
          continue;
        }
        if (file.size > LIMITS.maxBytes[kind]) {
          rejected.push(
            `"${file.name}" was not added — it is larger than the ${fmtSize(LIMITS.maxBytes[kind])} limit for a ${KIND_LABEL[kind].toLowerCase()}.`,
          );
          continue;
        }
        if (budget <= 0) {
          rejected.push(
            `"${file.name}" was not added — this link has reached its limit of ${LIMITS.maxFilesPerContact} files. Please contact our office to send more.`,
          );
          continue;
        }
        budget--;

        const id = newLocalId();
        fresh.push({
          localId: id,
          blob: file,
          name: file.name,
          size: file.size,
          contentType: resolveContentType(file.type, file.name) || file.type,
          lastModified: Number.isFinite(file.lastModified) ? file.lastModified : null,
          kind,
          previewUrl: trackUrl(file),
          capture: null,
          upload: QUEUED,
          confirmation: null,
          parentLocalId: null,
          clip: null,
          frameAtSeconds: null,
          clipStatus: kind === "video" ? "pending" : null,
        });
        freshTasks.push({ kind: "date", localId: id });
        if (kind === "video") freshTasks.push({ kind: "clip", localId: id });

        const detection = detectCapture(file).catch(() => fromLastModified(file));
        captureRef.current.set(id, detection);
        void detection.then((capture) => patchItem(id, () => ({ capture })));
      }

      if (rejected.length) setNotices((prev) => [...prev, ...rejected]);
      if (fresh.length) {
        commit((prev) => [...prev, ...fresh]);
        setTasks((prev) => [...prev, ...freshTasks]);
        void pump();
      }
    },
    [commit, patchItem, previouslyReceived, pump],
  );

  // ---- deliver date answers once the file has a server id ------------------

  const flushConfirmations = useCallback(() => {
    const now = Date.now();
    for (const it of itemsRef.current) {
      const c = it.confirmation;
      const fileId = it.upload.fileId;
      if (!c || c.sent || !fileId || c.nextAttemptAt > now) continue;
      if (sendingRef.current.has(it.localId)) continue;
      sendingRef.current.add(it.localId);
      confirmCapture(contactId, {
        fileId,
        status: c.status,
        attestedAt: c.attestedAt,
        note: c.note,
      })
        .then(() =>
          patchItem(it.localId, (cur) => ({
            confirmation: cur.confirmation
              ? { ...cur.confirmation, sent: true, error: null }
              : null,
          })),
        )
        .catch((err: unknown) => {
          // Back off, and make sure a retry happens even if nothing else
          // changes on the page (the flush otherwise only runs on updates).
          const attempts = c.attempts + 1;
          const delay = Math.min(30_000 * attempts, 5 * 60_000);
          patchItem(it.localId, (cur) => ({
            confirmation: cur.confirmation
              ? {
                  ...cur.confirmation,
                  attempts,
                  nextAttemptAt: Date.now() + delay,
                  error: err instanceof Error ? err.message : "Could not save your answer.",
                }
              : null,
          }));
          if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
          retryTimerRef.current = setTimeout(() => {
            retryTimerRef.current = null;
            flushRef.current();
          }, delay + 50);
        })
        .finally(() => sendingRef.current.delete(it.localId));
    }
  }, [contactId, patchItem]);

  useEffect(() => {
    flushRef.current = flushConfirmations;
    flushConfirmations();
  }, [items, flushConfirmations]);

  // ---- review dialogs -------------------------------------------------------

  const currentTask = useMemo(
    () => tasks.find((t) => items.some((it) => it.localId === t.localId)) ?? null,
    [tasks, items],
  );
  const currentItem = currentTask
    ? (items.find((it) => it.localId === currentTask.localId) ?? null)
    : null;
  const finishTask = () => setTasks((prev) => prev.filter((t) => t !== currentTask));

  const originals = useMemo(() => items.filter((it) => !it.parentLocalId), [items]);
  const reviewIndex = currentItem
    ? originals.findIndex((it) => it.localId === currentItem.localId)
    : -1;

  const onDateAnswer = (answer: DateAnswer) => {
    if (!currentItem) return;
    patchItem(currentItem.localId, () => ({
      confirmation: { ...answer, sent: false, attempts: 0, nextAttemptAt: 0, error: null },
    }));
    finishTask();
  };

  const onVideoSave = (result: VideoEvidenceResult) => {
    if (!currentItem) return;
    const parent = currentItem;
    const base = baseName(parent.name).slice(0, 170);
    const derived = (
      partial: Pick<QueueItem, "blob" | "name" | "contentType" | "kind" | "clip" | "frameAtSeconds">,
    ): QueueItem => ({
      localId: newLocalId(),
      size: partial.blob.size,
      lastModified: null,
      previewUrl: trackUrl(partial.blob),
      capture: parent.capture,
      upload: QUEUED,
      confirmation: null,
      parentLocalId: parent.localId,
      clipStatus: null,
      ...partial,
    });
    const fresh: QueueItem[] = [];
    if (result.audio) {
      fresh.push(
        derived({
          blob: result.audio,
          name: `${base} audio track.mp3`,
          contentType: "audio/mpeg",
          kind: "audio",
          clip: null,
          frameAtSeconds: null,
        }),
      );
    }
    for (const frame of result.frames) {
      fresh.push(
        derived({
          blob: frame.blob,
          name: `${base} frame at ${stamp(frame.atSeconds)}.png`,
          contentType: "image/png",
          kind: "image",
          clip: null,
          frameAtSeconds: frame.atSeconds,
        }),
      );
    }
    // Sit right under the recording (after anything already derived from it) so
    // the list reads naturally; the pump never sends them before the recording.
    commit((prev) => {
      const at = prev.findIndex((it) => it.localId === parent.localId);
      let insertAt = at + 1;
      while (insertAt < prev.length && prev[insertAt].parentLocalId === parent.localId) insertAt++;
      const next = [...prev];
      next.splice(insertAt, 0, ...fresh);
      return next;
    });
    patchItem(parent.localId, () => ({ clipStatus: fresh.length ? "saved" : "skipped" }));
    finishTask();
    void pump();
  };

  const onClipSkip = () => {
    if (currentItem) patchItem(currentItem.localId, () => ({ clipStatus: "skipped" }));
    finishTask();
  };

  const retry = (id: string) => {
    patchItem(id, (it) => ({
      upload: { ...it.upload, status: "queued", error: null, progress: 0 },
    }));
    // Derived files blocked on this recording get another go too.
    commit((prev) =>
      prev.map((it) =>
        it.parentLocalId === id && it.upload.status === "failed" && it.upload.error === PARENT_FAILED_MESSAGE
          ? { ...it, upload: { ...it.upload, status: "queued", error: null, retryable: true } }
          : it,
      ),
    );
    void pump();
  };

  // ---- status ---------------------------------------------------------------

  const stats = useMemo(() => {
    const done = items.filter((it) => it.upload.status === "done").length;
    const failed = items.filter((it) => it.upload.status === "failed").length;
    // Queued derived files whose recording failed are parked, not in progress.
    const active = items.filter(
      (it) =>
        it.upload.status === "uploading" ||
        (it.upload.status === "queued" && readiness(it, items) !== "waiting"),
    ).length;
    const unsentAnswers = items.filter(
      (it) => it.confirmation && !it.confirmation.sent && it.upload.status !== "failed",
    ).length;
    const progress =
      items.length === 0
        ? 0
        : items.reduce(
            (sum, it) => sum + (it.upload.status === "done" ? 1 : it.upload.progress),
            0,
          ) / items.length;
    return { total: items.length, done, failed, active, unsentAnswers, progress };
  }, [items]);

  const uploading = stats.active > 0;
  const workPending = uploading || stats.unsentAnswers > 0;
  useEffect(() => {
    if (!workPending) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Older Chrome / Android WebView still key off returnValue.
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [workPending]);

  const complete =
    items.length > 0 && !workPending && stats.failed === 0 && !currentTask;

  return (
    <>
      <div className="rounded-sm border border-bone-dark bg-white shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-bone-dark px-6 py-5">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-deep">
              Secure upload
            </p>
            <h2 className="font-serif text-2xl font-semibold leading-tight text-ink">
              Submit your evidence
            </h2>
          </div>
          <p className="text-xs text-muted">
            Reference <span className="font-mono text-ink">{contactId}</span>
          </p>
        </div>

        <div className="px-6 py-6">
          {previouslyReceived !== null && previouslyReceived > 0 && (
            <p className="mb-5 flex items-start gap-3 rounded-sm border border-gold/40 bg-gold/10 px-4 py-3 text-sm leading-relaxed text-ink">
              <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" />
              <span>
                Our office has already received{" "}
                <strong>
                  {previouslyReceived} file{previouslyReceived === 1 ? "" : "s"}
                </strong>{" "}
                through this link. Anything you add below is attached to the same matter.
              </span>
            </p>
          )}

          <Dropzone onFiles={addFiles} compact={items.length > 0} />

          {notices.length > 0 && (
            <ul className="mt-4 space-y-2">
              {notices.map((notice, i) => (
                <li
                  key={`${i}-${notice}`}
                  className="flex items-start gap-3 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-800"
                >
                  <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="flex-1">{notice}</span>
                  <button
                    type="button"
                    aria-label="Dismiss"
                    onClick={() => setNotices((prev) => prev.filter((_, j) => j !== i))}
                    className="cursor-pointer text-red-800/60 hover:text-red-800"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {items.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
                {uploading ? (
                  <>
                    <SpinnerIcon className="h-4 w-4 text-gold-deep" />
                    Uploading {Math.min(stats.done + stats.failed + 1, stats.total)} of{" "}
                    {stats.total}…
                  </>
                ) : stats.failed > 0 ? (
                  <>
                    <AlertIcon className="h-4 w-4 text-red-700" />
                    {stats.done} of {stats.total} received · {stats.failed} need
                    {stats.failed === 1 ? "s" : ""} attention
                  </>
                ) : stats.unsentAnswers > 0 ? (
                  <>
                    <SpinnerIcon className="h-4 w-4 text-gold-deep" />
                    Saving your answers…
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4 text-emerald-700" />
                    All {stats.total} file{stats.total === 1 ? "" : "s"} received
                  </>
                )}
              </p>
              <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-bone-dark">
                <div
                  className={`h-full transition-[width] duration-300 ${
                    stats.failed > 0 && !uploading ? "bg-red-600" : "bg-gold"
                  }`}
                  style={{ width: `${Math.round(stats.progress * 100)}%` }}
                />
              </div>
              <FileList items={items} onRetry={retry} />
            </div>
          )}

          {complete && (
            <div className="mt-6 rounded-sm border border-gold/40 bg-bone px-5 py-5">
              <h3 className="font-serif text-xl font-semibold text-ink">
                Thank you — your submission is complete.
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Our team will review your files and contact you if anything further is needed.
                Please keep the original files on your device until your matter is resolved. You
                may return to this page at any time to add more.
              </p>
            </div>
          )}

          {workPending && (
            <p className="mt-4 text-xs leading-relaxed text-muted">
              Please keep this page open until every file shows as received. Files are sent one
              at a time to keep the upload reliable on mobile connections.
            </p>
          )}
        </div>
      </div>

      {currentTask?.kind === "date" && currentItem && (
        <DateConfirmDialog
          key={currentItem.localId}
          item={currentItem}
          index={reviewIndex}
          total={originals.length}
          onAnswer={onDateAnswer}
        />
      )}
      {currentTask?.kind === "clip" && currentItem && (
        <VideoEvidenceDialog
          key={currentItem.localId}
          item={currentItem}
          index={reviewIndex}
          total={originals.length}
          onSave={onVideoSave}
          onSkip={onClipSkip}
        />
      )}
    </>
  );
}
