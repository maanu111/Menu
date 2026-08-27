"use client";

import { useState } from "react";
import { BrandLogo } from "./BrandLogo";
import { Sheet } from "./Sheet";
import { LanguagePicker } from "./LanguagePicker";
import { InstallButton } from "./InstallButton";
import { useToast } from "./Toaster";
import type { Restaurant, TableInfo } from "@/lib/types";

export function Navbar({
  restaurant,
  table,
  language,
  qrSvg,
  qrUrl,
}: {
  restaurant: Restaurant;
  table: TableInfo | null;
  /** What the menu is currently written in. */
  language: string;
  qrSvg: string;
  qrUrl: string;
}) {
  const [qrOpen, setQrOpen] = useState(false);
  const notify = useToast();

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(qrUrl);
      notify("Link copied", "good");
    } catch {
      notify("Long-press the link to copy it");
    }
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-ground/85 backdrop-blur-md">
        <nav className="mx-auto flex h-14 w-full max-w-140 items-center gap-3 px-4 sm:px-6">
          <BrandLogo
            src={restaurant.logoSrc}
            name={restaurant.name}
            widthPx={240}
            heightPx={80}
            fit="cover"
            className="h-10 w-28 sm:h-11 sm:w-32 rounded-lg border border-line/60 bg-[#0B1528] shadow-xs"
          />

          <div className="min-w-0 flex-1" />

          <LanguagePicker active={language} />

          {table ? (
            <button
              type="button"
              onClick={() => setQrOpen(true)}
              aria-label="Show table QR code"
              className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-ink-2 transition hover:border-accent hover:text-accent active:scale-95"
            >
              <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
                <path
                  d="M3 3h5v5H3zM12 3h5v5h-5zM3 12h5v5H3z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 12h2v2h-2zM15 15h2v2h-2zM15 12h2v2h-2zM12 15h2v2h-2z"
                  fill="currentColor"
                />
              </svg>
            </button>
          ) : null}

          <InstallButton />
        </nav>
      </header>

      {/* Sharing modal for table QR codes */}
      {table ? (
        <Sheet open={qrOpen} onClose={() => setQrOpen(false)} title={`Table ${table.number}`}>
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <p className="max-w-[17rem] text-xs text-ink-2">
              Anyone at Table {table.number} can scan this code to open the same menu.
            </p>

            <div
              dangerouslySetInnerHTML={{ __html: qrSvg }}
              className="rounded-2xl border border-line bg-surface p-4 shadow-sm text-ink [&_svg]:size-52"
            />

            <div className="flex w-full gap-2 pt-2">
              <button
                type="button"
                onClick={copyLink}
                className="flex-1 rounded-full border border-line py-2.5 text-xs font-semibold text-ink transition hover:border-ink-3 active:scale-98"
              >
                Copy link
              </button>
              <button
                type="button"
                onClick={() => setQrOpen(false)}
                className="flex-1 rounded-full bg-accent py-2.5 text-xs font-semibold text-white transition hover:brightness-110 active:scale-98"
              >
                Done
              </button>
            </div>
          </div>
        </Sheet>
      ) : null}
    </>
  );
}
