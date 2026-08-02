"use client";

import { useState } from "react";
import { DietMark } from "./DietMark";
import { DishImage } from "./DishImage";
import { Sheet } from "./Sheet";
import { useToast } from "./Toaster";
import { useCart } from "@/lib/cart-store";
import { clsx, money } from "@/lib/format";
import type { MenuItem } from "@/lib/types";

function SpiceMeter({ level }: { level: number }) {
  return (
    <span className="flex items-center gap-0.5" title={`Spice ${level} of 3`}>
      <span className="sr-only">Spice level {level} of 3</span>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          aria-hidden="true"
          className={clsx(
            "h-0.5 w-2 rounded-full",
            n <= level ? "bg-nonveg" : "bg-line",
          )}
        />
      ))}
    </span>
  );
}

/**
 * Every variant is the same pill, anchored to the bottom of the photo column
 * so Add, the stepper and Sold out all land on exactly the same baseline.
 */
const CONTROL =
  "h-8 w-19 rounded-full text-[0.8125rem] font-semibold shadow-[0_1px_6px_rgb(0_0_0/0.10)] ring-2 ring-surface transition active:scale-95";

function Stepper({
  qty,
  onInc,
  onDec,
  label,
}: {
  qty: number;
  onInc: () => void;
  onDec: () => void;
  label: string;
}) {
  return (
    <div
      className={clsx(
        CONTROL,
        "flex items-center justify-between border border-accent bg-accent-soft px-0.5",
      )}
    >
      <button
        type="button"
        onClick={onDec}
        aria-label={`Remove one ${label}`}
        className="grid size-7 place-items-center rounded-full text-accent active:scale-90"
      >
        <svg viewBox="0 0 16 16" className="size-3" aria-hidden="true">
          <path d="M3 8h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </button>
      <span aria-live="polite" className="num text-accent">
        {qty}
      </span>
      <button
        type="button"
        onClick={onInc}
        aria-label={`Add one more ${label}`}
        className="grid size-7 place-items-center rounded-full text-accent active:scale-90"
      >
        <svg viewBox="0 0 16 16" className="size-3" aria-hidden="true">
          <path
            d="M8 3v10M3 8h10"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

export function MenuItemCard({
  item,
  priority = false,
}: {
  item: MenuItem;
  priority?: boolean;
}) {
  const { add, inc, dec, qtyOf, state } = useCart();
  const notify = useToast();
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [choice, setChoice] = useState<Record<string, string>>(() =>
    Object.fromEntries((item.options ?? []).map((g) => [g.id, g.choices[0].id])),
  );

  const qty = qtyOf(item.id);
  const hasOptions = (item.options ?? []).length > 0;
  const line = state.lines.find((l) => l.lineId === item.id);

  const optionDelta = (item.options ?? []).reduce((sum, group) => {
    const picked = group.choices.find((c) => c.id === choice[group.id]);
    return sum + (picked?.priceDelta ?? 0);
  }, 0);

  return (
    <>
      <article
        className={clsx(
          "flex gap-3 border-b border-line px-4 py-3 last:border-b-0 sm:px-6",
          !item.available && "opacity-55",
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-1.5">
            <DietMark diet={item.diet} />
            {item.bestseller ? (
              <span className="eyebrow text-[0.5625rem] text-accent">Bestseller</span>
            ) : null}
            {item.spiceLevel ? <SpiceMeter level={item.spiceLevel} /> : null}
          </div>

          <h3 className="mt-1 text-sm leading-snug font-semibold text-ink">
            {item.name}
          </h3>

          <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-ink-2">
            {item.description}
          </p>

          <div className="mt-auto flex items-baseline gap-2 pt-2">
            <span className="num text-sm font-semibold text-ink">
              {money(item.price)}
            </span>
            <span aria-hidden="true" className="text-ink-3">
              ·
            </span>
            <span className="num text-[0.6875rem] text-ink-3">
              {item.prepMinutes} min
            </span>
          </div>
        </div>

        {/* pb-4 reserves exactly half the pill, so it straddles the photo edge. */}
        <div className="relative w-24 shrink-0 self-start pb-4">
          <DishImage
            item={item}
            className="aspect-square w-full"
            sizes="96px"
            priority={priority}
          />

          <div className="absolute inset-x-0 bottom-0 flex justify-center">
            {!item.available ? (
              <span
                className={clsx(
                  CONTROL,
                  "grid place-items-center border border-line bg-surface text-[0.6875rem] font-medium text-ink-3",
                )}
              >
                Sold out
              </span>
            ) : hasOptions ? (
              <button
                type="button"
                onClick={() => setOptionsOpen(true)}
                className={clsx(
                  CONTROL,
                  "inline-flex items-center justify-center gap-1 border border-accent bg-surface text-accent",
                )}
              >
                {qty > 0 ? `Add ${qty}` : "Add"}
                <svg
                  viewBox="0 0 12 12"
                  className="size-2.5"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 4.5L6 7.5l3-3"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : qty > 0 && line ? (
              <Stepper
                qty={qty}
                label={item.name}
                onInc={() => inc(line.lineId)}
                onDec={() => dec(line.lineId)}
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  add(item);
                  notify(`${item.name} added`, "good");
                }}
                className={clsx(
                  CONTROL,
                  "bg-accent text-accent-ink hover:brightness-110",
                )}
              >
                Add
              </button>
            )}
          </div>
        </div>
      </article>

      {hasOptions ? (
        <Sheet
          open={optionsOpen}
          onClose={() => setOptionsOpen(false)}
          title={item.name}
          size="compact"
          footer={
            <button
              type="button"
              onClick={() => {
                add(item, Object.values(choice));
                setOptionsOpen(false);
                notify(`${item.name} added`, "good");
              }}
              data-autofocus
              className="flex w-full items-center justify-between rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition hover:brightness-110 active:scale-[0.99]"
            >
              <span>Add to order</span>
              <span className="num">{money(item.price + optionDelta)}</span>
            </button>
          }
        >
          <div className="flex flex-col gap-5">
            {(item.options ?? []).map((group) => (
              <fieldset key={group.id}>
                <legend className="eyebrow mb-2 text-ink-3">{group.label}</legend>
                <div className="flex flex-col gap-1.5">
                  {group.choices.map((c) => {
                    const active = choice[group.id] === c.id;
                    return (
                      <label
                        key={c.id}
                        className={clsx(
                          "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 transition",
                          active
                            ? "border-accent bg-accent-soft"
                            : "border-line hover:bg-surface-2",
                        )}
                      >
                        <input
                          type="radio"
                          name={`${item.id}-${group.id}`}
                          value={c.id}
                          checked={active}
                          onChange={() =>
                            setChoice((prev) => ({ ...prev, [group.id]: c.id }))
                          }
                          className="sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className={clsx(
                            "grid size-4 place-items-center rounded-full border-[1.5px]",
                            active ? "border-accent" : "border-ink-3",
                          )}
                        >
                          {active ? (
                            <span className="size-1.5 rounded-full bg-accent" />
                          ) : null}
                        </span>
                        <span
                          className={clsx(
                            "flex-1 text-[0.8125rem] font-medium",
                            active ? "text-accent" : "text-ink",
                          )}
                        >
                          {c.label}
                        </span>
                        {c.priceDelta ? (
                          <span className="num text-xs text-ink-2">
                            +{money(c.priceDelta)}
                          </span>
                        ) : null}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        </Sheet>
      ) : null}
    </>
  );
}
