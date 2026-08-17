"use client";

import { useCart } from "@/lib/cart-store";
import { clsx } from "@/lib/format";
import { t } from "@/lib/ui-translations";

/**
 * Asked once, at the moment of ordering. The kitchen uses it for portioning
 * and the owner's reports use it for covers and spend-per-head.
 */
export function GuestCount({ language }: { language: string }) {
  const { state, setGuests } = useCart();
  const guests = state.guests;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 px-3.5 py-3">
      <svg
        viewBox="0 0 20 20"
        className="size-4 shrink-0 text-ink-3"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="7.4" cy="6.6" r="2.6" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M2.6 16.2c0-2.4 2.1-4.2 4.8-4.2s4.8 1.8 4.8 4.2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M13.4 5.2a2.4 2.4 0 0 1 0 4.6M14.6 12.4c2 .4 3.4 1.9 3.4 3.8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      <div className="min-w-0 flex-1">
        <p className="text-[0.8125rem] font-medium text-ink">{t("howManyPeople", language)}</p>
        <p className="text-[0.6875rem] text-ink-3">{t("helpsUsPortion", language)}</p>
      </div>

      <div className="flex h-8 shrink-0 items-center gap-1 rounded-full border border-line bg-surface px-1">
        <button
          type="button"
          onClick={() => setGuests(guests - 1)}
          disabled={guests <= 1}
          aria-label="One fewer person"
          className={clsx(
            "grid size-6 place-items-center rounded-full transition active:scale-90",
            guests <= 1
              ? "text-ink-3/40"
              : "text-ink-2 hover:bg-surface-2 hover:text-ink",
          )}
        >
          <svg viewBox="0 0 16 16" className="size-3" aria-hidden="true">
            <path d="M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <span
          aria-live="polite"
          className="num w-6 text-center text-sm font-semibold text-ink"
        >
          {guests}
        </span>

        <button
          type="button"
          onClick={() => setGuests(guests + 1)}
          disabled={guests >= 30}
          aria-label="One more person"
          className={clsx(
            "grid size-6 place-items-center rounded-full transition active:scale-90",
            guests >= 30
              ? "text-ink-3/40"
              : "text-ink-2 hover:bg-surface-2 hover:text-ink",
          )}
        >
          <svg viewBox="0 0 16 16" className="size-3" aria-hidden="true">
            <path
              d="M8 3v10M3 8h10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
