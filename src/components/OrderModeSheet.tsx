"use client";

import { useState } from "react";
import { Sheet } from "./Sheet";
import { useCart } from "@/lib/cart-store";
import { clsx } from "@/lib/format";
import type { DeliveryAddress, Restaurant, TableInfo } from "@/lib/types";

type Step = "choose" | "table" | "address";

/**
 * The first thing a guest sees. The restaurant's code goes up in offices and
 * canteens as well as on tables, so we cannot assume anyone is sitting in the
 * restaurant — we ask before showing a price.
 *
 * It cannot be dismissed without answering: an order with neither a table nor
 * an address is one the restaurant can do nothing with.
 */
export function OrderModeSheet({
  restaurant,
  table,
  tables,
}: {
  restaurant: Restaurant;
  /** Set when they scanned the code printed on one particular table. */
  table: TableInfo | null;
  /** Every open table, for a guest who scanned the restaurant's shared code. */
  tables: { number: string; section: string; token: string }[];
}) {
  const { state, setMode } = useCart();
  const [step, setStep] = useState<Step>("choose");
  const [draft, setDraft] = useState<DeliveryAddress>({
    name: "",
    phone: "",
    address: "",
    note: "",
  });
  const [error, setError] = useState("");

  /* Nothing to ask once they have answered, and nothing to ask before the
     saved answer has been read back off this phone. */
  const open = state.hydrated && state.mode === null;

  function chooseDineIn() {
    if (table) {
      setMode("dinein", table.token, null);
      return;
    }
    if (tables.length === 1) {
      setMode("dinein", tables[0].token, null);
      return;
    }
    setStep("table");
  }

  function submitAddress() {
    const phone = draft.phone.replace(/[^0-9]/g, "");
    if (draft.name.trim().length < 2) {
      setError("Tell us who the order is for.");
      return;
    }
    if (phone.replace(/^(0|91)(?=\d{10}$)/, "").length !== 10) {
      setError("A 10-digit mobile number, so they can reach you.");
      return;
    }
    if (draft.address.trim().length < 10) {
      setError("The full address — flat or house, street, then area.");
      return;
    }
    setError("");
    setMode("delivery", null, { ...draft, phone });
  }

  const sections = new Map<string, typeof tables>();
  for (const row of tables) {
    const key = row.section?.trim() || "Tables";
    if (!sections.has(key)) sections.set(key, []);
    sections.get(key)!.push(row);
  }

  return (
    <Sheet
      open={open}
      onClose={() => {
        /* Backing out of a sub-step returns to the choice, never to nothing. */
        if (step !== "choose") setStep("choose");
      }}
      dismissible={step !== "choose"}
      title={
        step === "table"
          ? "Which table are you at?"
          : step === "address"
            ? "Where are we sending it?"
            : `Welcome to ${restaurant.name}`
      }
      description={
        step === "table"
          ? "So the kitchen knows where to bring it."
          : step === "address"
            ? "Just a name, a number and where to bring it."
            : "How would you like to order?"
      }
    >
      {step === "choose" ? (
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={chooseDineIn}
            className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-4 text-left transition active:scale-[0.99] hover:border-accent"
          >
            <svg viewBox="0 0 20 20" className="size-6 shrink-0 text-accent" fill="none" aria-hidden="true">
              <path d="M3 8.5h14M4.5 8.5v6a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M6.5 5.5V3M10 5.5V3m3.5 2.5V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">
                {table ? `I'm at table ${table.number}` : "I'm eating here"}
              </span>
              <span className="block text-xs text-ink-2">
                {table
                  ? "Order straight to this table and follow it as it cooks."
                  : "Pick your table and follow the order as it cooks."}
              </span>
            </span>
          </button>

          {restaurant.acceptsDelivery ? (
            <button
              type="button"
              onClick={() => setStep("address")}
              className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-4 text-left transition active:scale-[0.99] hover:border-accent"
            >
              <svg viewBox="0 0 20 20" className="size-6 shrink-0 text-accent" fill="none" aria-hidden="true">
                <path d="M2.5 6.5h8v7h-8zM10.5 9h3.6l2.4 2.4v2.1h-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="6" cy="14.8" r="1.4" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="13.6" cy="14.8" r="1.4" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink">
                  Deliver it to me
                </span>
                <span className="block text-xs text-ink-2">
                  {restaurant.deliveryNote?.trim() || "To your address."}
                  {restaurant.deliveryMin > 0
                    ? ` Minimum ₹${restaurant.deliveryMin}.`
                    : ""}
                </span>
              </span>
            </button>
          ) : null}
        </div>
      ) : null}

      {step === "table" ? (
        <div className="flex flex-col gap-5">
          {tables.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-ink-3">
              No tables are open right now. Please ask a server.
            </p>
          ) : (
            [...sections.entries()].map(([section, rows]) => (
              <section key={section}>
                {sections.size > 1 ? (
                  <p className="eyebrow mb-2 text-ink-3">{section}</p>
                ) : null}
                <ul className="grid grid-cols-4 gap-2 xs:grid-cols-5">
                  {rows.map((row) => (
                    <li key={row.token}>
                      <button
                        type="button"
                        onClick={() => setMode("dinein", row.token, null)}
                        className="num flex aspect-square w-full items-center justify-center rounded-xl border border-line bg-surface text-lg font-semibold text-ink transition active:scale-95 hover:border-accent hover:text-accent"
                      >
                        {row.number}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
          <button
            type="button"
            onClick={() => setStep("choose")}
            className="text-xs font-medium text-ink-3 underline underline-offset-2"
          >
            Back
          </button>
        </div>
      ) : null}

      {step === "address" ? (
        <div className="flex flex-col gap-2.5">
          <input
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder="Your name, e.g. Aarav"
            aria-label="Your name"
            autoComplete="name"
            className="h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
          />
          <input
            value={draft.phone}
            onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
            placeholder="Mobile, e.g. 98765 43210"
            aria-label="Mobile number"
            inputMode="numeric"
            autoComplete="tel"
            className="h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
          />
          <textarea
            value={draft.address}
            onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
            rows={3}
            placeholder="Flat / house, street, area, pin code"
            aria-label="Delivery address"
            autoComplete="street-address"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
          />
          <input
            value={draft.note}
            onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
            placeholder="Landmark, e.g. opposite the petrol pump"
            aria-label="Landmark"
            className="h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
          />

          {error ? (
            <p role="alert" className="text-xs text-nonveg">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={submitAddress}
            className={clsx(
              "mt-1 h-12 w-full rounded-full bg-accent text-sm font-semibold text-accent-ink",
              "transition hover:brightness-110 active:scale-[0.99]",
            )}
          >
            Start ordering
          </button>
          <button
            type="button"
            onClick={() => setStep("choose")}
            className="text-xs font-medium text-ink-3 underline underline-offset-2"
          >
            Back
          </button>
        </div>
      ) : null}
    </Sheet>
  );
}
