type Step = {
  number: string;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    number: "1",
    title: "Tell Sadaa about your business",
    description:
      "Share your opening hours, services, and how you want calls answered.",
  },
  {
    number: "2",
    title: "Point your calls at Sadaa",
    description:
      "Forward your existing business number or give callers your Sadaa number.",
  },
  {
    number: "3",
    title: "Sadaa answers and books",
    description:
      "Every call is answered, appointments are booked, and a short summary is sent to you after each call.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-t border-ink/10 bg-paper py-20 text-ink sm:py-28"
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-medium sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            Three straightforward steps to have your phone line answered without
            changing how you run your day.
          </p>
        </div>

        <ol className="mt-14 border-t border-ink/10">
          {steps.map((step) => (
            <li
              key={step.number}
              className="grid grid-cols-1 gap-4 border-b border-ink/10 py-8 sm:grid-cols-[5.5rem_1fr] sm:items-baseline sm:gap-10 sm:py-10"
            >
              <span
                aria-hidden="true"
                className="font-display text-5xl font-normal leading-none text-ink sm:text-6xl"
              >
                {step.number}
              </span>
              <div>
                <h3 className="font-display text-xl font-medium text-ink sm:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
