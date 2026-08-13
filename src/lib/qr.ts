import "server-only";
import QRCode from "qrcode";

/** The URL a printed table QR resolves to — the restaurant's own subdomain. */
export function tableUrl(slug: string, token: string) {
  const host = process.env.NEXT_PUBLIC_GUEST_HOST;
  if (host) return `https://${slug}.${host}/t/${token}`;

  const base = process.env.NEXT_PUBLIC_GUEST_URL ?? "https://tablet.app";
  try {
    const url = new URL(base);
    if (url.hostname === "localhost") {
      return `${url.protocol}//${slug}.localhost:${url.port || "3003"}/t/${token}`;
    }
    return `${url.origin}/r/${slug}/t/${token}`;
  } catch {
    return `${base.replace(/\/$/, "")}/r/${slug}/t/${token}`;
  }
}

/**
 * Inline SVG with colours stripped, so the code inherits whichever surface it
 * sits on — dark chip in the navbar, black on white in the share sheet.
 */
export async function qrSvg(value: string) {
  const svg = await QRCode.toString(value, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
  });
  return svg
    .replace(/<\?xml[^>]*\?>/, "")
    .replace(/\swidth="\d+"/, "")
    .replace(/\sheight="\d+"/, "")
    .replace(/#000000/gi, "currentColor")
    .replace(/fill="#ffffff"/gi, 'fill="none"')
    .trim();
}
