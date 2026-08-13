"use client";

import { DishImage } from "./DishImage";
import { useToast } from "./Toaster";
import { useCart } from "@/lib/cart-store";
import { money } from "@/lib/format";
import type { MenuItem } from "@/lib/types";

/**
 * Shown after the order goes in, never before — the guest has already
 * committed, so this reads as a suggestion rather than an obstacle.
 * Which dishes qualify is the owner's call, set per item in the dashboard.
 */
export function AddOnsRail({ items }: { items: MenuItem[] }) {
  const { state, add } = useCart();
  const notify = useToast();

  const ordered = new Set(state.placedLines.map((l) => l.itemId));
  const suggestions = items
    .filter((item) => item.isAddOn && item.available && !ordered.has(item.id))
    .sort((a, b) => Number(Boolean(b.bestseller)) - Number(Boolean(a.bestseller)))
    .slice(0, 6);

  if (suggestions.length === 0) return null;

  return (
    <section aria-labelledby="addons-heading" className="pt-1">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h3 id="addons-heading" className="text-[0.8125rem] font-semibold text-ink">
          Anything else?
        </h3>
        <span className="text-[0.6875rem] text-ink-3">Goes on the same bill</span>
      </div>

      <ul className="no-bar -mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1 sm:-mx-6 sm:px-6">
        {suggestions.map((item) => (
          <li key={item.id} className="w-28 shrink-0">
            <DishImage
              item={item}
              className="aspect-square w-full rounded-lg"
              sizes="112px"
            />
            <p className="mt-1.5 truncate text-xs font-medium text-ink">{item.name}</p>
            <div className="mt-1 flex items-center justify-between gap-1">
              <span className="num text-xs text-ink-2">{money(item.price)}</span>
              <button
                type="button"
                onClick={() => {
                  add(item);
                  notify(`${item.name} added`, "good");
                }}
                className="rounded-full border border-accent px-2.5 py-1 text-[0.6875rem] font-semibold text-accent transition hover:bg-accent-soft active:scale-95"
              >
                Add
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
