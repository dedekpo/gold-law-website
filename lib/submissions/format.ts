/** Display helpers for the submission portal. Browser-only concerns (Intl). */

export function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/** 95.4 → "1:35" ; with tenths → "1:35.4". */
export function fmtDuration(seconds: number, tenths = false): string {
  const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const m = Math.floor(safe / 60);
  const s = safe - m * 60;
  const secs = tenths ? s.toFixed(1).padStart(4, "0") : String(Math.floor(s)).padStart(2, "0");
  return `${m}:${secs}`;
}

const PARTS_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;

/** True when the ISO value carries no UTC offset (a device wall-clock time). */
export function isFloating(value: string): boolean {
  const m = PARTS_RE.exec(value);
  return !m || !m[7];
}

/**
 * How a capture value should be shown. We always show the digits the device
 * wrote, not a conversion into the viewer's zone: a client confirming "was
 * this taken at 10:30 PM?" must see 10:30 PM even if they are travelling.
 *
 *  - floating (no offset): the digits as-is, no zone label
 *  - explicit offset (`-05:00`): the digits as-is, labelled "GMT-5"
 *  - UTC (`Z`, e.g. mvhd or the filesystem timestamp): the device's zone is
 *    unknown, so convert to the viewer's zone and label it
 */
type Display = { date: Date; zone: "none" | "viewer" | string };

export function captureDisplay(value: string): Display | null {
  const m = PARTS_RE.exec(value);
  if (!m) return null;
  const [, y, mo, d, h, mi, s, off] = m;
  if (off === "Z") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : { date, zone: "viewer" };
  }
  const date = new Date(+y, +mo - 1, +d, +h, +mi, s ? +s : 0);
  if (Number.isNaN(date.getTime())) return null;
  if (!off) return { date, zone: "none" };
  const sign = off[0];
  const hours = Number(off.slice(1, 3));
  const minutes = Number(off.slice(4, 6));
  const label = `GMT${sign}${hours}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""}`;
  return { date, zone: label };
}

/** Kept for callers that only need a Date (e.g. the correction input). */
export function captureToDate(value: string): Date | null {
  return captureDisplay(value)?.date ?? null;
}

function format(display: Display, opts: Intl.DateTimeFormatOptions, withZone: boolean): string {
  const text = new Intl.DateTimeFormat("en-US", {
    ...opts,
    ...(withZone && display.zone === "viewer" ? { timeZoneName: "short" as const } : {}),
  }).format(display.date);
  if (withZone && display.zone !== "none" && display.zone !== "viewer") {
    return `${text} ${display.zone}`;
  }
  return text;
}

/** "Tuesday, March 5, 2024 at 10:30 PM GMT-5". */
export function formatCapture(value: string): string {
  const display = captureDisplay(value);
  if (!display) return value;
  return format(
    display,
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
    true,
  );
}

/** Short form for list rows: "Mar 5, 2024, 10:30 PM". */
export function formatCaptureShort(value: string): string {
  const display = captureDisplay(value);
  if (!display) return value;
  return format(
    display,
    { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" },
    false,
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Value for <input type="datetime-local"> ("YYYY-MM-DDTHH:MM"). */
export function toDatetimeLocal(value: string | null): string {
  if (!value) return "";
  const date = captureToDate(value);
  if (!date) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Back from the input: a floating ISO value, or null when empty/invalid. */
export function fromDatetimeLocal(input: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(input);
  if (!m) return null;
  const probe = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  if (Number.isNaN(probe.getTime())) return null;
  return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00`;
}
