"use client";

import { useState } from "react";
import { Sheet } from "./Sheet";
import { LanguagePicker } from "./LanguagePicker";
import { useCart } from "@/lib/cart-store";
import { clsx } from "@/lib/format";
import { t } from "@/lib/ui-translations";
import type { PickupDetails, Restaurant, TableInfo } from "@/lib/types";

type Step = "choose" | "guests" | "table" | "pickup";

/**
 * The first thing a guest sees. The restaurant's code goes up in offices and
 * canteens as well as on tables, so we cannot assume anyone is sitting in the
 * restaurant — we ask before showing a price.
 *
 * It cannot be dismissed without answering: an order with neither a table nor
 * a name to call out is one the restaurant can do nothing with.
 */
export function OrderModeSheet({
  restaurant,
  table,
  tables,
  language,
}: {
  restaurant: Restaurant;
  /** Set when they scanned the code printed on one particular table. */
  table: TableInfo | null;
  /** Every open table, for a guest who scanned the restaurant's shared code. */
  tables: { number: string; section: string; token: string }[];
  /** The language the menu is being shown in right now. */
  language: string;
}) {
  const { state, setMode, setGuests } = useCart();
  const [step, setStep] = useState<Step>("choose");
  const [people, setPeople] = useState(state.guests || 2);
  const [draft, setDraft] = useState<PickupDetails>({ name: "", phone: "" });
  const [error, setError] = useState("");

  /* Nothing to ask once they have answered, and nothing to ask before the
     saved answer has been read back off this phone. */
  const open = state.hydrated && state.mode === null;

  /* How many are eating comes first: it decides portions, and it is the one
     thing a guest answers without thinking. The table follows. */
  function confirmGuests() {
    setGuests(people);
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

  function submitPickup() {
    const phone = draft.phone.replace(/[^0-9]/g, "").replace(/^(0|91)(?=\d{10}$)/, "");
    if (draft.name.trim().length < 2) {
      setError(t("tellUsWho", language));
      return;
    }
    if (phone.length !== 10) {
      setError(t("tenDigitMobile", language));
      return;
    }
    setError("");
    setMode("pickup", null, { name: draft.name.trim(), phone });
  }

  const TITLES: Record<Step, string> = {
    choose: t("welcomeTo", language).replace("{name}", restaurant.name),
    guests: t("howManyEating", language),
    table: t("whichTable", language),
    pickup: t("whosCollecting", language),
  };
  const NOTES: Record<Step, string> = {
    choose: t("howToOrder", language),
    guests: t("portionNote", language),
    table: t("tableNote", language),
    pickup: t("pickupFormNote", language),
  };

  return (
    <Sheet
      open={open}
      onClose={() => {
        /* Backing out of a sub-step returns to the choice, never to nothing. */
        if (step !== "choose") setStep("choose");
      }}
      dismissible={step !== "choose"}
      title={TITLES[step]}
      description={NOTES[step]}
    >
      {step === "choose" ? (
        <div className="flex flex-col gap-2.5">
          {/* Language picker pill — visible on the welcome screen so the
              guest can switch before choosing dine-in or pickup. */}
          <div className="flex justify-end -mt-1 mb-1">
            <LanguagePicker active={language} />
          </div>

          <button
            type="button"
            onClick={() => setStep("guests")}
            className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-4 text-left transition active:scale-[0.99] hover:border-accent"
          >
            <svg viewBox="0 0 20 20" className="size-6 shrink-0 text-accent" fill="none" aria-hidden="true">
              <path d="M3 8.5h14M4.5 8.5v6a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M6.5 5.5V3M10 5.5V3m3.5 2.5V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">
                {table
                  ? t("imAtTable", language).replace("{n}", table.number)
                  : t("eatingHere", language)}
              </span>
              <span className="block text-xs text-ink-2">
                {t("dineInDesc", language)}
              </span>
            </span>
          </button>

          {restaurant.acceptsPickup ? (
            <button
              type="button"
              onClick={() => setStep("pickup")}
              className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-4 text-left transition active:scale-[0.99] hover:border-accent"
            >
              <svg viewBox="0 0 20 20" className="size-6 shrink-0 text-accent" fill="none" aria-hidden="true">
                <path d="M5 7h10l-.9 8.2a1.6 1.6 0 0 1-1.6 1.4H7.5a1.6 1.6 0 0 1-1.6-1.4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M7.6 7V5.6a2.4 2.4 0 0 1 4.8 0V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink">
                  {t("pickupTakeaway", language)}
                </span>
                <span className="block text-xs text-ink-2">
                  {restaurant.pickupNote?.trim() || t("collectAtCounter", language)}
                  {restaurant.pickupMin > 0
                    ? ` ${t("minimum", language).replace("{n}", String(restaurant.pickupMin))}`
                    : ""}
                </span>
              </span>
            </button>
          ) : null}
        </div>
      ) : null}

      {step === "guests" ? (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={() => setPeople((n) => Math.max(1, n - 1))}
              aria-label="One fewer"
              className="grid size-12 place-items-center rounded-full border border-line text-xl text-ink-2 transition active:scale-95 hover:border-accent"
            >
              −
            </button>
            <span className="num w-16 text-center text-4xl font-semibold text-ink">
              {people}
            </span>
            <button
              type="button"
              onClick={() => setPeople((n) => Math.min(30, n + 1))}
              aria-label="One more"
              className="grid size-12 place-items-center rounded-full border border-line text-xl text-ink-2 transition active:scale-95 hover:border-accent"
            >
              +
            </button>
          </div>

          <ul className="flex flex-wrap justify-center gap-2">
            {[1, 2, 3, 4, 6, 8].map((n) => (
              <li key={n}>
                <button
                  type="button"
                  onClick={() => setPeople(n)}
                  className={clsx(
                    "num h-9 w-11 rounded-lg border text-sm font-semibold transition",
                    people === n
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-line text-ink-2 hover:border-accent",
                  )}
                >
                  {n}
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={confirmGuests}
            className="h-12 w-full rounded-full bg-accent text-sm font-semibold text-accent-ink transition hover:brightness-110 active:scale-[0.99]"
          >
            {table || tables.length === 1
              ? t("startOrdering", language)
              : t("nextPickTable", language)}
          </button>
          <BackTo onClick={() => setStep("choose")} language={language} />
        </div>
      ) : null}

      {step === "table" ? (
        <div className="flex flex-col gap-5">
          {tables.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-ink-3">
              {t("noTablesOpen", language)}
            </p>
          ) : (
            <ul className="grid grid-cols-4 gap-2 xs:grid-cols-5">
              {tables.map((row) => (
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
          )}
          <BackTo onClick={() => setStep("guests")} language={language} />
        </div>
      ) : null}

      {step === "pickup" ? (
        <div className="flex flex-col gap-2.5">
          <input
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder={t("yourName", language)}
            aria-label={t("yourName", language)}
            autoComplete="name"
            className="h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
          />
          <input
            value={draft.phone}
            onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
            placeholder={t("mobile", language)}
            aria-label={t("mobile", language)}
            inputMode="numeric"
            autoComplete="tel"
            className="h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
          />

          {error ? (
            <p role="alert" className="text-xs text-nonveg">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={submitPickup}
            className="mt-1 h-12 w-full rounded-full bg-accent text-sm font-semibold text-accent-ink transition hover:brightness-110 active:scale-[0.99]"
          >
            {t("startOrdering", language)}
          </button>
          <BackTo onClick={() => setStep("choose")} language={language} />
        </div>
      ) : null}
    </Sheet>
  );
}

function BackTo({ onClick, language }: { onClick: () => void; language: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-medium text-ink-3 underline underline-offset-2"
    >
      {t("back", language)}
    </button>
  );
}
