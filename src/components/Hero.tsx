const sampleTranscript = [
  {
    speaker: "Sadaa",
    role: "receptionist",
    text: "Hello, thanks for calling. How can I help you today?",
  },
  {
    speaker: "Caller",
    role: "caller",
    text: "Hi, could I book an appointment for Thursday afternoon?",
  },
  {
    speaker: "Sadaa",
    role: "receptionist",
    text: "Confirmed for Thursday at 2:00 PM. Anything else I can help with?",
  },
] as const;

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16"
    >
      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-7">
          <h1
            id="hero-heading"
            className="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl"
          >
            Never miss another customer call again.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            Sadaa answers calls, books appointments, and takes messages for
            local businesses.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#live-demo"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-accent px-6 py-3.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90"
            >
              Try the live demo
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md border border-ink/25 bg-transparent px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-ink hover:bg-ink/5"
            >
              See how it works
            </a>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-5">
          <div
            aria-label="Live demo, sample call"
            className="mx-auto max-w-sm rounded-[2rem] border-2 border-ink bg-paper p-5 shadow-sm"
          >
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-ink/15" />

            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <span className="text-xs font-semibold text-muted">
                Live demo, sample call
              </span>
              <span className="inline-flex items-center gap-2 text-xs font-medium text-ink">
                <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
                </span>
                Listening
              </span>
            </div>

            <ol className="mt-4 divide-y divide-ink/10">
              {sampleTranscript.map((entry, index) => (
                <li key={index} className="py-3.5 first:pt-1 last:pb-1">
                  <p className="text-xs font-semibold text-muted">
                    {entry.speaker}
                  </p>
                  <p
                    className={`mt-1 text-sm leading-relaxed ${
                      entry.role === "receptionist"
                        ? "font-medium text-ink"
                        : "text-muted"
                    }`}
                  >
                    {entry.text}
                  </p>
                </li>
              ))}
            </ol>

            <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3 text-xs text-muted">
              <span>Sample transcript</span>
              <span className="font-medium text-ink">Demo mode</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
