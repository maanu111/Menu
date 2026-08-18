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
        <nav className="mx-auto flex h-14 w-full max-w-140 items-center gap-2.5 px-4 sm:px-6">
          <BrandLogo
            src={restaurant.logoSrc}
            name={restaurant.name}
            sizePx={40}
            className="size-9"
          />

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm leading-tight font-semibold text-ink">
              {restaurant.name}
            </h1>
            <p className="mt-0.5 flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={`size-1.5 rounded-full ${
                  restaurant.isOpen ? "bg-veg" : "bg-nonveg"
                }`}
              />
              <span className="num text-[0.6875rem] text-ink-3">
                {restaurant.isOpen ? "Open now" : "Closed"}
              </span>
            </p>
          </div>

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
                d="M12 12h2m3 0h-1m-4 3v2m3-2h2m0 3v-1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
          ) : null}

          {/* Kept flush with the edge so it is easy to find on every menu. */}
          <div className="-mr-4 shrink-0 sm:-mr-6">
            <InstallButton />
          </div>

        </nav>
      </header>

      {table ? (
      <Sheet
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        title={`Table ${table.number}`}
        description="Scan to open this menu on another phone."
        size="compact"
        footer={
          <button
            type="button"
            onClick={copyLink}
            className="w-full rounded-full border border-line py-3 text-sm font-semibold text-ink transition hover:bg-surface-2 active:scale-[0.99]"
          >
            Copy link
          </button>
        }
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-full max-w-[240px] rounded-2xl bg-white p-5 text-black [&_svg]:size-full"
            role="img"
            aria-label={`QR code for table ${table.number}`}
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <p className="num rounded-full bg-surface-2 px-3 py-1.5 text-center text-[0.6875rem] break-all text-ink-3">
            {qrUrl}
          </p>
        </div>
      </Sheet>
      ) : null}
    </>
  );
}
