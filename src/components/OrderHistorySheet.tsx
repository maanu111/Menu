"use client";

import { Sheet } from "./Sheet";
import { DietMark } from "./DietMark";
import { useToast } from "./Toaster";
import { useCart } from "@/lib/cart-store";
import { clsx, money } from "@/lib/format";
import { t, stageText, type UIStrings } from "@/lib/ui-translations";
import type { CartLine } from "@/lib/types";

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
                  isActive && "border-accent bg-accent text-accent-ink font-bold",
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
                    ? "text-accent font-semibold"
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

/**
 * Everything this phone has ordered here, newest first, with a way to order
 * any of it again. Kept in the device's own storage — no account, nothing to
 * sign into, and it survives closing the tab.
 */
export function OrderHistorySheet({
  open,
  onClose,
  language = "en",
}: {
  open: boolean;
  onClose: () => void;
  language?: string;
}) {
  const { state, reorderDirect } = useCart();
  const notify = useToast();

  async function again(lines: CartLine[], what: string) {
    const res = await reorderDirect(lines);
    if (res.ok) {
      notify(`Order ${res.code} sent to kitchen`, "good");
    } else {
      notify(res.message);
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t("yourPastOrders", language)}
      description={
        state.history.length === 0
          ? "Nothing yet."
          : "Kept on this phone. Tap Reorder to have it again."
      }
    >
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
                          : "bg-accent-soft text-accent",
                      )}
                    >
                      {stageText(order.stage, language)}
                    </span>
                  ) : null}
                  <span className="text-xs text-ink-3">{when(order.placedAt)}</span>
                  <button
                    type="button"
                    onClick={() => again(order.lines, "Everything")}
                    className="ml-auto shrink-0 rounded-full bg-accent px-3 py-1.5 text-[0.6875rem] font-semibold text-accent-ink transition active:scale-95 hover:brightness-110"
                  >
                    Reorder all
                  </button>
                </div>

                {/* Live order status progress bar */}
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
                        onClick={() => again([line], line.name)}
                        className="shrink-0 rounded-full border border-accent px-2.5 py-1 text-[0.625rem] font-semibold text-accent transition active:scale-95 hover:bg-accent-soft"
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
    </Sheet>
  );
}
