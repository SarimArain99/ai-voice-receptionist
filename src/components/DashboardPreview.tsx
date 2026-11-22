"use client";

import { Fragment, useEffect, useState } from "react";
import { DEMO_BUSINESS } from "@/lib/demo-engine";
import type { StoredDemoAppointment } from "@/components/LiveDemo";

type CallOutcome = "Appointment" | "Message" | "Info";

type SampleCall = {
  caller: string;
  time: string;
  outcome: CallOutcome;
  summary: string;
  transcript: { speaker: string; text: string }[];
};

type SampleAppointment = {
  name: string;
  service: string;
  time: string;
  status: "Confirmed";
};

const sampleCalls: SampleCall[] = [
  {
    caller: "Hannah",
    time: "09:12 today",
    outcome: "Appointment",
    summary: "Booked a routine check-up for this afternoon.",
    transcript: [
      {
        speaker: "Caller",
        text: "Hi, I'd like to book a routine check-up for Thursday afternoon.",
      },
      {
        speaker: "Sadaa",
        text: "Of course. Thursday at 2:00 PM works — shall I book that for you?",
      },
      { speaker: "Caller", text: "Yes, please." },
      {
        speaker: "Sadaa",
        text: "Confirmed for Thursday at 2:00 PM. Anything else I can help with?",
      },
    ],
  },
  {
    caller: "David",
    time: "10:05 today",
    outcome: "Message",
    summary: "Asked for a callback regarding a previous invoice.",
    transcript: [
      {
        speaker: "Caller",
        text: "Hi, it's David. I have a question about my last invoice.",
      },
      {
        speaker: "Sadaa",
        text: "No team member is on this line right now — shall I take a message for a callback?",
      },
      { speaker: "Caller", text: "Yes, please ask them to call me back." },
      {
        speaker: "Sadaa",
        text: "Noted. I will pass your message to the team.",
      },
    ],
  },
  {
    caller: "Priya",
    time: "11:28 today",
    outcome: "Info",
    summary: "Checked afternoon opening hours and parking details.",
    transcript: [
      {
        speaker: "Caller",
        text: "What time do you close today, and is there parking nearby?",
      },
      {
        speaker: "Sadaa",
        text: "We are open Monday to Saturday, 9:00 AM to 6:00 PM. There is street parking outside the clinic.",
      },
      { speaker: "Caller", text: "Perfect, thank you." },
    ],
  },
  {
    caller: "Tom",
    time: "13:40 today",
    outcome: "Appointment",
    summary: "Scheduled a new patient consultation for later today.",
    transcript: [
      {
        speaker: "Caller",
        text: "Hi, I need a new patient consultation sometime this week.",
      },
      {
        speaker: "Sadaa",
        text: "I can book that for you. Which day works best?",
      },
      { speaker: "Caller", text: "Today at 4:00 PM, if you have it." },
      {
        speaker: "Sadaa",
        text: "Booked — new patient consultation today at 4:00 PM.",
      },
    ],
  },
];

const sampleAppointments: SampleAppointment[] = [
  {
    name: "Hannah",
    service: "Check-up",
    time: "14:30 today",
    status: "Confirmed",
  },
  {
    name: "Samira",
    service: "Follow-up visit",
    time: "15:15 today",
    status: "Confirmed",
  },
  {
    name: "Tom",
    service: "New patient consultation",
    time: "16:00 today",
    status: "Confirmed",
  },
];

const STORAGE_KEY = "sadaa-demo-appointments";
const APPOINTMENTS_CHANGED_EVENT = "sadaa-demo-appointments-changed";

function loadDemoAppointments(): StoredDemoAppointment[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as StoredDemoAppointment[]) : [];
  } catch {
    return [];
  }
}

function outcomeBadge(outcome: CallOutcome) {
  return outcome === "Appointment"
    ? "inline-block shrink-0 rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-ink"
    : "inline-block shrink-0 rounded-full border border-ink/10 bg-ink/5 px-2.5 py-0.5 text-xs font-medium text-muted";
}

