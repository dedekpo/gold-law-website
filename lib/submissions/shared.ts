/**
 * Client submissions — types and limits shared by the browser and the API.
 *
 * Data model (Firestore, shared with the backoffice app):
 *   submissionFiles/{fileId}     one document per uploaded file (SubmissionFileDoc)
 *   submissions/{contactId}      per-contact counters (SubmissionContactDoc)
 *   submissionRateLimits/{key}   fixed-window counters used by the sign endpoint
 *
 * Storage (default bucket): submissions/{contactId}/{fileId}/{original filename}
 * The bytes are stored exactly as the browser read them from disk — no
 * re-encoding, no stripping — so any embedded metadata (EXIF, XMP, QuickTime
 * creation dates) survives. Filesystem-level timestamps do not travel inside
 * the bytes, so the browser's File.lastModified is recorded on the document.
 */

/** GHL contact ids are 20 alphanumerics; only the character set and an upper bound are enforced. */
export const CONTACT_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

export type SubmissionFileKind = "image" | "video" | "audio";

const MB = 1024 * 1024;

export const LIMITS = {
  /** Hard cap on files per contact, pending ones included. */
  maxFilesPerContact: 100,
  maxBytes: {
    image: 60 * MB,
    audio: 250 * MB,
    video: 1536 * MB,
  } satisfies Record<SubmissionFileKind, number>,
  /** Sign requests per fixed one-minute window. */
  signPerMinutePerContact: 30,
  signPerMinutePerIp: 60,
  /** Distinct contact ids one IP may upload for per hour — stops invented links. */
  distinctContactsPerHourPerIp: 5,
  /** complete + confirm calls per minute per IP. */
  auxPerMinutePerIp: 120,
  /** Signed upload URLs stay valid this long — a 1.5 GB video on a slow link needs it. */
  signedUrlTtlMs: 2 * 60 * 60 * 1000,
  maxNameLength: 255,
  /** Audio derived from a video recording. */
  clip: {
    minSeconds: 1,
    maxSeconds: 60 * 60,
    /** Recordings longer than this are not decoded in the browser (memory). */
    maxDecodeSeconds: 20 * 60,
  },
  /** Frames captured from a recording, per recording. */
  maxFramesPerRecording: 10,
} as const;

export const KIND_LABEL: Record<SubmissionFileKind, string> = {
  image: "Screenshot",
  video: "Screen recording",
  audio: "Audio recording",
};

const EXT_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  bmp: "image/bmp",
  heic: "image/heic",
  heif: "image/heif",
  avif: "image/avif",
  tif: "image/tiff",
  tiff: "image/tiff",
  mp4: "video/mp4",
  m4v: "video/x-m4v",
  mov: "video/quicktime",
  webm: "video/webm",
  mkv: "video/x-matroska",
  "3gp": "video/3gpp",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  aac: "audio/aac",
  wav: "audio/wav",
  ogg: "audio/ogg",
  opus: "audio/opus",
  flac: "audio/flac",
  amr: "audio/amr",
  caf: "audio/x-caf",
};

export function fileExtension(name: string): string {
  const m = /\.([A-Za-z0-9]{1,8})$/.exec(name);
  return m ? m[1].toLowerCase() : "";
}

/**
 * Resolve the content type we store: the browser's declared type when it is a
 * real media type, else a guess from the extension (Windows and Android
 * frequently hand over an empty type for HEIC/MOV/AMR).
 */
export function resolveContentType(declared: string, name: string): string {
  const clean = declared.trim().toLowerCase();
  if (/^(image|video|audio)\/[\w.+-]+$/.test(clean)) return clean;
  return EXT_MIME[fileExtension(name)] ?? "";
}

/** Classify a file; null when it is not an image, video, or audio file. */
export function detectKind(contentType: string, name: string): SubmissionFileKind | null {
  const type = resolveContentType(contentType, name);
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  return null;
}

/** The browser file picker's accept list. */
export const ACCEPT =
  "image/*,video/*,audio/*,.png,.jpg,.jpeg,.heic,.heif,.webp,.gif,.mp4,.mov,.m4v,.webm,.3gp,.mp3,.m4a,.aac,.wav,.amr,.caf,.ogg,.opus";

// ---------------------------------------------------------------------------
// Capture date — what the browser could read out of the file before upload
// ---------------------------------------------------------------------------

