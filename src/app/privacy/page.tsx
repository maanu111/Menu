import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy policy and dining data protection.",
};

export default async function MenuPrivacyPage() {
  const page = await db.platformContent.findUnique({
    where: { slug: "privacy" },
  });

  const title = page?.title || "Privacy Policy";
  const content = page?.content || "Privacy policy is currently being updated.";

  return (
    <div className="min-h-dvh bg-ground px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
          >
            ← Back
          </Link>
          <span className="text-[0.6875rem] font-bold tracking-widest text-ink-3 uppercase">Legal</span>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 shadow-xs sm:p-8">
          <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{title}</h1>
          {page?.updatedAt ? (
            <p className="mt-1.5 text-xs text-ink-3">
              Last updated: {new Date(page.updatedAt).toLocaleDateString("en-US", { dateStyle: "long" })}
            </p>
          ) : null}

          <div className="mt-6 border-t border-line pt-6 text-sm leading-relaxed text-ink-2 whitespace-pre-wrap">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
