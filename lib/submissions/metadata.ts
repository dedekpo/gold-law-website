import { detectKind, type CaptureSource, type DetectedCapture } from "./shared";

/**
 * Read the capture date out of a file before it is uploaded — the value the
 * client is asked to confirm. Nothing here alters the file: the bytes go to
 * storage untouched, so whatever we miss can still be re-read later.
 *
 * Sources, best first:
 *   images  EXIF DateTimeOriginal/CreateDate (+ OffsetTime*), XMP CreateDate /
 *           DateCreated, PNG "Creation Time" text, then the PNG eXIf chunk.
 *   video/  QuickTime com.apple.quicktime.creationdate (has the UTC offset),
 *   audio   then the ISO BMFF mvhd creation_time (UTC).
 *   any     File.lastModified — the OS timestamp, which for a screenshot
 *           picked from a phone's photo library is often (not always) the
 *           capture time. Flagged as such so the UI can say so.
 */

export async function detectCapture(file: File): Promise<DetectedCapture> {
  const kind = detectKind(file.type, file.name);
  let found: DetectedCapture | null = null;
  try {
    if (kind === "image") found = await fromImage(file);
    else if (kind === "video" || kind === "audio") found = await fromIsoBmff(file);
  } catch {
    // A malformed container is not an error for the client — fall through.
  }
  return found ?? fromLastModified(file);
}

// A modification time this close to "now" is the browser exporting a temporary
// copy (iOS Safari does this for Photos-library picks), not the capture time.
const RECENT_MODIFIED_MS = 15 * 60 * 1000;

export function fromLastModified(file: File): DetectedCapture {
  const ms = file.lastModified;
  if (typeof ms !== "number" || !Number.isFinite(ms) || ms <= 0) {
    return { value: null, source: "none", offsetKnown: false, raw: {} };
  }
  const date = new Date(ms);
  if (!plausibleYear(date.getFullYear()) || Date.now() - ms < RECENT_MODIFIED_MS) {
    return {
      value: null,
      source: "none",
      offsetKnown: false,
      raw: { lastModified: String(ms), lastModifiedIgnored: "recent-or-implausible" },
    };
  }
  return {
    value: date.toISOString(),
    source: "file-modified",
    offsetKnown: true,
    raw: { lastModified: String(ms) },
  };
}

// ---------------------------------------------------------------------------
// Date string normalisation
// ---------------------------------------------------------------------------

// exifr is browser-only work and ~75 KB: load it on first use, never during SSR.
type ExifrParse = (data: ArrayBuffer | Uint8Array, options: Record<string, unknown>) => Promise<unknown>;
let exifrModule: Promise<ExifrParse> | null = null;
function exifrParse(data: ArrayBuffer | Uint8Array, options: Record<string, unknown>): Promise<unknown> {
  exifrModule ??= import("exifr").then((m) => m.parse as unknown as ExifrParse);
  return exifrModule.then((parse) => parse(data, options));
}


const EXIF_DATE_RE = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/;
const ISO_DATE_RE =
  /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/;
const OFFSET_RE = /^([+-])(\d{2}):?(\d{2})$/;

function normaliseOffset(raw: string | undefined): string | null {
  if (!raw) return null;
  if (raw === "Z") return "Z";
  const m = OFFSET_RE.exec(raw.trim());
  return m ? `${m[1]}${m[2]}:${m[3]}` : null;
}

function plausibleYear(year: number): boolean {
  return year >= 1990 && year <= new Date().getFullYear() + 1;
}

/** Calendar and clock fields inside their ranges (seconds allow a leap second). */
function plausibleFields(mo: number, d: number, h: number, mi: number, s: number): boolean {
  return mo >= 1 && mo <= 12 && d >= 1 && d <= 31 && h <= 23 && mi <= 59 && s <= 60;
}

/** "2024:03:05 22:30:15" (+ optional "-05:00") → ISO, floating unless an offset is known. */
export function exifToIso(
  value: string,
  offset?: string,
): { value: string; offsetKnown: boolean } | null {
  const m = EXIF_DATE_RE.exec(value.trim());
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m;
  if (!plausibleYear(+y) || !plausibleFields(+mo, +d, +h, +mi, +s)) return null;
  const off = normaliseOffset(offset);
  return {
    value: `${y}-${mo}-${d}T${h}:${mi}:${s}${off ?? ""}`,
    offsetKnown: off !== null,
  };
}

