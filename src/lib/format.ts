/** Indian grouping (1,20,500) — the format guests actually read on a bill. */
const inr = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

export function money(paise: number) {
  return `₹${inr.format(Math.round(paise))}`;
}

export function orderCode(seed: number) {
  return `KT-${String(seed % 10000).padStart(4, "0")}`;
}

export function clsx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}
