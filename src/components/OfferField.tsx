"use client";

import { useState, useTransition } from "react";
import { checkOffer } from "@/lib/order-actions";
import { useCart } from "@/lib/cart-store";
import { money } from "@/lib/format";

/**
 * Codes are checked against the database as they're applied, and again when
 * the order is sent — so an offer the owner pauses mid-meal simply stops
 * working rather than coming off the bill anyway.
 */
export function OfferField({
  slug,
  subtotal,
}: {
  slug: string;
  subtotal: number;
}) {
  const { state, applyOffer, clearOffer } = useCart();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const applied = state.offer;

  if (applied) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-veg/30 bg-veg/5 px-3.5 py-2.5">
        <svg viewBox="0 0 20 20" className="size-4 shrink-0 text-veg" fill="none">
          <path
            d="M5 10.4 8.4 14 15 6.8"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="min-w-0 flex-1">
          <span className="num block text-[0.8125rem] font-semibold text-ink">
            {applied.code}
          </span>
          <span className="block text-[0.6875rem] text-ink-2">
            {applied.label} · saving {money(applied.discount)}
          </span>
        </span>
        <button
          type="button"
          onClick={clearOffer}
          className="shrink-0 text-[0.6875rem] font-medium text-ink-3 underline underline-offset-2 transition hover:text-ink"
        >
          Remove
        </button>
      </div>
    );
  }

  function apply() {
    setError("");
    startTransition(async () => {
      const result = await checkOffer(slug, code, Math.round(subtotal * 100));
      if (!result.ok) {
        setError(result.message);
        return;
      }
      applyOffer({
        code: result.code,
        label: result.label,
        discount: result.discountPaise / 100,
      });
      setCode("");
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") apply();
          }}
          placeholder="Have a code? e.g. WEEKEND20"
          aria-label="Offer code"
          className="num h-10 min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 text-[0.8125rem] uppercase text-ink outline-none placeholder:font-sans placeholder:normal-case placeholder:text-ink-3 focus:border-accent"
        />
        <button
          type="button"
          onClick={apply}
          disabled={pending || code.trim().length === 0}
          className="shrink-0 rounded-lg border border-line px-4 text-[0.8125rem] font-semibold text-ink transition hover:bg-surface-2 disabled:opacity-50"
        >
          {pending ? "…" : "Apply"}
        </button>
      </div>
      {error ? (
        <p role="alert" className="text-[0.6875rem] text-nonveg">
          {error}
        </p>
      ) : null}
    </div>
  );
}
