"use client";

import { useState } from "react";
import { Navbar } from "./Navbar";
import { MenuBrowser } from "./MenuBrowser";
import { BannerRail } from "./BannerRail";
import { LanguagePicker } from "./LanguagePicker";
import { OrderModeSheet } from "./OrderModeSheet";
import { OrderHistorySheet } from "./OrderHistorySheet";
import { OrderPanel } from "./OrderPanel";
import { OrderTracker } from "./OrderTracker";
import { CallWaiterSheet, useWaiterCooldown } from "./CallWaiterSheet";
import { Sheet } from "./Sheet";
import { useCart, billFor } from "@/lib/cart-store";
import { clsx, money } from "@/lib/format";
import type {
  Banner,
  Category,
  MenuItem,
  Restaurant,
  TableInfo,
} from "@/lib/types";

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
  tables,
  banners,
  categories,
  items,
  qrSvg,
  qrUrl,
  language,
}: {
  restaurant: Restaurant;
  /** Set only when they scanned the code printed on one particular table. */
  table: TableInfo | null;
  /** Every open table, for a guest who scanned the restaurant's shared code. */
  tables: { number: string; section: string; token: string }[];
  banners: Banner[];
  categories: Category[];
  items: MenuItem[];
  qrSvg: string;
  qrUrl: string;
  /** The language the menu is being shown in right now. */
  language: string;
}) {
  const { state, count, subtotal } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [waiterOpen, setWaiterOpen] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const cooldown = useWaiterCooldown();

  const bill = billFor(subtotal, restaurant.gstPercent, state.offer?.discount ?? 0);

  /* A guest collecting is not in the room: no table and nobody to call over,
     though they still follow the ticket so they know when to walk in. */
  const forPickup = state.mode === "pickup";
  const seated = state.mode === "dinein";
  const orderLive = Boolean(state.stage);
  const isReady = state.stage === "ready";

  /* The table they scanned, or the one they picked in the popup. */
  const seatedAt =
    table ?? tables.find((t) => t.token === state.tableToken) ?? null;

  return (
    <>
      <Navbar restaurant={restaurant} table={table} qrSvg={qrSvg} qrUrl={qrUrl} />

      <OrderModeSheet restaurant={restaurant} table={table} tables={tables} />

      <main className="mx-auto w-full max-w-140 px-4 sm:px-6">
        {forPickup ? (
          <PickupStrip restaurant={restaurant} />
        ) : seatedAt ? (
          <SeatStrip number={seatedAt.number} section={seatedAt.section} />
        ) : null}

        {restaurant.menuNote ? (
          <p className="mt-2 rounded-lg bg-accent-soft px-3 py-2 text-[0.75rem] text-accent">
            {restaurant.menuNote}
          </p>
        ) : null}

        <LanguagePicker languages={restaurant.languages} active={language} />

        <BannerRail banners={banners} />

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
          {seated && seatedAt ? (
          <button
            type="button"
            onClick={() => setWaiterOpen(true)}
            aria-label={
              cooldown > 0 ? `Staff called, ${cooldown} seconds left` : "Call staff"
            }
            className={clsx(
              "flex h-12 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition active:scale-95",
              cooldown > 0
                ? "bg-veg/12 text-veg"
                : "bg-nonveg text-white hover:brightness-110",
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
              <span>Staff</span>
            )}
          </button>
          ) : null}

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
        description={
          forPickup ? "To collect" : seatedAt ? `Table ${seatedAt.number}` : ""
        }
      >
        <OrderPanel
          gstPercent={restaurant.gstPercent}
          tableNumber={seatedAt?.number ?? null}
          restaurant={restaurant}
          slug={restaurant.slug}
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
        footer={
          state.history.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                setTrackerOpen(false);
                setHistoryOpen(true);
              }}
              className="w-full rounded-full border border-line py-3 text-sm font-semibold text-ink transition hover:bg-surface-2 active:scale-[0.99]"
            >
              Your past orders
            </button>
          ) : null
        }
      >
        <OrderTracker
          items={items}
          onDone={() => setTrackerOpen(false)}
          slug={restaurant.slug}
          token={seatedAt?.token ?? null}
        />
      </Sheet>

      <OrderHistorySheet
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />

      {seated && seatedAt ? (
        <CallWaiterSheet
          open={waiterOpen}
          onClose={() => setWaiterOpen(false)}
          tableNumber={seatedAt.number}
          slug={restaurant.slug}
          token={seatedAt.token}
        />
      ) : null}
    </>
  );
}

/**
 * Stands in for the table strip when the guest is collecting, carrying the
 * restaurant's own words about when it will be ready and where to come.
 */
/** Which table the kitchen is cooking for, however it was chosen. */
function SeatStrip({ number, section }: { number: string; section: string }) {
  const { resetMode } = useCart();
  return (
    <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-3.5 py-2.5">
      <p className="min-w-0 flex-1 text-sm font-semibold text-ink">
        Table <span className="num">{number}</span>
        {section ? (
          <span className="ml-1.5 text-xs font-normal text-ink-3">{section}</span>
        ) : null}
      </p>
      <button
        type="button"
        onClick={resetMode}
        className="shrink-0 text-xs font-medium text-ink-3 underline underline-offset-2 hover:text-ink"
      >
        Change
      </button>
    </div>
  );
}

function PickupStrip({ restaurant }: { restaurant: Restaurant }) {
  return (
    <div className="mt-3 rounded-xl border border-line bg-surface-2 px-3.5 py-3">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        <svg viewBox="0 0 20 20" className="size-4 text-accent" fill="none" aria-hidden="true">
          <path
            d="M2.5 6.5h8v7h-8zM10.5 9h3.6l2.4 2.4v2.1h-6z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="6" cy="14.8" r="1.4" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="13.6" cy="14.8" r="1.4" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        Collecting from {restaurant.name}
      </p>
      {restaurant.pickupNote ? (
        <p className="mt-1 text-xs leading-relaxed text-ink-2">
          {restaurant.pickupNote}
        </p>
      ) : null}
      {restaurant.pickupMin > 0 ? (
        <p className="num mt-1 text-xs text-ink-3">
          Minimum order ₹{restaurant.pickupMin}
        </p>
      ) : null}
      <ChangeMode />
    </div>
  );
}

function ChangeMode() {
  const { resetMode } = useCart();
  return (
    <button
      type="button"
      onClick={resetMode}
      className="mt-1.5 text-xs font-medium text-ink-3 underline underline-offset-2 hover:text-ink"
    >
      Eating in instead?
    </button>
  );
}
