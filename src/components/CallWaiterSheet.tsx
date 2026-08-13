"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Sheet } from "./Sheet";
import { useToast } from "./Toaster";
import { WAITER_COOLDOWN_MS, useCart } from "@/lib/cart-store";
import type { WaiterRequest } from "@/lib/types";

const stroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const ICONS: Record<WaiterRequest, ReactNode> = {
  water: (
    <path d="M10 3.2c0 0 4.6 4.9 4.6 8.1a4.6 4.6 0 1 1-9.2 0c0-3.2 4.6-8.1 4.6-8.1Z" {...stroke} />
  ),
  cutlery: (
    <>
      <path d="M6.4 3v3.8a1.6 1.6 0 0 0 3.2 0V3M8 8.4V17" {...stroke} />
      <path d="M13.6 3c1.4 1.6 1.4 5.2 0 6.8V17" {...stroke} />
    </>
  ),
  napkins: (
    <>
      <path d="M3.6 6.2h12.8v7.6H3.6z" {...stroke} />
      <path d="M3.6 6.2 10 10.4l6.4-4.2" {...stroke} />
    </>
  ),
  bill: (
    <>
      <path d="M5.2 3h9.6v14l-1.9-1.4-1.6 1.4L9.6 15.6 8 17l-1.6-1.4L4.6 17V3h.6Z" {...stroke} />
      <path d="M7.6 7h4.8M7.6 10h3.2" {...stroke} />
    </>
  ),
  assistance: (
    <>
      <path d="M5.4 14.4V9a4.6 4.6 0 0 1 9.2 0v5.4M3.8 14.4h12.4M8.4 16.8h3.2" {...stroke} />
    </>
  ),
};

const REASONS: { id: WaiterRequest; label: string }[] = [
  { id: "water", label: "Water" },
  { id: "cutlery", label: "Cutlery" },
  { id: "napkins", label: "Napkins" },
  { id: "bill", label: "Bring the bill" },
  { id: "assistance", label: "Something else" },
];

/** Seconds left before the guest may call a server again. */
export function useWaiterCooldown() {
  const { state } = useCart();
  /* Safe during SSR: waiterCalledAt is null until after hydration, so this
     clock never reaches the rendered output on the first pass. */
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!state.waiterCalledAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [state.waiterCalledAt]);

  if (!state.waiterCalledAt) return 0;
  const left = WAITER_COOLDOWN_MS - (now - state.waiterCalledAt);
  return left > 0 ? Math.ceil(left / 1000) : 0;
}

export function CallWaiterSheet({
  open,
  onClose,
  tableNumber,
  slug,
  token,
}: {
  open: boolean;
  onClose: () => void;
  tableNumber: string;
  slug: string;
  token: string;
}) {
  const { callWaiter, clearWaiter, state } = useCart();
  const notify = useToast();
  const secondsLeft = useWaiterCooldown();
  const onCooldown = secondsLeft > 0;

  /* Drop the stale request once the cooldown expires. */
  useEffect(() => {
    if (state.waiterCalledAt && secondsLeft === 0) clearWaiter();
  }, [secondsLeft, state.waiterCalledAt, clearWaiter]);

  function request(reason: WaiterRequest, label: string) {
    /* Optimistic: the guest sees it acknowledged immediately, and the call is
       written behind that. A failed write is retried by tapping again. */
    callWaiter(reason);
    notify(`A server is on the way — ${label.toLowerCase()}`, "good");
    onClose();

    void fetch("/api/call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        token,
        reason,
        sessionId: state.sessionId,
      }),
      keepalive: true,
    }).catch(() => {
      /* Offline for a moment — they can tap again after the cooldown. */
    });
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Call a server"
      description={
        onCooldown ? undefined : `Someone will come to table ${tableNumber}.`
      }
      size="compact"
    >
      {onCooldown ? (
        <div className="flex flex-col items-center gap-2.5 py-8 text-center">
          <svg viewBox="0 0 20 20" className="size-7 text-veg" aria-hidden="true">
            <path d="M5 10.4 8.4 14 15 6.8" {...stroke} strokeWidth={1.6} />
          </svg>
          <p className="text-[0.8125rem] font-medium text-ink">
            A server is on the way
          </p>
          <p className="text-xs text-ink-3">
            You can ask again in{" "}
            <span className="num text-ink-2">{secondsLeft}s</span>
          </p>
        </div>
      ) : (
        <ul className="-mx-1 divide-y divide-line">
          {REASONS.map((reason, i) => (
            <li key={reason.id}>
              <button
                type="button"
                data-autofocus={i === 0 ? true : undefined}
                onClick={() => request(reason.id, reason.label)}
                className="group flex w-full items-center gap-3 rounded-lg px-1 py-3 text-left transition hover:bg-surface-2"
              >
                <svg
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  className="size-[1.125rem] shrink-0 text-ink-3 transition group-hover:text-accent"
                >
                  {ICONS[reason.id]}
                </svg>
                <span className="flex-1 text-[0.8125rem] font-medium text-ink">
                  {reason.label}
                </span>
                <svg
                  viewBox="0 0 16 16"
                  className="size-3 shrink-0 text-ink-3 transition group-hover:translate-x-0.5 group-hover:text-accent"
                  aria-hidden="true"
                >
                  <path d="M6 3 11 8l-5 5" {...stroke} strokeWidth={1.7} />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
