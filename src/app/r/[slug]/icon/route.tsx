import { ImageResponse } from "next/og";
import { getRestaurantBrand } from "@/lib/brand-query";

export const dynamic = "force-dynamic";

/**
 * The home-screen icon, drawn per restaurant.
 *
 * Chrome will not offer to install without real PNG icons, and the uploaded
 * logos are SVGs of every shape and aspect, so this draws a square one instead:
 * the restaurant's initials on its own colour. It always exists, it is always
 * square, and it needs nothing uploaded.
 *
 * `pad` insets the letters for the maskable icon, where Android crops the
 * corners to whatever shape the launcher uses.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const brand = await getRestaurantBrand(slug);

  if (!brand) return new Response("Not found", { status: 404 });

  const url = new URL(request.url);
  const size = url.searchParams.get("size") === "192" ? 192 : 512;
  const padded = url.searchParams.get("pad") === "1";

  /* Two initials from two words, otherwise the first two letters. */
  const words = brand.name.trim().split(/\s+/).filter(Boolean);
  const initials = (
    words.length > 1 ? words[0][0] + words[1][0] : brand.name.slice(0, 2)
  ).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: brand.brandColor,
          color: "#ffffff",
          fontSize: padded ? size * 0.34 : size * 0.44,
          fontWeight: 700,
          letterSpacing: size * 0.01,
        }}
      >
        {initials}
      </div>
    ),
    {
      width: size,
      height: size,
      headers: { "Cache-Control": "public, max-age=86400" },
    },
  );
}
