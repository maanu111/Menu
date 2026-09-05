import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { MenuShell } from "@/components/MenuShell";
import { ScanLogger } from "@/components/ScanLogger";
import { ToastProvider } from "@/components/Toaster";
import { CartProvider } from "@/lib/cart-store";
import { getTableMenu } from "@/lib/menu-queries";
import { qrSvg, tableUrl } from "@/lib/qr";
import { brandStyle } from "@/lib/brand";
import { pickLanguage } from "@/lib/pick-language";
import { resolveMediaUrl } from "@/lib/format";

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
  if (!menu) return { title: "Menu" };
  const logoUrl = resolveMediaUrl(menu.restaurant.logoSrc) || "/kt.jpeg";

  return {
    title: `${menu.restaurant.name} · Table ${menu.table.number}`,
    description:
      menu.restaurant.tagline ||
      `Browse the menu and order from your table at ${menu.restaurant.name}.`,
    /* Installs as the restaurant, and opens on the restaurant's own menu —
       whoever installs from table 5 today is somewhere else tomorrow. */
    manifest: `/r/${slug}/manifest.webmanifest`,
    appleWebApp: {
      capable: true,
      title: menu.restaurant.name,
      statusBarStyle: "default" as const,
    },
    icons: {
      icon: [
        { url: logoUrl, type: "image/jpeg" },
        { url: "/favicon.ico" },
      ],
      apple: logoUrl,
    },
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
  const chosen = pickLanguage(lang, (await headers()).get("accept-language"));
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
        tableNumber={menu.table.number}
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
