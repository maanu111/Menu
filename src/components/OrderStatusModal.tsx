"use client";

import { useState, useEffect } from "react";
import { Sheet } from "./Sheet";
import { AddOnsRail } from "./AddOnsRail";
import { DetailsCard } from "./DetailsCard";
import { DietMark } from "./DietMark";
import { useToast } from "./Toaster";
import { useCart, type PastOrder, type CheckoutVisit } from "@/lib/cart-store";
import { clsx, money } from "@/lib/format";
import { t, stageText, type UIStrings } from "@/lib/ui-translations";
import type { CartLine, MenuItem } from "@/lib/types";

function when(at: number) {
  const date = new Date(at);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return `Today, ${date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TRACK_STEPS = [
  { id: "placed", key: "sentToKitchen" },
  { id: "preparing", key: "cooking" },
  { id: "ready", key: "ready" },
  { id: "served", key: "served" },
] as const;

function OrderStatusProgressBar({ stage, language }: { stage?: string; language: string }) {
  const activeStage = stage === "accepted" ? "placed" : stage ?? "placed";
  const currentIndex = Math.max(0, TRACK_STEPS.findIndex((step) => step.id === activeStage));

  return (
    <div className="border-b border-line bg-surface-2/40 px-3 py-2.5">
      <div className="flex items-start justify-between">
        {TRACK_STEPS.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <div key={step.id} className="relative flex flex-1 flex-col items-center text-center">
              {index < TRACK_STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={clsx(
                    "absolute top-2 left-[50%] right-[-50%] z-0 h-0.5",
                    done ? "bg-veg" : "bg-line",
                  )}
                />
              ) : null}
              <span
                className={clsx(
                  "relative z-10 grid size-4.5 place-items-center rounded-full border-2 text-[0.625rem]",
                  done && "border-veg bg-veg text-white",
                  active && "border-nonveg bg-nonveg font-bold text-white",
                  !done && !active && "border-line bg-surface text-ink-3",
                )}
              >
                {done ? "✓" : index + 1}
              </span>
              <span
                className={clsx(
                  "mt-1 px-0.5 text-[0.625rem] font-medium leading-tight",
                  active ? "font-semibold text-nonveg" : done ? "text-ink-2" : "text-ink-3",
                )}
              >
                {t(step.key as keyof UIStrings, language)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OrderStatusModal({
  open,
  onClose,
  initialTab = "status",
  items = [],
  slug,
  token,
  language = "en",
}: {
  open: boolean;
  onClose: () => void;
  initialTab?: "status" | "history";
  items?: MenuItem[];
  slug: string;
  token: string | null;
  language?: string;
}) {
  const { state, reorderDirect, checkout } = useCart();
  const notify = useToast();
  const [tab, setTab] = useState<"status" | "history">(initialTab);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (!open) {
      setCheckingOut(false);
    }
  }, [open]);

  async function handleReorder(lines: CartLine[]) {
    setCheckingOut(false);
    const result = await reorderDirect(lines);
    if (result.ok) {
      setTab("status");
      notify(`Order ${result.code} sent to kitchen`, "good");
    } else notify(result.message);
  }

  async function handleCheckout() {
    setCheckingOut(true);
    try {
      if (token) {
        const response = await fetch("/api/call", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            token,
            reason: "checkout",
            sessionId: state.sessionId,
          }),
        });
        if (!response.ok) throw new Error("Checkout request failed");
      }

      checkout();
      setTab("history");
      notify(
        token ? "The counter has been told — someone is on the way" : "Order moved to history",
        "good",
      );
    } catch {
      notify("Couldn't request checkout. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  }

  const activeOrders = state.activeOrders;
  const combinedTotal = activeOrders.reduce((sum, order) => sum + order.total, 0);
  const combinedItems = activeOrders.reduce(
    (sum, order) => sum + order.lines.reduce((lineSum, line) => lineSum + line.qty, 0),
    0,
  );

  const header = (
    <div className="-mb-1 flex w-full items-center justify-between pr-2">
      <button
        type="button"
        onClick={() => setTab("status")}
        className={clsx(
          "relative pb-2.5 text-base font-semibold transition",
          tab === "status" ? "text-ink" : "text-ink-3 hover:text-ink-2",
        )}
      >
        {t("orderStatus", language)}
        {tab === "status" ? <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-nonveg" /> : null}
      </button>
      <button
        type="button"
        onClick={() => setTab("history")}
        className={clsx(
          "relative ml-auto pb-2.5 pr-2 text-base font-semibold transition",
          tab === "history" ? "text-ink" : "text-ink-3 hover:text-ink-2",
        )}
      >
        {t("yourPastOrders", language)}
        {tab === "history" ? <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-nonveg" /> : null}
      </button>
    </div>
  );

  const footer =
    tab === "status" && activeOrders.length > 0 ? (
      <div className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between px-1">
          <span>
            <span className="block text-base font-bold text-ink">Total</span>
            <span className="num text-xs text-ink-3">
              {combinedItems} {combinedItems === 1 ? "item" : "items"} · {state.guests} {state.guests === 1 ? "guest" : "guests"}
            </span>
          </span>
          <span className="num text-xl font-bold text-ink">{money(combinedTotal)}</span>
        </div>
        <button
          type="button"
          disabled={checkingOut}
          onClick={() => void handleCheckout()}
          className="h-11 w-full rounded-full bg-nonveg text-sm font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
        >
          {checkingOut ? "Requesting checkout…" : "Checkout"}
        </button>
      </div>
    ) : null;

  return (
    <Sheet open={open} onClose={onClose} title={header} footer={footer}>
      {tab === "status" ? (
        activeOrders.length > 0 ? (
          <div className="flex flex-col gap-4">
            <ul className="flex flex-col gap-4">
              {activeOrders.map((order) => (
                <ActiveOrderCard
                  key={order.orderDbId || order.code + order.placedAt}
                  order={order}
                  language={language}
                  onReorder={handleReorder}
                />
              ))}
            </ul>

            {items.length > 0 ? (
              <div className="mt-1 flex flex-col gap-2.5">
                <div className="flex items-baseline justify-between px-0.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink">Anything else?</h3>
                  <span className="text-xs text-ink-3">Goes on the same bill</span>
                </div>
                <AddOnsRail items={items} />
                <DetailsCard />
              </div>
            ) : null}
          </div>
        ) : (
          <EmptyOrders
            title="No open orders"
            description="Anything ordered for this table will stay here until checkout."
          />
        )
      ) : (
        /* History Tab: List of Single-Card Checkout Visits */
        state.history.length > 0 ? (
          <ul className="flex flex-col gap-4">
            {state.history.map((visit) => (
              <CheckoutVisitCard
                key={visit.id}
                visit={visit}
                language={language}
                onReorder={handleReorder}
              />
            ))}
          </ul>
        ) : (
          <EmptyOrders
            title="No order history"
            description="Completed table visits will appear here after checkout."
          />
        )
      )}
    </Sheet>
  );
}

function ActiveOrderCard({
  order,
  language,
  onReorder,
}: {
  order: PastOrder;
  language: string;
  onReorder: (lines: CartLine[]) => void;
}) {
  const stage = order.stage ?? "placed";
  const served = stage === "served";

  return (
    <li className="overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">
      <div className="flex items-center gap-2 border-b border-line/80 px-4 py-2.5">
        <span className="num text-base font-bold text-ink">{order.code}</span>
        <span
          className={clsx(
            "rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold",
            served ? "bg-veg/10 text-veg" : "bg-nonveg/10 text-nonveg",
          )}
        >
          {stageText(stage, language)}
        </span>
        <span className="ml-auto text-xs text-ink-3">{when(order.placedAt)}</span>
      </div>

      <OrderStatusProgressBar stage={stage} language={language} />

      <ul className="flex flex-col divide-y divide-line/60">
        {order.lines.map((line) => (
          <li key={line.lineId} className="flex items-center gap-2 px-4 py-2.5">
            <DietMark diet={line.diet} className="shrink-0" />
            <span className="min-w-0 flex-1 truncate text-xs text-ink">
              <span className="font-medium text-ink-2">{line.qty} × </span>
              {line.name}
            </span>
            <span className="num shrink-0 text-xs font-medium text-ink">
              {money(line.qty * line.unitPrice)}
            </span>
            <button
              type="button"
              onClick={() => onReorder([line])}
              className="ml-1.5 shrink-0 rounded-full border border-nonveg/40 px-2 py-0.5 text-[0.625rem] font-semibold text-nonveg transition active:scale-95 hover:bg-nonveg/10"
            >
              Reorder
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-line/80 bg-surface-2/30 px-4 py-2.5">
        <span className="text-xs text-ink-3">
          {order.mode === "pickup"
            ? "Collected"
            : order.tableNumber
              ? `Table ${order.tableNumber}`
              : "Dine-in"}
        </span>
        <div className="flex items-center gap-2.5">
          <span className="num text-xs font-bold text-ink">{money(order.total)}</span>
          <button
            type="button"
            onClick={() => onReorder(order.lines)}
            className="rounded-full bg-nonveg px-3 py-1 text-xs font-semibold text-white transition active:scale-95 hover:brightness-110"
          >
            Reorder all
          </button>
        </div>
      </div>
    </li>
  );
}

function CheckoutVisitCard({
  visit,
  language,
  onReorder,
}: {
  visit: CheckoutVisit;
  language: string;
  onReorder: (lines: CartLine[]) => void;
}) {
  return (
    <li className="overflow-hidden rounded-2xl border border-line border-l-4 border-l-veg bg-surface shadow-xs transition-all">
      {/* Green Header Badge Strip */}
      <div className="flex items-center justify-between border-b border-line/60 bg-veg/10 px-4 py-1.5 text-[0.6875rem] font-semibold text-veg">
        <span>PAST CHECKOUT</span>
        <span>COMPLETED</span>
      </div>

      {/* Date & Tickets Row */}
      <div className="flex items-center gap-2 border-b border-line/80 px-4 py-2.5">
        <span className="text-xs font-semibold text-ink-2">
          {when(visit.checkedOutAt)}
        </span>
        {visit.ticketCodes && visit.ticketCodes.length > 0 ? (
          <span className="num rounded-md bg-surface-2 px-2 py-0.5 text-[0.6875rem] font-medium text-ink-3">
            {visit.ticketCodes.join(", ")}
          </span>
        ) : null}
        <span className="ml-auto text-xs text-ink-3">
          {visit.mode === "pickup" ? "Collected" : visit.tableNumber ? `Table ${visit.tableNumber}` : "Dine-in"}
        </span>
      </div>

      {/* All Ordered Items in this Checkout */}
      <ul className="flex flex-col divide-y divide-line/60">
        {visit.lines.map((line, idx) => (
          <li key={line.lineId || idx} className="flex items-center gap-2 px-4 py-2.5">
            <DietMark diet={line.diet} className="shrink-0" />
            <span className="min-w-0 flex-1 truncate text-xs text-ink">
              <span className="font-medium text-ink-2">{line.qty} × </span>
              {line.name}
            </span>
            <span className="num shrink-0 text-xs font-medium text-ink">
              {money(line.qty * line.unitPrice)}
            </span>
            <button
              type="button"
              onClick={() => onReorder([line])}
              className="ml-1.5 shrink-0 rounded-full border border-nonveg/40 px-2 py-0.5 text-[0.625rem] font-semibold text-nonveg transition active:scale-95 hover:bg-nonveg/10"
            >
              Reorder
            </button>
          </li>
        ))}
      </ul>

      {/* Checkout Total Footer */}
      <div className="flex items-center justify-between border-t border-line/80 bg-surface-2/30 px-4 py-2.5">
        <span className="num text-xs font-bold text-ink">Total {money(visit.total)}</span>
        <button
          type="button"
          onClick={() => onReorder(visit.lines)}
          className="rounded-full bg-nonveg px-3.5 py-1 text-xs font-semibold text-white transition active:scale-95 hover:brightness-110"
        >
          Reorder all
        </button>
      </div>
    </li>
  );
}

function EmptyOrders({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <span aria-hidden="true" className="text-3xl">🧾</span>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="max-w-[16rem] text-sm text-ink-2">{description}</p>
    </div>
  );
}
