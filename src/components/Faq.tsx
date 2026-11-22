const faqs = [
  {
    question: "Does Sadaa answer real phone calls?",
    answer:
      "The browser demo on this page is live now — type or speak to Sadaa and watch it book an appointment. Real phone calls (Twilio) and WhatsApp replies are built and waiting on the phone number and WhatsApp accounts; they are not live yet.",
  },
  {
    question: "What happens after a call?",
    answer:
      "Sadaa writes a short summary of the call, books the appointment if the caller asked for one, and takes a message when no team member is available. Everything appears in the dashboard — calls with transcripts, appointments, and callers.",
  },
  {
    question: "Which businesses is Sadaa for?",
    answer:
      "Clinics, salons, restaurants, property dealers — any small business that misses calls while busy with customers. Sadaa answers with your own opening hours, services, and booking rules.",
  },
  {
    question: "Can Sadaa speak Urdu?",
    answer:
      "The demo understands common Roman-Urdu phrases — try 'salam' or 'timing kya hai' — and answers in Roman Urdu. Full Urdu support is part of the roadmap for Pakistani businesses.",
  },
  {
    question: "How is pricing decided?",
    answer:
      "Pricing is quoted per business because it depends on call volume and the number of lines, so there are no fixed plans yet. Request a quote and we will work out a number for your business.",
  },
];

export default function Faq() {
  return (
    <section
      id="faq"
      className="border-t border-ink/10 bg-paper py-20 text-ink sm:py-28"
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-medium sm:text-4xl">
            Questions, answered honestly
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            What Sadaa does today, what it does not do yet, and how it works
            for your business.
          </p>
        </div>

        <div className="mt-12 border-t border-ink/10">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group border-b border-ink/10 py-6"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-medium text-ink [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span
                  aria-hidden="true"
                  className="shrink-0 text-2xl font-normal text-muted transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
