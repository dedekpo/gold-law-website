import type {
  ConfirmationStatus,
  DetectedCapture,
  SubmissionFileKind,
} from "@/lib/submissions/shared";

/** One file in the portal's queue — the browser-side view of a submission. */

/**
 * "local": the file stays on the client's device and is never sent — screen
 * recordings, whose captured frames and audio track are what gets submitted.
 */
export type UploadStatus = "queued" | "uploading" | "done" | "failed" | "local";

export type UploadState = {
  status: UploadStatus;
  /** 0..1 of the bytes sent. */
  progress: number;
  /** Server record id, known once the upload is signed. */
  fileId: string | null;
  error: string | null;
  /** False when the failure is final (quota, type, size) and retrying is pointless. */
  retryable: boolean;
  attempts: number;
};

export type LocalConfirmation = {
  status: ConfirmationStatus;
  attestedAt: string | null;
  note: string | null;
  /** True once the server has stored the answer. */
  sent: boolean;
  /** Failed delivery attempts so far, and when the next one may run (ms epoch). */
  attempts: number;
  nextAttemptAt: number;
  error: string | null;
};

export type ClipStatus = "pending" | "saved" | "skipped" | "unavailable";

export type QueueItem = {
  localId: string;
  blob: Blob;
  name: string;
  size: number;
  contentType: string;
  lastModified: number | null;
  kind: SubmissionFileKind;
  /** Object URL for previews; revoked on unmount. */
  previewUrl: string | null;
  /** Null while the file is still being read. */
  capture: DetectedCapture | null;
  upload: UploadState;
  confirmation: LocalConfirmation | null;
  /** Derived files only (audio track, captured frame): the recording they came from. */
  parentLocalId: string | null;
  clip: { startSeconds: number; endSeconds: number } | null;
  frameAtSeconds: number | null;
  /** Video originals only: whether the audio/frame step has been dealt with. */
  clipStatus: ClipStatus | null;
};

/** The review steps queued up for the client, processed one modal at a time. */
export type ReviewTask =
  | { kind: "date"; localId: string }
  | { kind: "clip"; localId: string };
