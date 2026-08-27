import type { Metadata, Viewport } from "next";
import "./globals.css";

/* The fallback only shows on the platform's own hostname — each restaurant's
   pages set their own title below, so a guest sees their restaurant's name. */
export const metadata: Metadata = {
  title: "Table menu",
  description:
    "Scan, browse the menu, and order from your table without waiting for a server.",
  icons: {
    icon: [
      { url: "/logo.jpeg", type: "image/jpeg" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/logo.jpeg" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* The guest menu is light in every restaurant, so there is no theme to
       restore before paint. suppressHydrationWarning stays on <body> because
       browser extensions commonly add attributes there. */
    <html lang="en" className="h-full">
      <body suppressHydrationWarning className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
