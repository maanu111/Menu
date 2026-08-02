import type { DietType } from "@/lib/types";
import { clsx } from "@/lib/format";

const LABEL: Record<DietType, string> = {
  veg: "Vegetarian",
  nonveg: "Non-vegetarian",
  egg: "Contains egg",
};

/**
 * The FSSAI-standard mark Indian diners look for first: a bordered square
 * with a filled dot. Kept in semantic colours, never the brand accent.
 */
export function DietMark({
  diet,
  className,
}: {
  diet: DietType;
  className?: string;
}) {
  const tone =
    diet === "veg"
      ? "text-veg"
      : diet === "egg"
        ? "text-accent"
        : "text-nonveg";

  return (
    <span
      title={LABEL[diet]}
      className={clsx(
        "grid size-4 shrink-0 place-items-center rounded-[3px] border-[1.5px] border-current",
        tone,
        className,
      )}
    >
      <span className="sr-only">{LABEL[diet]}</span>
      {diet === "nonveg" ? (
        <svg viewBox="0 0 10 10" className="size-2.5" aria-hidden="true">
          <path d="M5 1.6L8.6 8H1.4z" fill="currentColor" />
        </svg>
      ) : (
        <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      )}
    </span>
  );
}
