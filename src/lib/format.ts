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

export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  if (url.startsWith("/uploads/")) {
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      return `http://localhost:3002${url}`;
    }
    const adminUrl =
      process.env.NEXT_PUBLIC_ADMIN_URL || "https://quantive-labs.com";
    return `${adminUrl}${url}`;
  }
  return url;
}
