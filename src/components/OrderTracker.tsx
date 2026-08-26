"use client";

import { AddOnsRail } from "./AddOnsRail";
import { DetailsCard } from "./DetailsCard";
import { useToast } from "./Toaster";
import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { clsx, money } from "@/lib/format";
import type { MenuItem, OrderStage } from "@/lib/types";

const STEPS: { id: OrderStage; label: string; hint: string }[] = [
  { id: "placed", label: "Sent to kitchen", hint: "Ticket printed" },
  { id: "preparing", label: "Cooking", hint: "On the fire now" },
  { id: "ready", label: "Ready", hint: "Coming to your table" },
  { id: "served", label: "Served", hint: "Enjoy your meal" },
];

export function OrderTracker({
  items,
  onDone,
  slug,
  token,
}: {
  items: MenuItem[];
  onDone?: () => void;
  slug: string;
  /** The table this order belongs to. Null for a collection order. */
  token: string | null;
}) {
  const { state, resetOrder, reorderDirect } = useCart();
  const notify = useToast();
  const [checkingOut, setCheckingOut] = useState(false);
  if (!state.stage) return null;

  const activeStage = state.stage === "accepted" ? "placed" : state.stage;
  const current = Math.max(0, STEPS.findIndex((s) => s.id === activeStage));
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
            <li key={line.lineId} className="flex items-center gap-2.5 text-sm">
              <span className="min-w-0 flex-1 truncate text-ink-2">
                <span className="num">{line.qty}×</span> {line.name}
              </span>
              <span className="num shrink-0 text-ink">
                {money(line.qty * line.unitPrice)}
              </span>
              {/* Same again, straight from the ticket they are looking at. */}
              <button
                type="button"
                onClick={async () => {
                  const res = await reorderDirect([line]);
                  if (res.ok) {
                    notify(`Order ${res.code} sent to kitchen`, "good");
                  } else {
                    notify(res.message);
                  }
                }}
                className="shrink-0 rounded-full border border-accent px-2.5 py-1 text-[0.625rem] font-semibold text-accent transition active:scale-95 hover:bg-accent-soft"
              >
                Reorder
              </button>
            </li>
          ))}
        </ul>

        {/* The total is what a guest checks against the bill, so it is the
            one number here that is allowed to shout. */}
        <div className="mt-3 flex items-baseline justify-between rounded-lg bg-surface-2 px-3 py-2.5">
          <span className="text-[0.8125rem] font-semibold text-ink">Total</span>
          <span className="num text-base font-semibold text-ink">
            {money(total)}
          </span>
        </div>
        <p className="num mt-1.5 text-[0.6875rem] text-ink-3">
          {state.guests} {state.guests === 1 ? "guest" : "guests"} · pay at the
          counter
        </p>

        {/* Tells the counter this table is done and wants to settle up. */}
        {token ? (
          <div className="mt-3 flex flex-col gap-1.5">
            {state.stage !== "served" ? (
              <p className="text-center text-xs text-ink-3">
                Checkout will be available once your food is served
              </p>
            ) : null}
            <button
              type="button"
              disabled={checkingOut || state.stage !== "served"}
              onClick={() => {
                setCheckingOut(true);
                notify("The counter has been told — someone is on the way", "good");
                void fetch("/api/call", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    slug,
                    token,
                    reason: "checkout",
                    sessionId: state.sessionId,
                  }),
                }).catch(() => setCheckingOut(false));
              }}
              className={clsx(
                "h-12 w-full rounded-full text-sm font-semibold transition active:scale-[0.99] shadow-sm",
                state.stage === "served"
                  ? "bg-accent text-accent-ink hover:brightness-110"
                  : "bg-surface-2 text-ink-3 cursor-not-allowed border border-line opacity-75",
              )}
            >
              {checkingOut ? "The counter knows" : state.stage === "served" ? "Checkout" : "In Kitchen"}
            </button>
            <p className="mt-1 text-center text-[0.75rem] font-medium text-ink-3 flex items-center justify-center gap-1.5">
              <span className="text-accent">💳</span>
              <span>You can pay at the counter after checkout</span>
            </p>
          </div>
        ) : null}

        {/* Suggestions and details come after the commitment, never before. */}
        <div className="mt-4 flex flex-col gap-3 border-t border-dashed border-line pt-4">
          <AddOnsRail items={items} />
          <DetailsCard />
        </div>

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
        ) : null}
      </div>
    </div>
  );
}
