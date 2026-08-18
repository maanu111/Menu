"use client";

import { DishImage } from "./DishImage";
import { useToast } from "./Toaster";
import { useCart } from "@/lib/cart-store";
import { money } from "@/lib/format";
import type { CartLine, MenuItem } from "@/lib/types";

/**
 * Shown after the order goes in, never before — the guest has already
 * committed, so this reads as a suggestion rather than an obstacle.
 * Which dishes qualify is the owner's call, set per item in the dashboard.
 */
export function AddOnsRail({ items }: { items: MenuItem[] }) {
  const { state, reorderDirect, add } = useCart();
  const notify = useToast();

  const orderedItemIds = new Set(
    state.activeOrders.flatMap((order) => order.lines.map((line) => line.itemId)),
  );
  const suggestions = items
    .filter((item) => item.isAddOn && item.available && !orderedItemIds.has(item.id))
    .sort((a, b) => Number(Boolean(b.bestseller)) - Number(Boolean(a.bestseller)))
    .slice(0, 6);

  if (suggestions.length === 0) return null;

  async function handleAddAddOn(item: MenuItem) {
    const line: CartLine = {
      lineId: `${item.id}-${Date.now()}`,
      itemId: item.id,
      name: item.name,
      diet: item.diet,
      unitPrice: item.price,
      qty: 1,
      optionIds: [],
      optionLabels: [],
    };

    if (state.activeOrders.length > 0 || state.stage) {
      const res = await reorderDirect([line]);
      if (res.ok) {
        notify(`${item.name} sent to kitchen`, "good");
      } else {
        notify(res.message);
      }
    } else {
      add(item);
      notify(`${item.name} added to cart`, "good");
    }
  }

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
                onClick={() => void handleAddAddOn(item)}
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
