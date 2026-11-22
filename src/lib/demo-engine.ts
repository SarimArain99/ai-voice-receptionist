/**
 * Rule-based receptionist engine for a clearly labelled SAMPLE business.
 * All clinic details below are sample/demo data for the Sadaa interactive demo.
 * Do not treat any information here as a real business listing.
 */

export interface DemoService {
  name: string;
  duration: string;
}

export interface DemoBusiness {
  name: string;
  note: string;
  hours: string;
  services: readonly DemoService[];
}

/** Sample business, demo data only (no prices, no real clinic details). */
export const DEMO_BUSINESS: DemoBusiness = {
  name: "Demo Dental Clinic",
  note: "Sample business, demo data",
  hours: "Monday to Saturday, 9:00 AM to 6:00 PM",
  services: [
    { name: "Check-up", duration: "30 min" },
    { name: "Cleaning", duration: "45 min" },
    { name: "Toothache visit", duration: "30 min" },
  ],
};

export type DemoMessage = {
  from: "caller" | "receptionist";
  text: string;
};

export type DemoBooking = {
  name: string;
  service: string;
  day: string;
  time: string;
};

export type DemoState = {
  name?: string;
  service?: string;
  day?: string;
  time?: string;
  stage: string;
};

export type DemoReplyResult = {
  reply: string;
  state: DemoState;
  booked?: DemoBooking;
};

const UNKNOWN_REPLY =
  "I didn't catch that. You can ask about appointments, opening hours, or services.";

function matchService(text: string): string | undefined {
  const lower = text.toLowerCase();
  if (/\b(check[\s-]?up|check|exam|routine)\b/.test(lower)) {
    return "Check-up";
  }
  if (/\b(clean|cleaning|hygiene|polish)\b/.test(lower)) {
    return "Cleaning";
  }
  if (/\b(toothache|tooth\s?ache|pain|ache|hurt|hurting|emergency)\b/.test(lower)) {
    return "Toothache visit";
  }
  return undefined;
}

function formatServiceList(): string {
  return DEMO_BUSINESS.services
    .map((s) => `${s.name} (${s.duration})`)
    .join(", ");
}

function cleanName(raw: string): string {
  const cleaned = raw
    .trim()
    .replace(/^(my name is|name is|it'?s|i am|i'm|this is)\s+/i, "")
    .replace(/[.!?]+$/, "")
    .trim();
  return cleaned || raw.trim();
}

function isCancelIntent(lower: string): boolean {
  return /\b(cancel|stop|never\s?mind|start over|reset)\b/.test(lower);
}

function isHoursIntent(lower: string): boolean {
  return /\b(hour|hours|open|opening|close|closing|schedule|when are you)\b/.test(
    lower
  );
}

function isServicesIntent(lower: string): boolean {
  return /\b(service|services|offer|offers|treatment|treatments|what do you do)\b/.test(
    lower
  );
}

function isHumanIntent(lower: string): boolean {
  return /\b(person|human|someone|staff|doctor|dentist|transfer|real|agent|speak to|talk to|leave a message|message)\b/.test(
    lower
  );
}

function isBookingIntent(lower: string): boolean {
  return /\b(book|booking|appointment|visit|slot|reserve)\b/.test(lower);
}

function isGreetingIntent(lower: string): boolean {
  return /^(hi|hello|hey|good morning|good afternoon|good evening|salaam|assalam)\b/.test(
    lower
  );
}

function isPriceIntent(lower: string): boolean {
  return /\b(price|prices|pricing|cost|costs|fee|fees|how much|charge|charges)\b/.test(
    lower
  );
}

function isThanksOrBye(lower: string): boolean {
  return /\b(thank|thanks|bye|goodbye|see you)\b/.test(lower);
}

function isAffirmative(lower: string): boolean {
  return /^(yes|yeah|yep|sure|ok|okay|please|go ahead)\b/.test(lower);
}

