import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { MenuShell } from "@/components/MenuShell";
import { ScanLogger } from "@/components/ScanLogger";
import { ToastProvider } from "@/components/Toaster";
import { CartProvider } from "@/lib/cart-store";
import { getTableMenu, offeredLanguages } from "@/lib/menu-queries";
import { qrSvg, tableUrl } from "@/lib/qr";
import { brandStyle } from "@/lib/brand";
import { pickLanguage } from "@/lib/pick-language";

export const dynamic = "force-dynamic";

/* The tab, and anything the guest shares, must name their restaurant — not
   whichever one the platform's default title happens to mention. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;
  const menu = await getTableMenu(slug, token);
  if (!menu) return { title: "Table menu" };
  return {
    title: `${menu.restaurant.name} · Table ${menu.table.number}`,
    description:
      menu.restaurant.tagline ||
      `Browse the menu and order from your table at ${menu.restaurant.name}.`,
  };
}

export default async function TableMenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; token: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug, token } = await params;
  const { lang } = await searchParams;

  /* A printed QR must resolve to a real, open table or show nothing at all. */
  const offered = await offeredLanguages(slug);
  const chosen = pickLanguage(lang, (await headers()).get("accept-language"), offered);
  const menu = await getTableMenu(slug, token, chosen);
  if (!menu) notFound();

  const url = tableUrl(menu.restaurant.slug, menu.table.token);

  return (
    <ToastProvider>
      {/* The owner's accent, scoped to this restaurant's page only. Values are
          validated in brandStyle before they reach the stylesheet. */}
      <style>{`.brand-scope{${brandStyle(menu.restaurant.brandColor)}}`}</style>
      <CartProvider
        storageKey={`kt-cart-${slug}-${token}`}
        slug={slug}
        token={token}
      >
        <ScanLogger slug={slug} token={token} />
        <div className="brand-scope contents">
        <MenuShell
          restaurant={menu.restaurant}
          table={menu.table}
          tables={menu.tables}
          banners={menu.banners}
          categories={menu.categories}
          items={menu.items}
          qrSvg={await qrSvg(url)}
          qrUrl={url}
          language={chosen}
        />
        </div>
      </CartProvider>
    </ToastProvider>
  );
}
