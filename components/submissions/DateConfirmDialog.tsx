"use client";

import { useState } from "react";
import { formatCapture, fromDatetimeLocal, toDatetimeLocal } from "@/lib/submissions/format";
import {
  isEmbeddedSource,
  KIND_LABEL,
  type ConfirmationStatus,
} from "@/lib/submissions/shared";
import Modal from "./Modal";
import { Btn, inputClasses } from "./Buttons";
import { ClockIcon, SpinnerIcon } from "./icons";
import type { QueueItem } from "./types";

export type DateAnswer = {
  status: ConfirmationStatus;
  attestedAt: string | null;
  note: string | null;
};

type Props = {
  item: QueueItem;
  index: number;
  total: number;
  onAnswer: (answer: DateAnswer) => void;
};

function Preview({ item }: { item: QueueItem }) {
  const [broken, setBroken] = useState(false);
  if (!item.previewUrl || broken) return null;
  const frame = "mb-5 flex justify-center overflow-hidden rounded-sm border border-bone-dark bg-ink-deep";
  if (item.kind === "image") {
    return (
      <div className={frame}>
        {/* eslint-disable-next-line @next/next/no-img-element -- object URL, not an asset */}
        <img
          src={item.previewUrl}
          alt=""
          className="max-h-64 w-auto max-w-full object-contain"
          onError={() => setBroken(true)}
        />
      </div>
    );
  }
  if (item.kind === "video") {
    return (
      <div className={frame}>
        <video
          src={item.previewUrl}
          controls
          playsInline
          preload="metadata"
          className="max-h-64 w-full"
          onError={() => setBroken(true)}
        />
      </div>
    );
  }
  return (
    <div className="mb-5">
      <audio src={item.previewUrl} controls preload="metadata" className="w-full" />
    </div>
  );
}

function DateCallout({ value }: { value: string }) {
  return (
    <div className="my-4 flex items-center gap-3 rounded-sm border border-gold/40 bg-white px-4 py-3">
      <ClockIcon className="h-6 w-6 shrink-0 text-gold-deep" />
      <p className="font-serif text-lg font-semibold leading-snug text-ink">{formatCapture(value)}</p>
    </div>
  );
}

/**
 * "Was this taken on <date>?" — one file at a time. The detected date is shown
 * with where it came from; the client confirms, corrects, or says they are
 * unsure. Every answer is recorded against the file.
 */
export default function DateConfirmDialog({ item, index, total, onAnswer }: Props) {
  const capture = item.capture;
  const hasValue = Boolean(capture?.value);
  // Mounted once per file (keyed by the caller), so state initialises from props.
  const [mode, setMode] = useState<"ask" | "correct">("ask");
  const [dateInput, setDateInput] = useState(() => toDatetimeLocal(capture?.value ?? null));
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const startCorrecting = () => {
    if (!dateInput) setDateInput(toDatetimeLocal(capture?.value ?? null));
    setMode("correct");
  };

  const label = KIND_LABEL[item.kind].toLowerCase();
  const eyebrow = `${KIND_LABEL[item.kind]} ${index + 1} of ${total}`;
  const correcting = mode === "correct" || (capture !== null && !hasValue);

  const submitCorrection = () => {
    const value = fromDatetimeLocal(dateInput);
    if (!value) {
      setError("Please enter a complete date and time.");
      return;
    }
    onAnswer({ status: "corrected", attestedAt: value, note: note.trim() || null });
  };

  const maxDatetime = toDatetimeLocal(new Date().toISOString());

  return (
    <Modal open eyebrow={eyebrow} title="Confirm when this was captured" size="md">
      <Preview item={item} />

      {!capture && (
        <p className="flex items-center gap-2 text-sm text-muted">
          <SpinnerIcon className="h-4 w-4 text-gold-deep" /> Reading the file&rsquo;s details…
        </p>
      )}

      {capture && !correcting && capture.value && (
        <>
          {isEmbeddedSource(capture.source) ? (
            <p className="text-sm leading-relaxed text-muted">
              The file&rsquo;s embedded metadata indicates this {label} was captured on:
            </p>
          ) : (
            <p className="text-sm leading-relaxed text-muted">
              This file does not contain an embedded capture date. Your device reports that it
              was last modified on:
            </p>
          )}
          <DateCallout value={capture.value} />
          <p className="text-sm leading-relaxed text-muted">
            Please confirm that this is the date and time the {label} was taken. The timing of
            each communication is material to the investigation of your claim
            {isEmbeddedSource(capture.source)
              ? "."
              : ", so if it was taken at a different time, please correct the date."}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Btn
              onClick={() =>
                onAnswer({ status: "confirmed", attestedAt: capture.value, note: null })
              }
            >
              Yes, this is correct
            </Btn>
            <Btn variant="outline" onClick={startCorrecting}>
              No, the date is different
            </Btn>
          </div>
          <p className="mt-4">
            <Btn
              variant="link"
              onClick={() => onAnswer({ status: "unknown", attestedAt: null, note: null })}
            >
              I&rsquo;m not sure when it was taken
            </Btn>
          </p>
        </>
      )}

      {capture && correcting && (
        <>
          <p className="text-sm leading-relaxed text-muted">
            {hasValue
              ? `Please enter the date and time this ${label} was actually taken, to the best of your recollection.`
              : `We could not read a capture date from this file. Please enter the date and time this ${label} was taken, to the best of your recollection.`}
          </p>
          <label className="mt-5 block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-ink">
              Date and time it was captured
            </span>
            <input
              type="datetime-local"
              value={dateInput}
              max={maxDatetime}
              onChange={(e) => {
                setDateInput(e.target.value);
                setError(null);
              }}
              className={inputClasses}
            />
          </label>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-ink">
              Note <span className="font-normal normal-case tracking-normal text-muted">(optional)</span>
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="e.g. The message arrived the evening before I took the screenshot."
              className="w-full rounded-sm border border-bone-dark bg-white p-4 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-gold"
            />
          </label>
          {error && (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Btn onClick={submitCorrection}>Save this date</Btn>
            {hasValue && (
              <Btn variant="outline" onClick={() => setMode("ask")}>
                Back
              </Btn>
            )}
          </div>
          <p className="mt-4">
            <Btn
              variant="link"
              onClick={() =>
                onAnswer({ status: "unknown", attestedAt: null, note: note.trim() || null })
              }
            >
              I&rsquo;m not sure when it was taken
            </Btn>
          </p>
        </>
      )}

      <p className="mt-6 border-t border-bone-dark pt-4 text-xs leading-relaxed text-muted">
        Your answer is recorded with this file as part of your submission to Gold Law, P.A.
      </p>
    </Modal>
  );
}
