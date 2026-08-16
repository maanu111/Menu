"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { clsx } from "@/lib/format";
import { LANGUAGES, languageLabel } from "@/lib/languages";

/**
 * The language the menu is read in, as a small control in the top bar.
 *
 * The choice travels as a URL parameter, so the server sends a menu already
 * written in that language. Nothing rewrites the page after it arrives —
 * which is the whole reason this is steady where a translate widget is not.
 */
export function LanguagePicker({ active }: { active: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const boxRef = useRef<HTMLDivElement>(null);

  /* A menu left open behind a thumb is worse than no menu. */
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  function choose(code: string) {
    setOpen(false);
    const next = new URLSearchParams(params.toString());
    /* Choosing English is a real choice, not the absence of one — it has to
       stick on a phone set to something else. */
    next.set("lang", code || "en");
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
      router.refresh();
    });
  }

  return (
    <div ref={boxRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Menu language"
        className={clsx(
          "flex h-8 items-center gap-1 rounded-full border border-line px-2.5",
          "text-[0.6875rem] font-semibold text-ink-2 transition",
          "hover:border-accent hover:text-accent active:scale-95",
          pending && "opacity-60",
        )}
      >
        <svg viewBox="0 0 20 20" className="size-3.5" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 10h14" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M10 3c1.8 1.9 2.8 4.4 2.8 7s-1 5.1-2.8 7c-1.8-1.9-2.8-4.4-2.8-7s1-5.1 2.8-7z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        <span className="max-w-[4.5rem] truncate">
          {active ? languageLabel(active) : "EN"}
        </span>
      </button>

      {open ? (
        <ul
          role="listbox"
          className="anim-sheet absolute right-0 z-50 mt-1.5 max-h-72 w-48 overflow-y-auto rounded-xl border border-line bg-surface p-1"
          style={{ boxShadow: "var(--shadow-lift)" }}
        >
          <li>
            <button
              type="button"
              role="option"
              aria-selected={active === ""}
              onClick={() => choose("")}
              className={clsx(
                "w-full rounded-lg px-3 py-2 text-left text-sm transition",
                active === ""
                  ? "bg-accent-soft font-semibold text-accent"
                  : "text-ink hover:bg-surface-2",
              )}
            >
              English
            </button>
          </li>
          {LANGUAGES.map((language) => (
            <li key={language.code}>
              <button
                type="button"
                role="option"
                aria-selected={active === language.code}
                onClick={() => choose(language.code)}
                className={clsx(
                  "flex w-full items-baseline gap-2 rounded-lg px-3 py-2 text-left text-sm transition",
                  active === language.code
                    ? "bg-accent-soft font-semibold text-accent"
                    : "text-ink hover:bg-surface-2",
                )}
              >
                <span>{language.label}</span>
                <span className="ml-auto text-[0.6875rem] text-ink-3">
                  {language.english}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
