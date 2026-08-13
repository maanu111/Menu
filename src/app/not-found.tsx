export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-140 flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <h1 className="text-xl font-semibold tracking-tight text-balance text-ink">
        This code isn&rsquo;t linked to a table
      </h1>
      <p className="max-w-sm text-sm leading-relaxed text-ink-2">
        The sticker may have been replaced, or the table retired. Ask a server to
        point you at the right one.
      </p>
    </main>
  );
}
