import { NextResponse, type NextRequest } from "next/server";

/**
 * Every restaurant gets its own subdomain: kesar-tandoor.tablet.app/t/A7X29K.
 *
 * The subdomain is rewritten onto /r/<slug>/t/<token>, and because the slug
 * comes from the host rather than the path, a code printed for one restaurant
 * can never resolve on another's subdomain — the page's own lookup then checks
 * that the token really belongs to that slug and 404s if it doesn't.
 */

/* Hosts that are the platform itself, not a tenant. */
const RESERVED = new Set([
  "www",
  "app",
  "admin",
  "api",
  "dashboard",
  "menu",
  "localhost",
]);

function subdomainOf(host: string) {
  const lower = host.toLowerCase();

  /* IPv6 arrives bracketed — [::1]:3003 — and has no subdomain to read. */
  if (lower.startsWith("[")) return null;

  const name = lower.split(":")[0];

  /* Local development: kesar-tandoor.localhost:3003 works in every browser. */
  if (name.endsWith(".localhost")) {
    const label = name.slice(0, -".localhost".length);
    return RESERVED.has(label) ? null : label;
  }

  /* An IPv4 address has dots but no subdomain: 127.0.0.1 must not read as the
     restaurant "127". Health checks and LAN testing both arrive this way. */
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(name)) return null;

  /* Only the configured domain carries tenants. Without this, any host with
     three parts looks like one — a preview URL such as
     menu-eight-lime.vercel.app would be read as the restaurant
     "menu-eight-lime" and every page would 404. When no domain is configured
     the app is reached by path (/r/<slug>) and there are no subdomains at
     all, which is exactly how a demo deployment runs. */
  const apex = process.env.NEXT_PUBLIC_GUEST_HOST?.trim().toLowerCase();
  if (!apex) return null;
  if (!name.endsWith(`.${apex}`)) return null;

  const label = name.slice(0, -(apex.length + 1));
  /* Only a single label in front of the domain is a tenant. */
  if (!label || label.includes(".")) return null;
  if (RESERVED.has(label)) return null;
  return label;
}

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