export type CaptureSource =
  /** EXIF DateTimeOriginal / CreateDate (JPEG, HEIC, PNG eXIf chunk). */
  | "exif"
  /** XMP xmp:CreateDate / photoshop:DateCreated / exif:DateTimeOriginal. */
  | "xmp"
  /** PNG tEXt/iTXt "Creation Time" keyword. */
  | "png-text"
  /** QuickTime com.apple.quicktime.creationdate — carries the UTC offset. */
  | "quicktime"
  /** ISO BMFF mvhd creation_time (seconds since 1904, UTC). */
  | "mp4"
  /** The OS modification timestamp the browser reported (File.lastModified). */
  | "file-modified"
  | "none";

export type DetectedCapture = {
  /**
   * ISO 8601. With an offset (`…-05:00` / `…Z`) when the source carried one,
   * otherwise a floating wall-clock time (`2024-03-05T22:30:15`) exactly as the
   * device wrote it — never shifted into another timezone.
   */
  value: string | null;
  source: CaptureSource;
  offsetKnown: boolean;
  /** The raw strings the value was derived from, for the record. */
  raw: Record<string, string>;
};

export const CAPTURE_SOURCES: ReadonlySet<string> = new Set<CaptureSource>([
  "exif",
  "xmp",
  "png-text",
  "quicktime",
  "mp4",
  "file-modified",
  "none",
]);

/** Sources that come from inside the file itself, not the filesystem. */
export function isEmbeddedSource(source: CaptureSource): boolean {
  return source !== "file-modified" && source !== "none";
}

export type ConfirmationStatus = "confirmed" | "corrected" | "unknown";

export type CaptureConfirmation = {
  status: ConfirmationStatus;
  /**
   * When the client says the capture happened. Equal to the detected value when
   * confirmed, client-entered (floating local time) when corrected, null when
   * they could not say.
   */
  attestedAt: string | null;
  note: string | null;
  /** Server time the answer was recorded. */
  respondedAt: string;
  ip: string | null;
  userAgent: string | null;
};

export type SubmissionFileStatus = "pending" | "uploaded";

export type SubmissionFileDoc = {
  id: string;
  contactId: string;
  status: SubmissionFileStatus;
  /** Original filename as the client's device reported it. */
  name: string;
  contentType: string;
  /** Byte size claimed at sign time; the signed URL only accepts exactly this. */
  size: number;
  kind: SubmissionFileKind;
  /** Object path inside the default bucket (never a URL — those expire). */
  storagePath: string;
  /** ISO — when the upload was authorised. */
  createdAt: string;
  /** ISO — when the object was verified in the bucket. */
  uploadedAt: string | null;
  /** The browser's File.lastModified, ISO. */
  clientLastModified: string | null;
  capture: DetectedCapture;
  confirmation: CaptureConfirmation | null;
  /** For files derived from a recording (its audio track, a captured frame): the source file id. */
  derivedFrom: string | null;
  /** Audio derived from a recording: the range it covers; null = the whole track. */
  clip: { startSeconds: number; endSeconds: number } | null;
  /** A frame captured from a recording: the playback position it was taken at. */
  frameAtSeconds: number | null;
  /** What the bucket reported once the upload landed. */
  verified: {
    size: number;
    md5: string | null;
    crc32c: string | null;
    contentType: string | null;
  } | null;
  client: { ip: string | null; userAgent: string | null };
  schemaVersion: 1;
};

export type SubmissionContactDoc = {
  contactId: string;
  fileCount: number;
  totalBytes: number;
  firstUploadAt: string;
  lastUploadAt: string;
};

// ---------------------------------------------------------------------------
// API contracts
// ---------------------------------------------------------------------------

export type SignRequest = {
  name: string;
  size: number;
  contentType: string;
  lastModified: number | null;
  capture: DetectedCapture;
  derivedFrom?: string | null;
  clip?: { startSeconds: number; endSeconds: number } | null;
  frameAtSeconds?: number | null;
  /** Re-issue a URL for an existing pending file (expired signature, retry). */
  resignFileId?: string | null;
};

export type SignResponse = {
  fileId: string;
  uploadUrl: string;
  /** Every header the PUT must carry — they are part of the signature. */
  headers: Record<string, string>;
  expiresAt: string;
};

export type CompleteRequest = { fileId: string };
export type CompleteResponse = { ok: true; fileId: string; status: SubmissionFileStatus };

export type ConfirmRequest = {
  fileId: string;
  status: ConfirmationStatus;
  attestedAt: string | null;
  note?: string | null;
};
export type ConfirmResponse = { ok: true };

export type ApiError = { error: string; code?: string };
