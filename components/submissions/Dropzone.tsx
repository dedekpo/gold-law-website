"use client";

import { useRef, useState } from "react";
import { ACCEPT } from "@/lib/submissions/shared";
import { UploadIcon } from "./icons";

type DropzoneProps = {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  /** Smaller footprint once the queue has files in it. */
  compact?: boolean;
};

export default function Dropzone({ onFiles, disabled, compact }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const open = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (disabled) return;
        const files = Array.from(e.dataTransfer.files ?? []);
        if (files.length) onFiles(files);
      }}
      className={`group flex cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed text-center transition-colors ${
        compact ? "gap-2 px-4 py-6" : "gap-3 px-6 py-14"
      } ${
        dragging
          ? "border-gold bg-gold/10"
          : "border-bone-dark bg-paper hover:border-gold/70 hover:bg-gold/5"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <span
        className={`flex items-center justify-center rounded-full border border-gold/40 bg-ink text-gold transition-colors group-hover:bg-ink-deep ${
          compact ? "h-10 w-10" : "h-16 w-16"
        }`}
      >
        <UploadIcon className={compact ? "h-5 w-5" : "h-8 w-8"} />
      </span>
      <span className={`font-serif font-semibold text-ink ${compact ? "text-lg" : "text-2xl"}`}>
        {compact ? "Add more files" : "Select files to upload"}
      </span>
      <span className="max-w-md text-sm leading-relaxed text-muted">
        {compact
          ? "Screenshots, screen recordings, or audio recordings."
          : "Tap here to choose screenshots, screen recordings, or audio recordings from your device — or drag and drop them onto this area."}
      </span>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