export default function DashboardPreview() {
  const [expandedCall, setExpandedCall] = useState<string | null>(null);
  const [demoAppointments, setDemoAppointments] = useState<
    StoredDemoAppointment[]
  >([]);

  useEffect(() => {
    setDemoAppointments(loadDemoAppointments());
    const refresh = () => setDemoAppointments(loadDemoAppointments());
    window.addEventListener(APPOINTMENTS_CHANGED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(APPOINTMENTS_CHANGED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const callsToday = sampleCalls.length;
  const bookedToday = sampleAppointments.length + demoAppointments.length;
  const messagesTaken = sampleCalls.filter(
    (call) => call.outcome === "Message"
  ).length;

  const callers = [
    { name: "Hannah", interactions: 2, last: "Appointment booked" },
    { name: "Tom", interactions: 2, last: "Appointment booked" },
    { name: "David", interactions: 1, last: "Message taken" },
    { name: "Priya", interactions: 1, last: "Opening hours shared" },
    { name: "Samira", interactions: 1, last: "Appointment booked" },
  ];

  const stats = [
    { label: "Calls answered today", value: String(callsToday) },
    { label: "Appointments booked", value: String(bookedToday) },
    { label: "Messages taken", value: String(messagesTaken) },
    { label: "Missed calls", value: "0" },
  ];

  return (
    <section
      id="dashboard"
      className="border-t border-ink/10 bg-paper py-20 text-ink sm:py-28"
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-medium sm:text-4xl">
            See what Sadaa did today
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            This is a sample dashboard view showing how calls and bookings
            appear in one place.
          </p>
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-ink/10 bg-paper px-5 py-4"
            >
              <dt className="text-xs font-medium text-muted">{stat.label}</dt>
              <dd className="mt-1 font-display text-3xl font-medium text-ink">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-muted">
          Sample data for the demo clinic.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          <div className="rounded-xl border border-ink/10 bg-paper lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 px-5 py-4">
              <h3 className="font-display text-lg font-medium text-ink">
                Recent calls
              </h3>
              <span className="rounded-full border border-ink/10 bg-ink/5 px-2.5 py-0.5 text-xs text-muted">
                Sample data · tap a call to read it
              </span>
            </div>

            <ul className="md:hidden">
              {sampleCalls.map((call, index) => {
                const key = `${call.caller}-${call.time}`;
                const open = expandedCall === key;
                return (
                  <li
                    key={key}
                    className={
                      index < sampleCalls.length - 1
                        ? "border-b border-ink/10"
                        : undefined
                    }
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedCall(open ? null : key)}
                      aria-expanded={open}
                      className="block w-full px-5 py-4 text-left"
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="font-medium text-ink">
                          {call.caller}
                        </span>
                        <span className={outcomeBadge(call.outcome)}>
                          {call.outcome}
                        </span>
                      </span>
                      <span className="mt-1.5 block text-sm leading-relaxed text-muted">
                        {call.summary}
                      </span>
                      <span className="mt-1.5 block text-xs text-muted">
                        {call.time} · {open ? "Hide transcript" : "Read transcript"}
                      </span>
                    </button>
                    {open && (
                      <ol className="space-y-2.5 border-t border-ink/10 bg-ink/5 px-5 py-4">
                        {call.transcript.map((line, lineIndex) => (
                          <li
                            key={lineIndex}
                            className="text-sm leading-relaxed"
                          >
                            <span className="font-medium text-ink">
                              {line.speaker}:{" "}
                            </span>
                            <span className="text-muted">{line.text}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-ink/10 bg-ink/5 text-muted">
                    <th scope="col" className="px-5 py-3 font-medium">
                      Caller
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Time
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Outcome
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Summary
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sampleCalls.map((call) => {
                    const key = `${call.caller}-${call.time}`;
                    const open = expandedCall === key;
                    return (
                      <Fragment key={key}>
                        <tr className="border-b border-ink/10">
                          <td className="whitespace-nowrap px-5 py-4 font-medium text-ink">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedCall(open ? null : key)
                              }
                              aria-expanded={open}
                              className="text-left font-medium text-ink underline decoration-ink/20 underline-offset-4 hover:decoration-accent"
                            >
                              {call.caller}
                            </button>
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-muted">
                            {call.time}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4">
                            <span className={outcomeBadge(call.outcome)}>
                              {call.outcome}
                            </span>
                          </td>
                          <td className="min-w-56 px-5 py-4 leading-relaxed text-muted">
                            {call.summary}
                          </td>
                        </tr>
                        {open && (
                          <tr className="border-b border-ink/10 bg-ink/5">
                            <td colSpan={4} className="px-5 py-4">
                              <ol className="space-y-2.5">
                                {call.transcript.map((line, lineIndex) => (
                                  <li
                                    key={lineIndex}
                                    className="text-sm leading-relaxed"
                                  >
                                    <span className="font-medium text-ink">
                                      {line.speaker}:{" "}
                                    </span>
                                    <span className="text-muted">
                                      {line.text}
                                    </span>
                                  </li>
                                ))}
                              </ol>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-ink/10 bg-paper lg:col-span-4">
            <div className="border-b border-ink/10 px-5 py-4">
              <h3 className="font-display text-lg font-medium text-ink">
                Appointments today
              </h3>
              <p className="mt-1 text-xs text-muted">Sample data</p>
            </div>

            <ul>
              {sampleAppointments.map((appointment, index) => (
                <li
                  key={`${appointment.name}-${appointment.time}`}
                  className={
                    index < sampleAppointments.length - 1 ||
                    demoAppointments.length > 0
                      ? "border-b border-ink/10 px-5 py-4"
                      : "px-5 py-4"
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{appointment.name}</p>
                      <p className="mt-0.5 text-sm text-muted">
                        {appointment.service}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-accent/25 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-ink">
                      {appointment.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted">{appointment.time}</p>
                </li>
              ))}
              {demoAppointments.map((booking, index) => (
                <li
                  key={`demo-${booking.name}-${booking.day}-${booking.time}-${index}`}
                  className={
                    index < demoAppointments.length - 1
                      ? "border-b border-ink/10 px-5 py-4"
                      : "px-5 py-4"
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{booking.name}</p>
                      <p className="mt-0.5 text-sm text-muted">
                        {booking.service} · {booking.day} at {booking.time}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-ink">
                      Your demo booking
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-ink/10 bg-paper">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 px-5 py-4">
              <h3 className="font-display text-lg font-medium text-ink">
                Callers
              </h3>
              <span className="rounded-full border border-ink/10 bg-ink/5 px-2.5 py-0.5 text-xs text-muted">
                Sample data
              </span>
            </div>
            <ul>
              {callers.map((caller, index) => (
                <li
                  key={caller.name}
                  className={
                    index < callers.length - 1
                      ? "flex items-center justify-between gap-3 border-b border-ink/10 px-5 py-4"
                      : "flex items-center justify-between gap-3 px-5 py-4"
                  }
                >
                  <div>
                    <p className="font-medium text-ink">{caller.name}</p>
                    <p className="mt-0.5 text-sm text-muted">{caller.last}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">
                    {caller.interactions}{" "}
                    {caller.interactions === 1 ? "visit" : "visits"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-ink/10 bg-paper">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 px-5 py-4">
              <h3 className="font-display text-lg font-medium text-ink">
                Business profile
              </h3>
              <span className="rounded-full border border-ink/10 bg-ink/5 px-2.5 py-0.5 text-xs text-muted">
                Sample data
              </span>
            </div>
            <dl className="px-5 py-4">
              <div className="flex items-start justify-between gap-3 border-b border-ink/10 py-3 first:pt-0">
                <dt className="text-sm text-muted">Business</dt>
                <dd className="text-right text-sm font-medium text-ink">
                  {DEMO_BUSINESS.name}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3 border-b border-ink/10 py-3">
                <dt className="text-sm text-muted">Opening hours</dt>
                <dd className="text-right text-sm font-medium text-ink">
                  {DEMO_BUSINESS.hours}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3 py-3 last:pb-0">
                <dt className="text-sm text-muted">Services</dt>
                <dd className="text-right text-sm font-medium text-ink">
                  {DEMO_BUSINESS.services.map((s) => s.name).join(", ")}
                </dd>
              </div>
            </dl>
            <p className="border-t border-ink/10 px-5 py-4 text-xs leading-relaxed text-muted">
              A sample business profile. In the real product, the owner edits
              these details and Sadaa answers with them.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
