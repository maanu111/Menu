"use client";

import { Sheet } from "./Sheet";
import { DietMark } from "./DietMark";
import { useToast } from "./Toaster";
import { useCart } from "@/lib/cart-store";
import { money } from "@/lib/format";
import { t } from "@/lib/ui-translations";
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

  async function handleReorder(lines: CartLine[]) {
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
          {state.history.map((visit) => (
            <li
              key={visit.id}
              className="overflow-hidden rounded-2xl border border-line border-l-4 border-l-veg bg-surface shadow-xs"
            >
              <div className="flex items-center justify-between border-b border-line/60 bg-veg/10 px-4 py-1.5 text-[0.6875rem] font-semibold text-veg">
                <span>PAST CHECKOUT</span>
                <span>COMPLETED</span>
              </div>
              <div className="flex items-center gap-2 border-b border-line/80 px-4 py-2.5">
                <span className="text-xs font-semibold text-ink-2">
                  {when(visit.checkedOutAt)}
                </span>
                {visit.ticketCodes && visit.ticketCodes.length > 0 ? (
                  <span className="num rounded-md bg-surface-2 px-2 py-0.5 text-[0.6875rem] font-medium text-ink-3">
                    {visit.ticketCodes.join(", ")}
                  </span>
                ) : null}
              </div>
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
                      onClick={() => handleReorder([line])}
                      className="ml-1.5 shrink-0 rounded-full border border-nonveg/40 px-2 py-0.5 text-[0.625rem] font-semibold text-nonveg transition active:scale-95 hover:bg-nonveg/10"
                    >
                      Reorder
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-line/80 bg-surface-2/30 px-4 py-2.5">
                <span className="num text-xs font-bold text-ink">Total {money(visit.total)}</span>
                <button
                  type="button"
                  onClick={() => handleReorder(visit.lines)}
                  className="rounded-full bg-nonveg px-3.5 py-1 text-xs font-semibold text-white transition active:scale-95 hover:brightness-110"
                >
                  Reorder all
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
