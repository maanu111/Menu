"use client";

import { useCart } from "@/lib/cart-store";
import { clsx, money } from "@/lib/format";
import type { OrderStage } from "@/lib/types";

const STEPS: { id: OrderStage; label: string; hint: string }[] = [
  { id: "placed", label: "Sent to kitchen", hint: "Ticket printed" },
  { id: "accepted", label: "Accepted", hint: "Chef has your order" },
  { id: "preparing", label: "Cooking", hint: "On the fire now" },
  { id: "ready", label: "Ready", hint: "Coming to your table" },
  { id: "served", label: "Served", hint: "Enjoy your meal" },
];

export function OrderTracker({ onDone }: { onDone?: () => void }) {
  const { state, resetOrder } = useCart();
  if (!state.stage) return null;

  const current = STEPS.findIndex((s) => s.id === state.stage);
  const total = state.placedLines.reduce((n, l) => n + l.qty * l.unitPrice, 0);
  const isReady = state.stage === "ready" || state.stage === "served";

  return (
    <div
      className="overflow-hidden rounded-3xl border border-line bg-surface"
      style={{ boxShadow: "var(--shadow)" }}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <p className="eyebrow text-ink-3">Order</p>
          <p className="num text-lg font-semibold text-ink">{state.orderId}</p>
        </div>
        <span
          className={clsx(
            "rounded-full px-3 py-1 text-xs font-semibold",
            isReady ? "bg-veg/12 text-veg" : "bg-accent-soft text-accent",
          )}
        >
          {STEPS[current]?.label}
        </span>
      </div>

      <ol className="flex flex-col px-5 py-4">
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={step.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  aria-hidden="true"
                  className={clsx(
                    "grid size-5 shrink-0 place-items-center rounded-full border-2 transition",
                    done && "border-veg bg-veg",
                    active && "border-accent bg-accent",
                    !done && !active && "border-line bg-surface",
                  )}
                >
                  {done ? (
                    <svg viewBox="0 0 12 12" className="size-2.5 text-white" fill="none">
                      <path
                        d="M2.5 6.2l2.3 2.3L9.5 3.8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : active ? (
                    <span className="size-1.5 rounded-full bg-accent-ink" />
                  ) : null}
                </span>
                {i < STEPS.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className={clsx(
                      "w-0.5 flex-1 transition",
                      done ? "bg-veg" : "bg-line",
                    )}
                  />
                ) : null}
              </div>

              <div className={clsx("pb-4", i === STEPS.length - 1 && "pb-0")}>
                <p
                  className={clsx(
                    "text-sm leading-5 font-medium",
                    active ? "text-ink" : done ? "text-ink-2" : "text-ink-3",
                  )}
                >
                  {step.label}
                </p>
                {active ? (
                  <p className="mt-0.5 text-xs text-ink-3">{step.hint}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="border-t border-line px-5 py-4">
        <ul className="flex flex-col gap-1.5">
          {state.placedLines.map((line) => (
            <li key={line.lineId} className="flex justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-ink-2">
                <span className="num">{line.qty}×</span> {line.name}
              </span>
              <span className="num shrink-0 text-ink">
                {money(line.qty * line.unitPrice)}
              </span>
            </li>
          ))}
        </ul>

        {isReady ? (
          <button
            type="button"
            onClick={() => {
              resetOrder();
              onDone?.();
            }}
            className="mt-4 w-full rounded-full border border-line py-3 text-sm font-semibold text-ink transition hover:bg-surface-2 active:scale-[0.99]"
          >
            Start a new order
          </button>
        ) : (
          <p className="num mt-4 text-xs text-ink-3">
            Total {money(total)} · pay at the counter
          </p>
        )}
      </div>
    </div>
  );
}
