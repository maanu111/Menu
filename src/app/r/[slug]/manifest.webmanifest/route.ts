import { NextResponse } from "next/server";
import { getRestaurantBrand } from "@/lib/brand-query";
import { subdomainOf } from "@/lib/tenant-host";

export const dynamic = "force-dynamic";

/**
 * What a phone reads when a guest installs the menu.
 *
 * One per restaurant, so it lands on the home screen as "Kesar Tandoor" in
 * Kesar Tandoor's colour rather than as a generic web page. start_url is the
 * restaurant's own menu, never a table's — a guest who installs while sitting
 * at table 5 is not at table 5 tomorrow, so the app opens the same way the
 * printed code on the counter does and asks where they are.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const brand = await getRestaurantBrand(slug);

  if (!brand) {
    return new NextResponse("Not found", { status: 404 });
  }

  /* A browser only offers to install when the page it is on sits inside the
     manifest's scope. On the restaurant's own subdomain the menu is at "/";
     reached by path it is at /r/<slug>. Declaring the wrong one leaves the
     button showing and the install silently refused. */
  const onOwnSubdomain =
    subdomainOf(request.headers.get("host") ?? "") === slug;
  const home = onOwnSubdomain ? "/" : `/r/${slug}`;

  /* What fits under a home-screen icon. Cutting to a word keeps a name a
     guest recognises — "Kesar Tandoor" becomes "Kesar", never "Kesar Tandoo". */
  const shortName =
    brand.name.length <= 12 ? brand.name : brand.name.trim().split(/\s+/)[0].slice(0, 12);

  return NextResponse.json(
    {
      name: brand.name,
      short_name: shortName,
      description: brand.tagline || `Order from ${brand.name}.`,
      start_url: home,
      scope: home,
      display: "standalone",
      orientation: "portrait",
      background_color: "#ffffff",
      theme_color: brand.brandColor,
      icons: [
        {
          src: `/r/${slug}/icon?size=192`,
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/r/${slug}/icon?size=512`,
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `/r/${slug}/icon?size=512&pad=1`,
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "public, max-age=300",
      },
    },
  );
}
