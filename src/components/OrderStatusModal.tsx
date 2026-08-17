"use client";

import { useEffect, useState } from "react";
import { Sheet } from "./Sheet";
import { AddOnsRail } from "./AddOnsRail";
import { DetailsCard } from "./DetailsCard";
import { DietMark } from "./DietMark";
import { useToast } from "./Toaster";
import { useCart } from "@/lib/cart-store";
import { clsx, money } from "@/lib/format";
import { t, stageText, type UIStrings } from "@/lib/ui-translations";
import type { CartLine, MenuItem, OrderStage } from "@/lib/types";

function when(at: number) {
  const d = new Date(at);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) {
    return `Today, ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STEPS: { id: OrderStage; labelKey: keyof UIStrings; hint: string }[] = [
  { id: "placed", labelKey: "sentToKitchen", hint: "Ticket printed" },
  { id: "preparing", labelKey: "cooking", hint: "On the fire now" },
  { id: "ready", labelKey: "ready", hint: "Coming to your table" },
  { id: "served", labelKey: "served", hint: "Enjoy your meal" },
];

const TRACK_STEPS = [
  { id: "placed", key: "sentToKitchen" },
  { id: "preparing", key: "cooking" },
  { id: "ready", key: "ready" },
  { id: "served", key: "served" },
] as const;

function OrderStatusProgressBar({
  stage,
  language,
}: {
  stage?: string;
  language: string;
}) {
  if (!stage) return null;
  const activeStage = stage === "accepted" ? "placed" : stage;
  const currentIndex = Math.max(0, TRACK_STEPS.findIndex((s) => s.id === activeStage));

  return (
    <div className="border-b border-line bg-surface-2/60 px-3 py-3">
      <div className="flex items-start justify-between">
        {TRACK_STEPS.map((step, i) => {
          const isDone = i < currentIndex;
          const isActive = i === currentIndex;
          return (
            <div
              key={step.id}
              className="relative flex flex-1 flex-col items-center text-center"
            >
              {/* Connecting line */}
              {i < TRACK_STEPS.length - 1 ? (
                <div
                  className={clsx(
                    "absolute top-2.5 left-[50%] right-[-50%] h-0.5 z-0 transition",
                    isDone ? "bg-veg" : "bg-line",
                  )}
                />
              ) : null}

              {/* Circle dot */}
              <div
                className={clsx(
                  "relative z-10 grid size-5 place-items-center rounded-full border-2 text-[0.625rem] transition",
                  isDone && "border-veg bg-veg text-white",
                  isActive && "border-nonveg bg-nonveg text-white font-bold",
                  !isDone && !isActive && "border-line bg-surface text-ink-3",
                )}
              >
                {isDone ? (
                  <svg viewBox="0 0 12 12" className="size-2.5" fill="none">
                    <path
                      d="M2.5 6.2l2.3 2.3L9.5 3.8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={clsx(
                  "mt-1 text-[0.625rem] font-medium leading-tight px-0.5",
                  isActive
                    ? "text-nonveg font-semibold"
                    : isDone
                      ? "text-ink-2"
                      : "text-ink-3",
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
  items,
  slug,
  token,
  language = "en",
}: {
  open: boolean;
  onClose: () => void;
  initialTab?: "status" | "history";
  items: MenuItem[];
  slug: string;
  token: string | null;
  language?: string;
}) {
  const { state, reorderDirect, resetOrder } = useCart();
  const notify = useToast();
  const [tab, setTab] = useState<"status" | "history">(initialTab);
  const [checkingOut, setCheckingOut] = useState(false);

  /* Synchronize tab when initialTab changes or when order gets served */
  useEffect(() => {
    if (open) {
      if (state.stage === "served" || !state.stage) {
        setTab("history");
      } else {
        setTab(initialTab);
      }
    }
  }, [open, initialTab, state.stage]);

  async function handleReorder(lines: CartLine[]) {
    const res = await reorderDirect(lines);
    if (res.ok) {
      notify(`Order ${res.code} sent to kitchen`, "good");
    } else {
      notify(res.message);
    }
  }

  const activeStage = state.stage === "accepted" ? "placed" : state.stage;
  const current = Math.max(0, STEPS.findIndex((s) => s.id === activeStage));
  const total = state.placedLines.reduce((n, l) => n + l.qty * l.unitPrice, 0);

  /* Header Title: Order status (Left) | Order history (Very Right) */
  const headerTitle = (
    <div className="flex items-center justify-between w-full pr-2 -mb-1">
      <button
        type="button"
        onClick={() => setTab("status")}
        className={clsx(
          "relative pb-2.5 text-base font-semibold transition",
          tab === "status" ? "text-ink" : "text-ink-3 hover:text-ink-2",
        )}
      >
        {t("orderStatus", language)}
        {tab === "status" ? (
          <span className="absolute bottom-0 inset-x-0 h-0.5 bg-nonveg rounded-full" />
        ) : null}
      </button>

      <button
        type="button"
        onClick={() => setTab("history")}
        className={clsx(
          "relative pb-2.5 text-base font-semibold transition ml-auto pr-2",
          tab === "history" ? "text-ink" : "text-ink-3 hover:text-ink-2",
        )}
      >
        {t("yourPastOrders", language)}
        {tab === "history" ? (
          <span className="absolute bottom-0 inset-x-0 h-0.5 bg-nonveg rounded-full" />
        ) : null}
      </button>
    </div>
  );

  /* Floating Sticky Checkout Footer */
  const floatingCheckoutFooter =
    token &&
    ((tab === "status" && state.stage && state.stage !== "served") ||
      (tab === "history" && state.history.length > 0)) ? (
      <button
        type="button"
        disabled={checkingOut}
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
        className="h-12 w-full rounded-full bg-nonveg text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60 shadow-lg"
      >
        {checkingOut ? "The counter knows" : "Checkout"}
      </button>
    ) : null;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={headerTitle}
      footer={floatingCheckoutFooter}
    >
      {tab === "status" && state.stage && state.stage !== "served" ? (
        <div className="flex flex-col gap-4">
          {/* Active order card matching client screenshot */}
          <div
            className="overflow-hidden rounded-2xl border border-line bg-surface"
            style={{ boxShadow: "var(--shadow)" }}
          >
            {/* Order header row */}
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div className="min-w-0">
                <p className="eyebrow text-ink-3 text-[0.6875rem] uppercase tracking-wider font-semibold">ORDER</p>
                <p className="num text-xl font-bold text-ink">{state.orderId}</p>
              </div>
              <span className="rounded-full bg-nonveg/10 px-3 py-1 text-xs font-semibold text-nonveg">
                {t(STEPS[current]?.labelKey ?? "sentToKitchen", language)}
              </span>
            </div>

            {/* Timeline steps */}
            <ol className="flex flex-col px-5 py-4">
              {STEPS.map((step, i) => {
                const done = i < current;
                const active = i === current;
                return (
                  <li key={step.id} className="flex gap-3.5">
                    <div className="flex flex-col items-center">
                      <span
                        aria-hidden="true"
                        className={clsx(
                          "grid size-5 shrink-0 place-items-center rounded-full border-2 transition",
                          done && "border-veg bg-veg text-white",
                          active && "border-nonveg bg-nonveg text-white",
                          !done && !active && "border-line bg-surface text-transparent",
                        )}
                      >
                        {done ? (
                          <svg viewBox="0 0 12 12" className="size-2.5" fill="none">
                            <path
                              d="M2.5 6.2l2.3 2.3L9.5 3.8"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : active ? (
                          <span className="size-1.5 rounded-full bg-white" />
                        ) : null}
                      </span>
                      {i < STEPS.length - 1 ? (
                        <span
                          aria-hidden="true"
                          className={clsx(
                            "w-0.5 flex-1 transition my-0.5",
                            done ? "bg-veg" : "bg-line",
                          )}
                        />
                      ) : null}
                    </div>

                    <div className={clsx("pb-4", i === STEPS.length - 1 && "pb-0")}>
                      <p
                        className={clsx(
                          "text-sm leading-5 font-semibold",
                          active ? "text-ink" : done ? "text-ink-2" : "text-ink-3 font-normal",
                        )}
                      >
                        {t(step.labelKey, language)}
                      </p>
                      {active ? (
                        <p className="mt-0.5 text-xs text-ink-3">{step.hint}</p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Ordered items */}
            <div className="border-t border-line px-5 py-4">
              <ul className="flex flex-col gap-2.5">
                {state.placedLines.map((line) => (
                  <li key={line.lineId} className="flex items-center gap-2.5 text-sm">
                    <span className="min-w-0 flex-1 truncate text-ink">
                      <span className="num font-medium text-ink-2">{line.qty} × </span>
                      {line.name}
                    </span>
                    <span className="num shrink-0 font-semibold text-ink">
                      {money(line.qty * line.unitPrice)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleReorder([line])}
                      className="shrink-0 rounded-full border border-nonveg px-3 py-1 text-xs font-semibold text-nonveg transition active:scale-95 hover:bg-nonveg/10"
                    >
                      Reorder
                    </button>
                  </li>
                ))}
              </ul>

              {/* Total box */}
              <div className="mt-4 flex items-center justify-between rounded-xl bg-surface-2 px-4 py-3">
                <span className="text-sm font-semibold text-ink">Total</span>
                <span className="num text-base font-bold text-ink">
                  {money(total)}
                </span>
              </div>
              <p className="num mt-2 text-xs text-ink-3">
                {state.guests} {state.guests === 1 ? "guest" : "guests"} · pay at the counter
              </p>
            </div>
          </div>

          {/* Bottom section: Anything else? */}
          <div className="mt-2 flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-bold text-ink">Anything else?</h3>
              <span className="text-xs text-ink-3">Goes on the same bill</span>
            </div>
            <AddOnsRail items={items} />
            <DetailsCard />
          </div>
        </div>
      ) : (
        /* History tab */
        <div className="flex flex-col gap-4">
          {state.history.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <span aria-hidden="true" className="text-3xl">
                🧾
              </span>
              <p className="text-sm font-semibold text-ink">No orders yet</p>
              <p className="max-w-[15rem] text-sm text-ink-2">
                Once you order, it stays here on your phone so you can have the
                same again next time.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {state.history.map((order) => {
                const isReadyOrServed =
                  order.stage === "ready" || order.stage === "served";
                return (
                  <li
                    key={order.code + order.placedAt}
                    className="overflow-hidden rounded-xl border border-line bg-surface"
                  >
                    <div className="flex flex-wrap items-center gap-2 border-b border-line px-3.5 py-2.5">
                      <span className="num text-sm font-semibold text-ink">
                        {order.code}
                      </span>
                      {order.stage ? (
                        <span
                          className={clsx(
                            "rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold",
                            isReadyOrServed
                              ? "bg-veg/12 text-veg"
                              : "bg-nonveg/10 text-nonveg",
                          )}
                        >
                          {stageText(order.stage, language)}
                        </span>
                      ) : null}
                      <span className="text-xs text-ink-3">{when(order.placedAt)}</span>
                      <button
                        type="button"
                        onClick={() => handleReorder(order.lines)}
                        className="ml-auto shrink-0 rounded-full bg-nonveg px-3 py-1.5 text-[0.6875rem] font-semibold text-white transition active:scale-95 hover:brightness-110"
                      >
                        Reorder all
                      </button>
                    </div>

                    {/* Horizontal 4-step progress bar */}
                    <OrderStatusProgressBar stage={order.stage} language={language} />

                    <ul className="flex flex-col divide-y divide-line">
                      {order.lines.map((line) => (
                        <li
                          key={line.lineId}
                          className="flex items-center gap-2.5 px-3.5 py-2.5"
                        >
                          <DietMark diet={line.diet} className="mt-0.5 shrink-0" />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[0.8125rem] leading-snug text-ink">
                              {line.name}
                            </span>
                            {line.optionLabels.length > 0 ? (
                              <span className="block text-[0.6875rem] text-ink-3">
                                {line.optionLabels.join(" · ")}
                              </span>
                            ) : null}
                          </span>
                          <span className="num shrink-0 text-xs text-ink-3">
                            {line.qty}×
                          </span>
                          <span className="num w-16 shrink-0 text-right text-[0.8125rem] text-ink">
                            {money(line.qty * line.unitPrice)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleReorder([line])}
                            className="shrink-0 rounded-full border border-nonveg px-2.5 py-1 text-[0.625rem] font-semibold text-nonveg transition active:scale-95 hover:bg-nonveg/10"
                          >
                            Reorder
                          </button>
                        </li>
                      ))}
                    </ul>

                    <p className="flex items-baseline justify-between border-t border-line px-3.5 py-2.5">
                      <span className="text-xs text-ink-2">
                        {order.mode === "pickup"
                          ? "Collected"
                          : order.tableNumber
                            ? `Table ${order.tableNumber}`
                            : "Dine-in"}
                      </span>
                      <span className="num text-sm font-semibold text-ink">
                        {money(order.total)}
                      </span>
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </Sheet>
  );
}