/** XMP / QuickTime style ISO 8601 → our canonical form. */
export function isoToCapture(
  value: string,
): { value: string; offsetKnown: boolean } | null {
  const m = ISO_DATE_RE.exec(value.trim());
  if (!m) return null;
  const [, y, mo, d, h, mi, s, offRaw] = m;
  if (!plausibleYear(+y) || !plausibleFields(+mo, +d, +(h ?? 0), +(mi ?? 0), +(s ?? 0))) {
    return null;
  }
  const off = normaliseOffset(offRaw);
  return {
    value: `${y}-${mo}-${d}T${h ?? "00"}:${mi ?? "00"}:${s ?? "00"}${off ?? ""}`,
    offsetKnown: off !== null,
  };
}

function dateToCapture(date: Date): { value: string; offsetKnown: boolean } | null {
  if (Number.isNaN(date.getTime()) || !plausibleYear(date.getFullYear())) return null;
  return { value: date.toISOString(), offsetKnown: true };
}

// ---------------------------------------------------------------------------
// Images — exifr, then PNG text chunks
// ---------------------------------------------------------------------------

const DATE_KEYS = [
  "DateTimeOriginal",
  "CreateDate",
  "DateTimeDigitized",
  "DateCreated",
  "ModifyDate",
  "OffsetTimeOriginal",
  "OffsetTimeDigitized",
  "OffsetTime",
] as const;

type Found = { key: string; value: string | Date; group: string };

/** Walk exifr's output and collect every date-ish key with the block it sat in. */
function collectDateKeys(node: unknown, group: string, depth: number, out: Found[]): void {
  if (!node || typeof node !== "object" || depth > 4) return;
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (
      (typeof value === "string" || value instanceof Date) &&
      DATE_KEYS.some((k) => k.toLowerCase() === key.toLowerCase())
    ) {
      out.push({ key, value, group });
    } else if (value && typeof value === "object" && !(value instanceof Date)) {
      collectDateKeys(value, depth === 0 ? key : group, depth + 1, out);
    }
  }
}

function pick(found: Found[], key: string, groupMatch: (g: string) => boolean): Found | undefined {
  return found.find((f) => f.key.toLowerCase() === key.toLowerCase() && groupMatch(f.group));
}

const isExifGroup = (g: string) => /^(exif|ifd0|ifd1|tiff)$/i.test(g);
const isXmpGroup = (g: string) => !isExifGroup(g);

function convert(entry: Found, offset?: Found): { value: string; offsetKnown: boolean } | null {
  if (entry.value instanceof Date) return dateToCapture(entry.value);
  const raw = entry.value;
  const offsetRaw = offset && typeof offset.value === "string" ? offset.value : undefined;
  return exifToIso(raw, offsetRaw) ?? isoToCapture(raw);
}

function rawOf(entries: Array<Found | undefined>): Record<string, string> {
  const raw: Record<string, string> = {};
  for (const e of entries) {
    if (!e) continue;
    raw[`${e.group}.${e.key}`] = e.value instanceof Date ? e.value.toISOString() : e.value;
  }
  return raw;
}

async function fromImage(file: File): Promise<DetectedCapture | null> {
  const bytes = await file.arrayBuffer();
  let parsed: unknown = null;
  try {
    parsed = await exifrParse(bytes, {
      tiff: true,
      exif: true,
      xmp: true,
      gps: false,
      interop: false,
      ifd1: false,
      icc: false,
      iptc: false,
      jfif: false,
      ihdr: false,
      mergeOutput: false,
      reviveValues: false,
      translateKeys: true,
      translateValues: false,
      sanitize: true,
    });
  } catch {
    parsed = null;
  }
  const found: Found[] = [];
  collectDateKeys(parsed, "root", 0, found);

  // EXIF proper: the camera/OS wrote these at capture time.
  const candidates: Array<{ source: CaptureSource; entry?: Found; offset?: Found }> = [
    {
      source: "exif",
      entry: pick(found, "DateTimeOriginal", isExifGroup),
      offset: pick(found, "OffsetTimeOriginal", isExifGroup),
    },
    {
      source: "exif",
      entry: pick(found, "CreateDate", isExifGroup) ?? pick(found, "DateTimeDigitized", isExifGroup),
      offset: pick(found, "OffsetTimeDigitized", isExifGroup),
    },
    { source: "xmp", entry: pick(found, "DateTimeOriginal", isXmpGroup) },
    { source: "xmp", entry: pick(found, "CreateDate", isXmpGroup) },
    { source: "xmp", entry: pick(found, "DateCreated", isXmpGroup) },
    {
      source: "exif",
      entry: pick(found, "ModifyDate", isExifGroup),
      offset: pick(found, "OffsetTime", isExifGroup),
    },
  ];
  for (const c of candidates) {
    if (!c.entry) continue;
    const converted = convert(c.entry, c.offset);
    if (converted) {
      return { ...converted, source: c.source, raw: rawOf([c.entry, c.offset]) };
    }
  }

  if (isPng(bytes)) return fromPngChunks(bytes);
  return null;
}

