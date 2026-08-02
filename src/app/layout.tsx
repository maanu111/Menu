import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kesar Tandoor · Table menu",
  description:
    "Scan, browse the menu, and order from your table without waiting for a server.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

/* Applies the saved theme before first paint so the page never flashes. */
const themeScript = `(function(){try{var t=localStorage.getItem("kt-theme");if(t==="dark"||t==="light"){document.documentElement.dataset.theme=t}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /**
     * The script above stamps data-theme on <html> before React hydrates, so
     * this element's attributes legitimately differ from the server HTML.
     * suppressHydrationWarning covers this node's own attributes only —
     * every child is still hydration-checked normally.
     */
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
