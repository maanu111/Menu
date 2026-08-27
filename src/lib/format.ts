/** Japanese Yen (¥) grouping formatting. */
const jpy = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 0,
});

export function money(amount: number) {
  return `¥${jpy.format(Math.round(amount))}`;
}

export function orderCode(seed: number) {
  return `DQ-${String(seed % 10000).padStart(4, "0")}`;
}

export function clsx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}