// ---------------------------------------------------------------------------
// PNG text chunks — "Creation Time", XMP in iTXt, and the eXIf chunk
// ---------------------------------------------------------------------------

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function isPng(bytes: ArrayBuffer): boolean {
  const view = new Uint8Array(bytes, 0, Math.min(8, bytes.byteLength));
  return view.length === 8 && PNG_SIGNATURE.every((b, i) => view[i] === b);
}

const latin1 = new TextDecoder("latin1");
const utf8 = new TextDecoder("utf-8");

async function inflate(data: Uint8Array): Promise<Uint8Array | null> {
  if (typeof DecompressionStream === "undefined") return null;
  try {
    const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream("deflate"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch {
    return null;
  }
}

const XMP_DATE_KEYS = ["exif:DateTimeOriginal", "xmp:CreateDate", "photoshop:DateCreated"];

function xmpDate(xml: string): { key: string; value: string } | null {
  for (const key of XMP_DATE_KEYS) {
    const attr = new RegExp(`${key}="([^"]+)"`).exec(xml);
    if (attr) return { key, value: attr[1] };
    const elem = new RegExp(`<${key}>([^<]+)</${key}>`).exec(xml);
    if (elem) return { key, value: elem[1].trim() };
  }
  return null;
}

/** Scan a PNG's chunk list (all in memory — images are capped at 60 MB). */
async function fromPngChunks(bytes: ArrayBuffer): Promise<DetectedCapture | null> {
  const view = new DataView(bytes);
  const u8 = new Uint8Array(bytes);
  let offset = 8;
  let creationTime: string | null = null;
  let xmpXml: string | null = null;
  let exifPayload: Uint8Array | null = null;

  while (offset + 12 <= bytes.byteLength) {
    const length = view.getUint32(offset);
    const type = latin1.decode(u8.subarray(offset + 4, offset + 8));
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd > bytes.byteLength) break;
    if (type === "IEND") break;

    if (type === "tEXt" || type === "iTXt" || type === "zTXt") {
      const data = u8.subarray(dataStart, dataEnd);
      const nul = data.indexOf(0);
      if (nul > 0) {
        const keyword = latin1.decode(data.subarray(0, nul));
        let text: string | null = null;
        if (type === "tEXt") {
          text = latin1.decode(data.subarray(nul + 1));
        } else if (type === "zTXt") {
          const inflated = await inflate(data.subarray(nul + 2));
          text = inflated ? latin1.decode(inflated) : null;
        } else {
          const compressed = data[nul + 1] === 1;
          let p = nul + 3;
          p = data.indexOf(0, p) + 1; // language tag
          p = data.indexOf(0, p) + 1; // translated keyword
          const body = data.subarray(p);
          if (compressed) {
            const inflated = await inflate(body);
            text = inflated ? utf8.decode(inflated) : null;
          } else {
            text = utf8.decode(body);
          }
        }
        if (text) {
          if (keyword === "Creation Time" && !creationTime) creationTime = text.trim();
          if (keyword === "XML:com.adobe.xmp" && !xmpXml) xmpXml = text;
        }
      }
    } else if (type === "eXIf" && !exifPayload) {
      exifPayload = u8.slice(dataStart, dataEnd);
    }
    offset = dataEnd + 4; // + CRC
  }

  if (exifPayload) {
    try {
      const parsed: unknown = await exifrParse(exifPayload, {
        tiff: true,
        exif: true,
        gps: false,
        interop: false,
        ifd1: false,
        mergeOutput: false,
        reviveValues: false,
        translateKeys: true,
        translateValues: false,
      });
      const found: Found[] = [];
      collectDateKeys(parsed, "root", 0, found);
      const entry =
        pick(found, "DateTimeOriginal", () => true) ??
        pick(found, "CreateDate", () => true) ??
        pick(found, "DateTimeDigitized", () => true);
      const offset =
        pick(found, "OffsetTimeOriginal", () => true) ?? pick(found, "OffsetTimeDigitized", () => true);
      if (entry) {
        const converted = convert(entry, offset);
        if (converted) return { ...converted, source: "exif", raw: rawOf([entry, offset]) };
      }
    } catch {
      // ignore a malformed eXIf chunk
    }
  }
  if (xmpXml) {
    const hit = xmpDate(xmpXml);
    const converted = hit ? isoToCapture(hit.value) : null;
    if (hit && converted) return { ...converted, source: "xmp", raw: { [hit.key]: hit.value } };
  }
  if (creationTime) {
    // The spec suggests RFC 1123 ("Mon, 05 Mar 2024 22:30:15 GMT") but ISO shows up too.
    const iso = isoToCapture(creationTime);
    if (iso) return { ...iso, source: "png-text", raw: { "Creation Time": creationTime } };
    const parsed = new Date(creationTime);
    const converted = dateToCapture(parsed);
    if (converted) return { ...converted, source: "png-text", raw: { "Creation Time": creationTime } };
  }
  return null;
}

// ---------------------------------------------------------------------------
// ISO BMFF (MP4 / MOV / M4A / 3GP) — mvhd and QuickTime metadata keys
// ---------------------------------------------------------------------------

type Box = { type: string; start: number; end: number; payload: number };

const BOX_TYPE_RE = /^[\x20-\x7e]{4}$/;
const MAX_TOP_LEVEL_BOXES = 64;
const MAX_MOOV_BYTES = 32 * 1024 * 1024;
// Seconds between 1904-01-01 (QuickTime epoch) and 1970-01-01.
const QT_EPOCH_OFFSET = 2082844800;

async function readView(file: Blob, start: number, length: number): Promise<DataView> {
  const end = Math.min(file.size, start + length);
  return new DataView(await file.slice(start, end).arrayBuffer());
}

function boxAt(view: DataView, base: number, at: number, limit: number): Box | null {
  // `at` is relative to the view; `base` is the file/parent offset of view[0].
  if (at + 8 > limit) return null;
  let size = view.getUint32(at);
  const type = latin1.decode(new Uint8Array(view.buffer, view.byteOffset + at + 4, 4));
  if (!BOX_TYPE_RE.test(type)) return null;
  let payload = at + 8;
  if (size === 1) {
    if (at + 16 > limit) return null;
    const big = view.getBigUint64(at + 8);
    if (big > BigInt(Number.MAX_SAFE_INTEGER)) return null;
    size = Number(big);
    payload = at + 16;
  } else if (size === 0) {
    size = limit - at;
  }
  if (size < payload - at) return null;
  return { type, start: base + at, end: base + at + size, payload: base + payload };
}

/** Top-level boxes, read header by header so a 1 GB mdat is skipped, not read. */
async function findTopLevelBox(file: Blob, wanted: string): Promise<Box | null> {
  let offset = 0;
  let count = 0;
  while (offset + 8 <= file.size && count++ < MAX_TOP_LEVEL_BOXES) {
    const view = await readView(file, offset, 16);
    const box = boxAt(view, offset, 0, view.byteLength);
    if (!box || box.end <= box.start) return null;
    if (count === 1 && !["ftyp", "moov", "mdat", "free", "skip", "wide", "pnot", "junk"].includes(box.type)) {
      return null; // not an ISO BMFF file
    }
    if (box.type === wanted) return box;
    offset = box.end;
  }
  return null;
}

function* children(view: DataView, base: number, from: number, to: number): Generator<Box> {
  let at = from;
  while (at + 8 <= to) {
    const box = boxAt(view, base, at, to);
    if (!box || box.end <= box.start) return;
    yield box;
    at = box.end - base;
  }
}

async function fromIsoBmff(file: File): Promise<DetectedCapture | null> {
  const moov = await findTopLevelBox(file, "moov");
  if (!moov || moov.end - moov.start > MAX_MOOV_BYTES) return null;
  const view = await readView(file, moov.start, moov.end - moov.start);
  const base = moov.start;
  const rel = (abs: number) => abs - base;

  let mvhdDate: { value: string; raw: string } | null = null;
  let qtDate: { value: string; offsetKnown: boolean; raw: string } | null = null;

  for (const box of children(view, base, rel(moov.payload), rel(moov.end))) {
    if (box.type === "mvhd") {
      const p = rel(box.payload);
      const version = view.getUint8(p);
      const secs =
        version === 1 ? Number(view.getBigUint64(p + 4)) : view.getUint32(p + 4);
      if (secs > 0) {
        const date = new Date((secs - QT_EPOCH_OFFSET) * 1000);
        const converted = dateToCapture(date);
        if (converted) mvhdDate = { value: converted.value, raw: String(secs) };
      }
    } else if (box.type === "meta") {
      qtDate = parseQuickTimeMeta(view, base, box) ?? qtDate;
    } else if (box.type === "udta") {
      // QuickTime itself (and ffmpeg) keep the keyed metadata under udta/meta.
      for (const child of children(view, base, rel(box.payload), rel(box.end))) {
        if (child.type === "meta") qtDate = parseQuickTimeMeta(view, base, child) ?? qtDate;
      }
    }
  }

  if (qtDate) {
    return {
      value: qtDate.value,
      source: "quicktime",
      offsetKnown: qtDate.offsetKnown,
      raw: {
        "com.apple.quicktime.creationdate": qtDate.raw,
        ...(mvhdDate ? { "mvhd.creation_time": mvhdDate.raw } : {}),
      },
    };
  }
  if (mvhdDate) {
    return {
      value: mvhdDate.value,
      source: "mp4",
      offsetKnown: true,
      raw: { "mvhd.creation_time": mvhdDate.raw },
    };
  }
  return null;
}

/** moov/meta with the `keys` + `ilst` pair Apple devices write. */
function parseQuickTimeMeta(
  view: DataView,
  base: number,
  meta: Box,
): { value: string; offsetKnown: boolean; raw: string } | null {
  const rel = (abs: number) => abs - base;
  // ISO puts version/flags before the children; classic QuickTime does not.
  let from = rel(meta.payload);
  const looksLikeBox = (at: number) => {
    const probe = boxAt(view, base, at, rel(meta.end));
    return probe !== null && probe.type === "hdlr";
  };
  if (!looksLikeBox(from) && looksLikeBox(from + 4)) from += 4;
  else if (!looksLikeBox(from)) from += 4;

  const keys: string[] = [];
  let ilst: Box | null = null;
  for (const box of children(view, base, from, rel(meta.end))) {
    if (box.type === "keys") {
      const p = rel(box.payload);
      const count = view.getUint32(p + 4);
      let at = p + 8;
      for (let i = 0; i < count && at + 8 <= rel(box.end); i++) {
        const size = view.getUint32(at);
        if (size < 8) break;
        const name = utf8.decode(new Uint8Array(view.buffer, view.byteOffset + at + 8, size - 8));
        keys.push(name);
        at += size;
      }
    } else if (box.type === "ilst") {
      ilst = box;
    }
  }
  if (!ilst || keys.length === 0) return null;

  const wanted = keys.indexOf("com.apple.quicktime.creationdate") + 1; // 1-based
  if (wanted === 0) return null;

  // ilst items are not regular boxes: the "type" bytes hold the 1-based key
  // index, so walk them by size rather than through boxAt().
  let at = rel(ilst.payload);
  const endAt = rel(ilst.end);
  while (at + 8 <= endAt) {
    const size = view.getUint32(at);
    if (size < 8 || at + size > endAt) break;
    const index = view.getUint32(at + 4);
    const itemEnd = at + size;
    at = itemEnd;
    if (index !== wanted) continue;
    for (const data of children(view, base, itemEnd - size + 8, itemEnd)) {
      if (data.type !== "data") continue;
      const p = rel(data.payload);
      const text = utf8
        .decode(new Uint8Array(view.buffer, view.byteOffset + p + 8, rel(data.end) - p - 8))
        .trim();
      const converted = isoToCapture(text);
      if (converted) return { ...converted, raw: text };
    }
  }
  return null;
}
