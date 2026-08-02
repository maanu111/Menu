"use client";

import { DietMark } from "./DietMark";
import { useToast } from "./Toaster";
import { billFor, useCart } from "@/lib/cart-store";
import { clsx, money } from "@/lib/format";

/**
 * The order itself: lines, bill, and the commit button. Rendered inside the
 * desktop rail and inside the mobile cart sheet, so it stays one source.
 */
export function OrderPanel({
  gstPercent,
  tableNumber,
  onPlaced,
  compact = false,
}: {
  gstPercent: number;
  tableNumber: string;
  onPlaced?: () => void;
  compact?: boolean;
}) {
  const { state, inc, dec, remove, clear, subtotal, count, placeOrder } = useCart();
  const notify = useToast();
  const bill = billFor(subtotal, gstPercent);

  if (count === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <span aria-hidden="true" className="text-3xl">
          🧾
        </span>
        <p className="text-sm font-semibold text-ink">No items yet</p>
        <p className="max-w-[14rem] text-sm text-ink-2">
          Add something from the menu and it will show up here.
        </p>
      </div>
    );
  }

  function submit() {
    const id = placeOrder();
    if (!id) return;
    notify(`Order ${id} sent to the kitchen`, "good");
    onPlaced?.();
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className={clsx("flex flex-col gap-3", compact && "max-h-none")}>
        {state.lines.map((line) => (
          <li key={line.lineId} className="flex items-start gap-3">
            <DietMark diet={line.diet} className="mt-1" />

            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug font-medium text-ink">{line.name}</p>
              {line.optionLabels.length > 0 ? (
                <p className="mt-0.5 text-xs text-ink-3">
                  {line.optionLabels.join(" · ")}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  remove(line.lineId);
                  notify(`${line.name} removed`);
                }}
                className="mt-1 text-xs font-medium text-ink-3 underline underline-offset-2 transition hover:text-nonveg"
              >
                Remove
              </button>
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
              <div className="flex h-8 items-center gap-1 rounded-full border border-line px-1">
                <button
                  type="button"
                  onClick={() => dec(line.lineId)}
                  aria-label={`Remove one ${line.name}`}
                  className="grid size-6 place-items-center rounded-full text-ink-2 transition hover:bg-surface-2 active:scale-90"
                >
                  <svg viewBox="0 0 16 16" className="size-3" aria-hidden="true">
                    <path
                      d="M3 8h10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <span className="num w-5 text-center text-sm font-semibold text-ink">
                  {line.qty}
                </span>
                <button
                  type="button"
                  onClick={() => inc(line.lineId)}
                  aria-label={`Add one more ${line.name}`}
                  className="grid size-6 place-items-center rounded-full text-ink-2 transition hover:bg-surface-2 active:scale-90"
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

              <span className="num w-16 text-right text-sm font-semibold text-ink">
                {money(line.qty * line.unitPrice)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <dl className="flex flex-col gap-1.5 border-t border-dashed border-line pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-2">Subtotal</dt>
          <dd className="num text-ink">{money(bill.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-2">
            GST <span className="num">{gstPercent}%</span>
          </dt>
          <dd className="num text-ink">{money(bill.gst)}</dd>
        </div>
        <div className="mt-1.5 flex justify-between border-t border-line pt-2.5">
          <dt className="font-semibold text-ink">Total</dt>
          <dd className="num text-base font-semibold text-ink">{money(bill.total)}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={submit}
        className="flex w-full items-center justify-between rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-ink transition hover:brightness-110 active:scale-[0.99]"
      >
        <span>Send to kitchen</span>
        <span className="num">
          {count} {count === 1 ? "item" : "items"}
        </span>
      </button>

      <div className="flex items-center justify-between gap-3">
        <p className="num text-xs text-ink-3">
          Table {tableNumber} · pay at the counter
        </p>
        <button
          type="button"
          onClick={() => {
            clear();
            notify("Order cleared");
          }}
          className="text-xs font-medium text-ink-3 underline underline-offset-2 transition hover:text-ink"
        >
          Clear all
        </button>
      </div>
    </div>
  );
}
