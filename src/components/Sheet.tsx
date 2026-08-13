"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { clsx } from "@/lib/format";

/* Nested sheets would otherwise fight over restoring body scroll. */
let lockCount = 0;

function lockScroll() {
  if (lockCount === 0) {
    document.body.dataset.prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount += 1;
}

function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = document.body.dataset.prevOverflow ?? "";
    delete document.body.dataset.prevOverflow;
  }
}

export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "default",
  dismissible = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "default" | "compact";
  /** False for a question that must be answered — no backdrop tap, no Escape,
      no close button. Used by the opening order-mode sheet. */
  dismissible?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  /* Callers routinely pass an inline arrow, which is a new function on every
     render. If the effect below depended on it, every keystroke inside the
     sheet would tear the trap down — pulling focus back out — and rebuild it,
     landing the cursor on the first field. Holding it in a ref keeps the
     effect tied to what actually changes: whether the sheet is open. */
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    restoreTo.current = document.activeElement as HTMLElement | null;
    lockScroll();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissible) {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const focusTimer = window.setTimeout(() => {
      panelRef.current
        ?.querySelector<HTMLElement>("[data-autofocus]")
        ?.focus({ preventScroll: true });
    }, 40);

    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
      unlockScroll();
      restoreTo.current?.focus?.({ preventScroll: true });
    };
  }, [open, dismissible]);

  /* Sheets only ever open from a tap, so the DOM exists by the time this runs. */
  if (!open || typeof document === "undefined") return null;

  const titleId = `sheet-${title.replace(/\W+/g, "-").toLowerCase()}`;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        onClick={dismissible ? onClose : undefined}
        disabled={!dismissible}
        className="anim-fade absolute inset-0 cursor-default bg-black/55 backdrop-blur-[2px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={clsx(
          "anim-rise sm:anim-sheet relative flex max-h-[90dvh] w-full flex-col",
          "rounded-t-3xl border border-line bg-surface sm:rounded-3xl",
          size === "compact" ? "sm:max-w-md" : "sm:max-w-lg",
        )}
        style={{ boxShadow: "var(--shadow-lift)" }}
      >
        <div className="flex items-start gap-3 border-b border-line px-5 pt-4 pb-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <div
              aria-hidden="true"
              className="mx-auto mb-3 h-1 w-9 rounded-full bg-line sm:hidden"
            />
            <h2 id={titleId} className="text-lg font-semibold tracking-tight text-ink">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-ink-2">{description}</p>
            ) : null}
          </div>
          {dismissible ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 grid size-9 shrink-0 place-items-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-ink active:scale-95"
          >
            <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden="true">
              <path
                d="M5.5 5.5l9 9m0-9l-9 9"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
          {children}
        </div>

        {footer ? (
          <div
            className="border-t border-line px-5 py-4 sm:px-6"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
