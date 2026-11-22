type CallOutcome = "Appointment" | "Message" | "Info";

type SampleCall = {
  caller: string;
  time: string;
  outcome: CallOutcome;
  summary: string;
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
    summary: "Booked a routine checkup for this afternoon.",
  },
  {
    caller: "David",
    time: "10:05 today",
    outcome: "Message",
    summary: "Asked for a callback regarding a previous invoice.",
  },
  {
    caller: "Priya",
    time: "11:28 today",
    outcome: "Info",
    summary: "Checked afternoon opening hours and parking details.",
  },
  {
    caller: "Tom",
    time: "13:40 today",
    outcome: "Appointment",
    summary: "Scheduled a new patient consultation for later today.",
  },
];

const sampleAppointments: SampleAppointment[] = [
  {
    name: "Hannah",
    service: "Routine checkup",
    time: "14:30 today",
    status: "Confirmed",
  },
  {
    name: "Samira",
    service: "Follow up visit",
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

export default function DashboardPreview() {
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

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          <div className="rounded-xl border border-ink/10 bg-paper lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 px-5 py-4">
              <h3 className="font-display text-lg font-medium text-ink">
                Recent calls
              </h3>
              <span className="rounded-full border border-ink/10 bg-ink/5 px-2.5 py-0.5 text-xs text-muted">
                Sample data
              </span>
            </div>

            <ul className="md:hidden">
              {sampleCalls.map((call, index) => (
                <li
                  key={`${call.caller}-${call.time}`}
                  className={
                    index < sampleCalls.length - 1
                      ? "border-b border-ink/10 px-5 py-4"
                      : "px-5 py-4"
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-ink">{call.caller}</p>
                    <span
                      className={
                        call.outcome === "Appointment"
                          ? "inline-block shrink-0 rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-ink"
                          : "inline-block shrink-0 rounded-full border border-ink/10 bg-ink/5 px-2.5 py-0.5 text-xs font-medium text-muted"
                      }
                    >
                      {call.outcome}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {call.summary}
                  </p>
                  <p className="mt-1.5 text-xs text-muted">{call.time}</p>
                </li>
              ))}
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
                  {sampleCalls.map((call, index) => (
                    <tr
                      key={`${call.caller}-${call.time}`}
                      className={
                        index < sampleCalls.length - 1
                          ? "border-b border-ink/10"
                          : undefined
                      }
                    >
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-ink">
                        {call.caller}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-muted">
                        {call.time}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={
                            call.outcome === "Appointment"
                              ? "inline-block rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-ink"
                              : "inline-block rounded-full border border-ink/10 bg-ink/5 px-2.5 py-0.5 text-xs font-medium text-muted"
                          }
                        >
                          {call.outcome}
                        </span>
                      </td>
                      <td className="min-w-56 px-5 py-4 leading-relaxed text-muted">
                        {call.summary}
                      </td>
                    </tr>
                  ))}
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
                    index < sampleAppointments.length - 1
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
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
