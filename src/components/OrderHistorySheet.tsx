"use client";

import { Sheet } from "./Sheet";
import { DietMark } from "./DietMark";
import { useToast } from "./Toaster";
import { useCart } from "@/lib/cart-store";
import { money } from "@/lib/format";
import type { CartLine } from "@/lib/types";

function when(at: number) {
  const d = new Date(at);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) {
    return `Today, ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Everything this phone has ordered here, newest first, with a way to order
 * any of it again. Kept in the device's own storage — no account, nothing to
 * sign into, and it survives closing the tab.
 */
export function OrderHistorySheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { state, reorder } = useCart();
  const notify = useToast();

  function again(lines: CartLine[], what: string) {
    reorder(lines);
    notify(`${what} added to your order`, "good");
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Your orders"
      description={
        state.history.length === 0
          ? "Nothing yet."
          : "Kept on this phone. Tap Reorder to have it again."
      }
    >
      {state.history.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <span aria-hidden="true" className="text-3xl">
            🧾
          </span>
          <p className="text-sm font-semibold text-ink">No orders yet</p>
          <p className="max-w-[15rem] text-sm text-ink-2">
            Once you order, it stays here on your phone so you can have the
            same again next time.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {state.history.map((order) => (
            <li
              key={order.code + order.placedAt}
              className="rounded-xl border border-line"
            >
              <div className="flex items-baseline gap-2 border-b border-line px-3.5 py-2.5">
                <span className="num text-sm font-semibold text-ink">
                  {order.code}
                </span>
                <span className="text-xs text-ink-3">{when(order.placedAt)}</span>
                <button
                  type="button"
                  onClick={() => again(order.lines, "Everything")}
                  className="ml-auto shrink-0 rounded-full bg-accent px-3 py-1.5 text-[0.6875rem] font-semibold text-accent-ink transition active:scale-95 hover:brightness-110"
                >
                  Reorder all
                </button>
              </div>

              <ul className="flex flex-col divide-y divide-line">
                {order.lines.map((line) => (
                  <li
                    key={line.lineId}
                    className="flex items-center gap-2.5 px-3.5 py-2.5"
                  >
                    <DietMark diet={line.diet} className="mt-0.5 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.8125rem] leading-snug text-ink">
                        {line.name}
                      </span>
                      {line.optionLabels.length > 0 ? (
                        <span className="block text-[0.6875rem] text-ink-3">
                          {line.optionLabels.join(" · ")}
                        </span>
                      ) : null}
                    </span>
                    <span className="num shrink-0 text-xs text-ink-3">
                      {line.qty}×
                    </span>
                    <span className="num w-16 shrink-0 text-right text-[0.8125rem] text-ink">
                      {money(line.qty * line.unitPrice)}
                    </span>
                    <button
                      type="button"
                      onClick={() => again([line], line.name)}
                      className="shrink-0 rounded-full border border-accent px-2.5 py-1 text-[0.625rem] font-semibold text-accent transition active:scale-95 hover:bg-accent-soft"
                    >
                      Reorder
                    </button>
                  </li>
                ))}
              </ul>

              <p className="flex items-baseline justify-between border-t border-line px-3.5 py-2.5">
                <span className="text-xs text-ink-2">
                  {order.mode === "pickup"
                    ? "Collected"
                    : order.tableNumber
                      ? "At the table"
                      : "Dine-in"}
                </span>
                <span className="num text-sm font-semibold text-ink">
                  {money(order.total)}
                </span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
