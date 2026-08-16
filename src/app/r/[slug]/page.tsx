import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { MenuShell } from "@/components/MenuShell";
import { ToastProvider } from "@/components/Toaster";
import { CartProvider } from "@/lib/cart-store";
import { getRestaurantMenu } from "@/lib/menu-queries";
import { brandStyle } from "@/lib/brand";
import { pickLanguage } from "@/lib/pick-language";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const menu = await getRestaurantMenu(slug);
  if (!menu) return { title: "Menu" };
  return {
    title: `${menu.restaurant.name} · Menu`,
    description:
      menu.restaurant.tagline || `Order from ${menu.restaurant.name}.`,
    /* Makes the menu installable, as this restaurant rather than as a page. */
    manifest: `/r/${slug}/manifest.webmanifest`,
    appleWebApp: {
      capable: true,
      title: menu.restaurant.name,
      statusBarStyle: "default" as const,
    },
    icons: {
      apple: `/r/${slug}/icon?size=192`,
    },
  };
}

/**
 * What the restaurant's own code opens. That code goes up on tables, but also
 * on office and canteen noticeboards, so nothing here may assume the guest is
 * in the building — the menu loads and the opening popup asks whether they
 * are eating in or collecting.
 */
export default async function RestaurantMenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const { lang } = await searchParams;

  /* The phone says what its owner reads; an explicit tap overrides it. */
  const chosen = pickLanguage(lang, (await headers()).get("accept-language"));

  const menu = await getRestaurantMenu(slug, chosen);
  if (!menu) notFound();

  return (
    <ToastProvider>
      <style>{`.brand-scope{${brandStyle(menu.restaurant.brandColor)}}`}</style>
      <CartProvider storageKey={`kt-cart-${slug}`} slug={slug} token={null}>
        <div className="brand-scope contents">
          <MenuShell
            restaurant={menu.restaurant}
            table={null}
            tables={menu.tables}
            banners={menu.banners}
            categories={menu.categories}
            items={menu.items}
            qrSvg=""
            qrUrl=""
            language={chosen}
          />
        </div>
      </CartProvider>
    </ToastProvider>
  );
}
