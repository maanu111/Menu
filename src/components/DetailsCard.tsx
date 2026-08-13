"use client";

import { useState, useTransition } from "react";
import { useToast } from "./Toaster";
import { useCart } from "@/lib/cart-store";
import { attachCustomer } from "@/lib/order-actions";
import { clsx } from "@/lib/format";

const OCCASIONS = ["Birthday", "Anniversary", "Business"] as const;

/**
 * Offered only after the order is in, and skippable. Nothing here gates the
 * food — it exists so the restaurant can follow up, not to qualify a lead.
 */
export function DetailsCard() {
  const { state, setCustomer } = useCart();
  const notify = useToast();
  const [saving, startSaving] = useTransition();

  const saved = state.customer;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(saved?.name ?? "");
  const [phone, setPhone] = useState(saved?.phone ?? "");
  const [occasion, setOccasion] = useState(saved?.occasion ?? "");
  const [error, setError] = useState("");

  if (saved && !open) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 px-3.5 py-3">
        <svg
          viewBox="0 0 20 20"
          className="size-4 shrink-0 text-veg"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 10.4 8.4 14 15 6.8"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.8125rem] font-medium text-ink">
            {saved.name || "Details saved"}
          </p>
          {saved.phone ? (
            <p className="num truncate text-[0.6875rem] text-ink-3">{saved.phone}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 text-[0.6875rem] font-medium text-ink-3 underline underline-offset-2 transition hover:text-ink"
        >
          Edit
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-xl border border-dashed border-line px-3.5 py-3 text-left transition hover:border-accent/40 hover:bg-surface-2"
      >
        <svg
          viewBox="0 0 20 20"
          className="size-4 shrink-0 text-ink-3"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10 5v10M5 10h10"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.8125rem] font-medium text-ink">
            Add your details
          </span>
          <span className="block text-[0.6875rem] text-ink-3">
            Optional — for the bill and offers
          </span>
        </span>
      </button>
    );
  }

  function save() {
    const trimmedPhone = phone.replace(/\s+/g, "");
    if (trimmedPhone && !/^[6-9]\d{9}$/.test(trimmedPhone)) {
      setError("Enter a 10-digit mobile number, or leave it blank.");
      return;
    }
    if (!name.trim() && !trimmedPhone) {
      setError("Add a name or a number — or skip this.");
      return;
    }
    const details = {
      name: name.trim(),
      phone: trimmedPhone,
      occasion: occasion || undefined,
    };

    /* Saved locally first so the card closes instantly; the order row is
       updated behind it. Nothing here can block the food. */
    setCustomer(details);
    setError("");
    setOpen(false);
    notify("Details saved", "good");

    if (state.orderDbId) {
      startSaving(async () => {
        await attachCustomer(state.orderDbId!, state.sessionId, details);
      });
    }
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-line bg-surface p-3.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[0.8125rem] font-semibold text-ink">Your details</p>
        <span className="text-[0.6875rem] text-ink-3">Optional</span>
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name, e.g. Aarav"
        autoComplete="name"
        className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-[0.8125rem] text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
      />

      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Mobile, e.g. 98765 43210"
        inputMode="numeric"
        autoComplete="tel"
        maxLength={10}
        className="num h-10 w-full rounded-lg border border-line bg-surface px-3 text-[0.8125rem] text-ink placeholder:font-sans placeholder:text-ink-3 focus:border-accent focus:outline-none"
      />

      <div className="flex flex-wrap gap-1.5">
        {OCCASIONS.map((o) => {
          const active = occasion === o;
          return (
            <button
              key={o}
              type="button"
              onClick={() => setOccasion(active ? "" : o)}
              className={clsx(
                "rounded-full border px-3 py-1.5 text-[0.6875rem] font-medium transition active:scale-95",
                active
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line text-ink-2 hover:bg-surface-2",
              )}
            >
              {o}
            </button>
          );
        })}
      </div>

      {error ? (
        <p role="alert" className="text-[0.6875rem] text-nonveg">
          {error}
        </p>
      ) : null}

      <div className="flex gap-2 pt-0.5">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="flex-1 rounded-full bg-accent py-2.5 text-[0.8125rem] font-semibold text-accent-ink transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError("");
          }}
          className="rounded-full border border-line px-4 text-[0.8125rem] font-medium text-ink-2 transition hover:bg-surface-2"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
