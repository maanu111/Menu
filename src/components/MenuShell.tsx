"use client";

import { useState } from "react";
import { Navbar } from "./Navbar";
import { TableStrip } from "./TableStrip";
import { MenuBrowser } from "./MenuBrowser";
import { OrderPanel } from "./OrderPanel";
import { OrderTracker } from "./OrderTracker";
import { CallWaiterSheet, useWaiterCooldown } from "./CallWaiterSheet";
import { Sheet } from "./Sheet";
import { useCart, billFor } from "@/lib/cart-store";
import { clsx, money } from "@/lib/format";
import type { Category, MenuItem, Restaurant, TableInfo } from "@/lib/types";

const STAGE_TEXT: Record<string, string> = {
  placed: "Sent to kitchen",
  accepted: "Accepted",
  preparing: "Cooking",
  ready: "Ready",
  served: "Served",
};

export function MenuShell({
  restaurant,
  table,
  categories,
  items,
  qrSvg,
  qrUrl,
}: {
  restaurant: Restaurant;
  table: TableInfo;
  categories: Category[];
  items: MenuItem[];
  qrSvg: string;
  qrUrl: string;
}) {
  const { state, count, subtotal } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [waiterOpen, setWaiterOpen] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const cooldown = useWaiterCooldown();

  const bill = billFor(subtotal, restaurant.gstPercent);
  const orderLive = Boolean(state.stage);
  const isReady = state.stage === "ready";

  return (
    <>
      <Navbar restaurant={restaurant} table={table} qrSvg={qrSvg} qrUrl={qrUrl} />

      <main className="mx-auto w-full max-w-140 px-4 sm:px-6">
        <TableStrip table={table} />
        <MenuBrowser categories={categories} items={items} />

        <footer className="num border-t border-line py-8 text-center text-[0.6875rem] text-ink-3">
          FSSAI {restaurant.fssai}
        </footer>

        {/* Clears the fixed bar so the last dish is never trapped under it. */}
        <div aria-hidden="true" className={clsx(orderLive ? "h-40" : "h-28")} />
      </main>

      {/* ------------------------------------------------- Fixed bottom bar */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-140 px-4 sm:px-6"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        {orderLive ? (
          <button
            type="button"
            onClick={() => setTrackerOpen(true)}
            className={clsx(
              "anim-sheet mb-2 flex w-full items-center gap-2.5 rounded-full border px-4 py-2.5 text-left backdrop-blur-md transition active:scale-[0.99]",
              isReady ? "border-veg/40 bg-veg/12" : "border-line bg-surface/90",
            )}
            style={{ boxShadow: "var(--shadow)" }}
          >
            <span
              aria-hidden="true"
              className={clsx(
                "size-2 shrink-0 rounded-full",
                isReady ? "bg-veg" : "bg-accent",
              )}
            />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
              {STAGE_TEXT[state.stage ?? ""]}
            </span>
            <span className="num shrink-0 text-xs text-ink-3">{state.orderId}</span>
            <svg
              viewBox="0 0 16 16"
              className="size-3.5 shrink-0 text-ink-3"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 3l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : null}

        <div
          className="flex items-center gap-2 rounded-full border border-line bg-surface/92 p-1.5 backdrop-blur-md"
          style={{ boxShadow: "var(--shadow-lift)" }}
        >
          <button
            type="button"
            onClick={() => setWaiterOpen(true)}
            aria-label={
              cooldown > 0 ? `Server called, ${cooldown} seconds left` : "Call a server"
            }
            className={clsx(
              "flex h-12 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition active:scale-95",
              cooldown > 0
                ? "bg-veg/12 text-veg"
                : "bg-surface-2 text-ink hover:brightness-95",
            )}
          >
            <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
              <path
                d="M4.5 14.5V9a5.5 5.5 0 0 1 11 0v5.5M3 14.5h14M8.2 17h3.6"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {cooldown > 0 ? (
              <span className="num text-xs">{cooldown}s</span>
            ) : (
              <span className="hidden xs:inline">Server</span>
            )}
          </button>

          {count > 0 ? (
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="flex h-12 min-w-0 flex-1 items-center justify-between rounded-full bg-accent px-5 text-sm font-semibold text-accent-ink transition hover:brightness-110 active:scale-[0.98]"
            >
              <span className="flex items-center gap-2">
                <span className="num grid size-5 place-items-center rounded-full bg-accent-ink/20 text-xs">
                  {count}
                </span>
                View order
              </span>
              <span className="num">{money(bill.total)}</span>
            </button>
          ) : (
            <p className="flex h-12 min-w-0 flex-1 items-center justify-center px-4 text-sm text-ink-3">
              {orderLive ? "Order in progress" : "Add a dish to start"}
            </p>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------- Sheets */}
      <Sheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        title="Your order"
        description={`Table ${table.number}`}
      >
        <OrderPanel
          gstPercent={restaurant.gstPercent}
          tableNumber={table.number}
          onPlaced={() => {
            setCartOpen(false);
            setTrackerOpen(true);
          }}
        />
      </Sheet>

      <Sheet
        open={trackerOpen}
        onClose={() => setTrackerOpen(false)}
        title="Order status"
        description="Updates on its own."
      >
        <OrderTracker onDone={() => setTrackerOpen(false)} />
      </Sheet>

      <CallWaiterSheet
        open={waiterOpen}
        onClose={() => setWaiterOpen(false)}
        tableNumber={table.number}
      />
    </>
  );
}
