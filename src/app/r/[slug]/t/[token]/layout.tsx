import { notFound } from "next/navigation";
import { getTableMenu } from "@/lib/menu-queries";

export const dynamic = "force-dynamic";

/**
 * Resolves the printed code before the page renders.
 *
 * The page below has a loading skeleton, which opens a Suspense boundary and
 * flushes the response head straight away — after that the status is already
 * on the wire and notFound() can only swap the body, leaving a dead QR
 * answering "200 OK". Checking here, outside that boundary, means an unknown,
 * rotated, closed or another restaurant's code gets a real 404.
 *
 * getTableMenu is cache()d, so the page reuses this result rather than asking
 * the database twice.
 */
export default async function TableLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;
  if (!(await getTableMenu(slug, token))) notFound();

  return children;
}
