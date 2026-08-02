import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { MenuShell } from "@/components/MenuShell";
import { ToastProvider } from "@/components/Toaster";
import { CartProvider } from "@/lib/cart-store";
import {
  categories,
  menuItems,
  restaurant,
  table,
  tableUrl,
} from "@/lib/mock-data";

/**
 * Renders the QR that puts everyone else at the table on this same menu.
 * Colours are stripped so the code inherits whichever surface it sits on.
 */
async function tableQr(url: string) {
  const svg = await QRCode.toString(url, {
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

export default async function TableMenuPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;

  /* A printed QR must resolve to a real table or show nothing at all. */
  if (slug !== restaurant.slug || token.toUpperCase() !== table.token) {
    notFound();
  }

  /* Stands in for the menu query — remove once Supabase is wired up. */
  await new Promise((resolve) => setTimeout(resolve, 450));

  const url = tableUrl(restaurant.slug, table.token);
  const qrSvg = await tableQr(url);

  return (
    <ToastProvider>
      <CartProvider storageKey={`kt-cart-${slug}-${token}`}>
        <MenuShell
          restaurant={restaurant}
          table={table}
          categories={categories}
          items={menuItems}
          qrSvg={qrSvg}
          qrUrl={url}
        />
      </CartProvider>
    </ToastProvider>
  );
}
