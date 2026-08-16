import { NextResponse, type NextRequest } from "next/server";
import { subdomainOf } from "@/lib/tenant-host";

/**
 * Every restaurant gets its own subdomain: kesar-tandoor.tablet.app/t/A7X29K.
 *
 * The subdomain is rewritten onto /r/<slug>/t/<token>, and because the slug
 * comes from the host rather than the path, a code printed for one restaurant
 * can never resolve on another's subdomain — the page's own lookup then checks
 * that the token really belongs to that slug and 404s if it doesn't.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const slug = subdomainOf(request.headers.get("host") ?? "");

  if (!slug) return NextResponse.next();

  /* Already the canonical path — leave it alone. */
  if (pathname.startsWith("/r/")) return NextResponse.next();

  /* sub.domain/t/TOKEN  →  /r/<slug>/t/TOKEN */
  const table = pathname.match(/^\/t\/([A-Za-z0-9]+)\/?$/);
  if (table) {
    const url = request.nextUrl.clone();
    url.pathname = `/r/${slug}/t/${table[1]}`;
    return NextResponse.rewrite(url);
  }

  /* The bare subdomain is the restaurant's whole menu — the opening popup
     asks whether the guest is eating in or wants it delivered. */
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/r/${slug}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/t/:path*"],
};
