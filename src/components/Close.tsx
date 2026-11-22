export default function Close() {
  return (
    <section
      id="pricing"
      className="border-t border-ink/10 bg-paper py-20 text-ink sm:py-28"
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="rounded-xl border border-ink/10 bg-ink/5 p-8 sm:p-12">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-medium sm:text-4xl">
              Pricing
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
              Pricing is quoted per business because it depends on call volume
              and the number of lines, so there are no fixed plans yet.
            </p>
            <div className="mt-8">
              <a
                href="#live-demo"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-accent px-6 py-3 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
              >
                Try the live demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
