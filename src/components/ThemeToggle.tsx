"use client";

import { useSyncExternalStore } from "react";

type Mode = "light" | "dark";

const THEME_EVENT = "kt-theme-change";

/** The OS preference and our stored override are both external stores. */
function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  window.addEventListener(THEME_EVENT, onChange);
  return () => {
    media.removeEventListener("change", onChange);
    window.removeEventListener(THEME_EVENT, onChange);
  };
}

/* Light unless the guest has explicitly chosen dark on this device. */
function readMode(): Mode {
  try {
    if (window.localStorage.getItem("kt-theme") === "dark") return "dark";
  } catch {
    /* Storage blocked — light it is. */
  }
  return "light";
}

const serverMode = (): Mode => "light";

export function ThemeToggle() {
  const mode = useSyncExternalStore(subscribe, readMode, serverMode);

  function toggle() {
    const next: Mode = mode === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      window.localStorage.setItem("kt-theme", next);
    } catch {
      /* Preference just won't survive a refresh. */
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-ink-2 transition hover:bg-surface-2 hover:text-ink active:scale-95"
    >
      {mode === "dark" ? (
        <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="3.6" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M10 2v1.8M10 16.2V18M18 10h-1.8M3.8 10H2m12.2-4.2l-1.3 1.3M7.1 12.9l-1.3 1.3m8.4 0l-1.3-1.3M7.1 7.1L5.8 5.8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
          <path
            d="M16.5 12.4A7 7 0 0 1 7.6 3.5a7 7 0 1 0 8.9 8.9Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
