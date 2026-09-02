import type { ButtonHTMLAttributes } from "react";

type Variant = "gold" | "dark" | "outline" | "link";

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  small?: boolean;
};

const base =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-sm font-semibold uppercase tracking-[0.12em] transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  gold: "bg-gold text-ink-deep hover:bg-gold-pale",
  dark: "bg-ink text-gold-pale hover:bg-ink-deep",
  outline: "border border-ink/25 bg-white text-ink hover:border-gold hover:text-ink-deep",
  link: "normal-case tracking-normal text-gold-deep underline underline-offset-4 hover:no-underline",
};

export function Btn({ variant = "gold", small, className = "", ...rest }: BtnProps) {
  const size =
    variant === "link"
      ? "px-1 py-1 text-sm font-medium"
      : small
        ? "px-4 py-2 text-xs"
        : "px-6 py-3 text-sm";
  return (
    <button
      type="button"
      className={`${base} ${variants[variant]} ${size} ${className}`}
      {...rest}
    />
  );
}

export const inputClasses =
  "w-full h-12 rounded-sm border border-bone-dark bg-white px-4 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-gold transition-colors";
