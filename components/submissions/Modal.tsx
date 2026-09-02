"use client";

import { useEffect, type ReactNode } from "react";
import { CloseIcon } from "./icons";

type ModalProps = {
  open: boolean;
  eyebrow?: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** When omitted the dialog can only be dismissed through its own buttons. */
  onClose?: () => void;
  size?: "md" | "lg";
};

/** Centered dialog on a dark backdrop, in the site's black-and-gold voice. */
export default function Modal({
  open,
  eyebrow,
  title,
  children,
  footer,
  onClose,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-ink-deep/80 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="submission-dialog-title"
        className={`flex max-h-[95dvh] w-full flex-col overflow-hidden rounded-t-md bg-paper shadow-2xl sm:rounded-sm ${
          size === "lg" ? "sm:max-w-3xl" : "sm:max-w-xl"
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gold/30 bg-ink px-6 py-5">
          <div>
            {eyebrow && (
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
                {eyebrow}
              </p>
            )}
            <h2
              id="submission-dialog-title"
              className="font-serif text-2xl font-semibold leading-tight text-white"
            >
              {title}
            </h2>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-2 -mt-1 cursor-pointer rounded-sm p-2 text-white/60 transition-colors hover:text-gold"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">{children}</div>
        {footer && (
          <div className="border-t border-bone-dark bg-bone px-6 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
