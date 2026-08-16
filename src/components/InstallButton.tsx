"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Sheet } from "./Sheet";

/** Chrome fires this when it is willing to install; it is not standard yet. */
type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/* Whether this is the installed app rather than the browser. Read from the
   browser rather than held in state, so it is never a stale copy of it. */
function subscribeDisplayMode(onChange: () => void) {
  const query = window.matchMedia("(display-mode: standalone)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
function readDisplayMode() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    /* Safari's own flag, which predates display-mode and is still the only
       way to tell on an iPhone. */
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}
/** The server cannot know, and guessing "installed" would hide the button. */
const notOnTheServer = () => false;

/** Which set of instructions to show when there is no prompt to fire. */
function platform(): "ios" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) ||
    /* iPadOS reports itself as a Mac, but a Mac has no touch screen. */
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  return iOS ? "ios" : "other";
}

/**
 * Puts the menu on the guest's home screen.
 *
 * Chrome hands us a prompt to fire and the whole thing is one tap. Safari never
 * has, so on an iPhone the same button explains the two taps that do it by
 * hand — a button that silently does nothing on half the phones in a restaurant
 * would be worse than no button.
 *
 * It hides itself once the menu is already installed, and while running inside
 * the installed app, where there is nothing left to install.
 */
export function InstallButton() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [justInstalled, setJustInstalled] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  /* Opened from the home screen — there is nothing left to offer. */
  const standalone = useSyncExternalStore(
    subscribeDisplayMode,
    readDisplayMode,
    notOnTheServer,
  );

  useEffect(() => {
    function onPrompt(e: Event) {
      /* Keeping it stops Chrome showing its own bar, so we owe them a button. */
      e.preventDefault();
      setPrompt(e as InstallPrompt);
    }
    function onInstalled() {
      setJustInstalled(true);
      setPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (standalone || justInstalled) return null;

  async function install() {
    if (!prompt) {
      setHelpOpen(true);
      return;
    }
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      /* Chrome will not replay a prompt that has been used. */
      if (outcome === "accepted") setJustInstalled(true);
      setPrompt(null);
    } catch {
      setHelpOpen(true);
    }
  }

  const ios = typeof window !== "undefined" && platform() === "ios";

  return (
    <>
      <button
        type="button"
        onClick={install}
        aria-label="Add this menu to your home screen"
        title="Add to home screen"
        className="grid size-12 shrink-0 place-items-center rounded-full border border-line text-ink-2 transition hover:border-accent hover:text-accent active:scale-95"
      >
        <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden="true">
          <path
            d="M10 3v9m0 0 3.2-3.2M10 12 6.8 8.8"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 13.5v1.9A1.6 1.6 0 0 0 5.6 17h8.8a1.6 1.6 0 0 0 1.6-1.6v-1.9"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <Sheet
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Add to home screen"
        description="Opens the menu like an app, without the browser bars."
        size="compact"
      >
        <ol className="flex flex-col gap-3">
          {(ios
            ? [
                "Tap the Share button at the bottom of Safari.",
                "Scroll down and tap “Add to Home Screen”.",
                "Tap “Add”. The menu appears with your other apps.",
              ]
            : [
                "Tap the ⋮ menu at the top right of your browser.",
                "Tap “Add to Home screen” or “Install app”.",
                "Confirm. The menu appears with your other apps.",
              ]
          ).map((step, i) => (
            <li key={step} className="flex items-start gap-3">
              <span className="num grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                {i + 1}
              </span>
              <span className="text-sm text-ink-2">{step}</span>
            </li>
          ))}
        </ol>
      </Sheet>
    </>
  );
}