export function getReply(
  input: string,
  state: {
    name?: string;
    service?: string;
    day?: string;
    time?: string;
    stage: string;
  }
): {
  reply: string;
  state: {
    name?: string;
    service?: string;
    day?: string;
    time?: string;
    stage: string;
  };
  booked?: { name: string; service: string; day: string; time: string };
} {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  if (!trimmed) {
    return {
      reply: UNKNOWN_REPLY,
      state,
    };
  }

  // Allow cancelling any in-progress flow
  if (
    isCancelIntent(lower) &&
    state.stage !== "greeting" &&
    state.stage !== "idle"
  ) {
    return {
      reply:
        "No problem, I have cleared that. Let me know if you need appointments, opening hours, or services.",
      state: { stage: "idle" },
    };
  }

  // Stage: taking a message for a human team member
  if (state.stage === "take_message") {
    return {
      reply:
        "Thank you, I have noted that down. I will pass your message to the clinic team.",
      state: { stage: "idle" },
    };
  }

  // Stage: booking, ask for service
  if (state.stage === "ask_service") {
    if (isHoursIntent(lower)) {
      return {
        reply: `${DEMO_BUSINESS.name} is open ${DEMO_BUSINESS.hours}. Which service would you like to book: Check-up, Cleaning, or Toothache visit?`,
        state,
      };
    }

    const matched = matchService(trimmed);
    if (matched) {
      return {
        reply: `Got it, ${matched}. What day would you like to come in?`,
        state: { ...state, service: matched, stage: "ask_day" },
      };
    }

    return {
      reply:
        "Please choose one of our demo services: Check-up, Cleaning, or Toothache visit.",
      state,
    };
  }

  // Stage: booking, ask for day
  if (state.stage === "ask_day") {
    if (/\bsunday\b/i.test(lower)) {
      return {
        reply: `We are closed on Sunday and open ${DEMO_BUSINESS.hours}. Which other day works for you?`,
        state,
      };
    }

    const day = trimmed.replace(/[.!?]+$/, "");
    return {
      reply: `Sounds good for ${day}. What time between 9:00 AM and 6:00 PM works best?`,
      state: { ...state, day, stage: "ask_time" },
    };
  }

  // Stage: booking, ask for time
  if (state.stage === "ask_time") {
    const time = trimmed.replace(/[.!?]+$/, "");
    return {
      reply: `Noted for ${time}. What name should I put the booking under?`,
      state: { ...state, time, stage: "ask_name" },
    };
  }

  // Stage: booking, ask for name and confirm
  if (state.stage === "ask_name") {
    const name = cleanName(trimmed);
    const service = state.service ?? "Check-up";
    const day = state.day ?? "your requested day";
    const time = state.time ?? "your requested time";

    const booked: DemoBooking = { name, service, day, time };

    return {
      reply: `Thanks, ${name}. Your demo booking for a ${service} on ${day} at ${time} is confirmed.`,
      state: { stage: "idle" },
      booked,
    };
  }

  // Stage: offered booking after answering hours or services
  if (state.stage === "offer_booking" && isAffirmative(lower)) {
    return {
      reply:
        "Which service would you like: Check-up, Cleaning, or Toothache visit?",
      state: { stage: "ask_service" },
    };
  }

  // General intents (greeting / idle / offer_booking)
  if (isHumanIntent(lower)) {
    return {
      reply:
        "No team member is on this demo line, so please leave a short note. I will pass your message to the clinic team.",
      state: { stage: "take_message" },
    };
  }

  if (isPriceIntent(lower)) {
    return {
      reply:
        "Pricing is not listed in this sample demo. I can share our services or help you book a demo appointment.",
      state: { stage: "offer_booking" },
    };
  }

  if (isHoursIntent(lower)) {
    return {
      reply: `${DEMO_BUSINESS.name} is open ${DEMO_BUSINESS.hours}. Would you like to book an appointment?`,
      state: { stage: "offer_booking" },
    };
  }

  if (isServicesIntent(lower)) {
    return {
      reply: `Our sample services are ${formatServiceList()}. Would you like to book one of these?`,
      state: { stage: "offer_booking" },
    };
  }

  const directService = matchService(trimmed);
  if (isBookingIntent(lower) || directService) {
    if (directService) {
      return {
        reply: `Sure, I can book a ${directService}. What day would you like to come in?`,
        state: { service: directService, stage: "ask_day" },
      };
    }

    return {
      reply:
        "I can help with that. Which service would you like: Check-up, Cleaning, or Toothache visit?",
      state: { stage: "ask_service" },
    };
  }

  if (isGreetingIntent(lower)) {
    return {
      reply: `Hello, you have reached ${DEMO_BUSINESS.name}. How can I help you today?`,
      state: { stage: "idle" },
    };
  }

  if (isThanksOrBye(lower)) {
    return {
      reply: `You are welcome. Thank you for trying the ${DEMO_BUSINESS.name} demo.`,
      state: { stage: "idle" },
    };
  }

  return {
    reply: UNKNOWN_REPLY,
    state: { stage: "idle" },
  };
}
