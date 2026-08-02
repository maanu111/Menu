import type { MenuItem } from "@/lib/types";
import { clsx } from "@/lib/format";

/**
 * Stands in for the dish photo until the kitchen supplies real images.
 * Each dish gets its own two-stop gradient so the grid never looks uniform.
 */
export function Plate({
  item,
  className,
}: {
  item: MenuItem;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-2xl",
        className,
      )}
      style={{
        backgroundImage: `radial-gradient(120% 120% at 30% 20%, ${item.swatch[0]}, ${item.swatch[1]})`,
      }}
    >
      <span className="text-3xl drop-shadow-sm select-none sm:text-4xl">
        {item.glyph}
      </span>
      <span className="absolute inset-0 rounded-2xl ring-1 ring-black/10 ring-inset" />
    </div>
  );
}
