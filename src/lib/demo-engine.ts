/**
 * Rule-based receptionist engine for a clearly labelled SAMPLE business.
 * All clinic details below are sample/demo data for the Sadaa interactive demo.
 * Do not treat any information here as a real business listing.
 *
 * v2 (22 Nov 2026, after professional QA): validates the booking slots
 * (real weekday, time inside opening hours, a real-looking name), handles
 * cancel / reschedule / location / contact intents, and understands common
 * Roman-Urdu phrases, replying in Roman Urdu when the caller writes it.
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

export type DemoLang = "en" | "ur";

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

export type DemoCancelled = {
  name: string;
  day: string;
  service?: string;
};

export type DemoState = {
  name?: string;
  service?: string;
  day?: string;
  time?: string;
  stage: string;
  lang?: DemoLang;
  cancelName?: string;
  cancelDay?: string;
  cancelService?: string;
  pendingReschedule?: boolean;
};

export type DemoReplyResult = {
  reply: string;
  state: DemoState;
  booked?: DemoBooking;
  cancelled?: DemoCancelled;
};

const OPEN_MINUTES = 9 * 60;
const CLOSE_MINUTES = 18 * 60;

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

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

const DAY_WORDS: Record<string, string> = {
  mon: "Monday",
  monday: "Monday",
  tue: "Tuesday",
  tues: "Tuesday",
  tuesday: "Tuesday",
  wed: "Wednesday",
  wednesday: "Wednesday",
  thu: "Thursday",
  thur: "Thursday",
  thurs: "Thursday",
  thursday: "Thursday",
  fri: "Friday",
  friday: "Friday",
  sat: "Saturday",
  saturday: "Saturday",
};

type DayParse = { day: string } | { closed: true } | null;

function parseDay(text: string): DayParse {
  const lower = text.toLowerCase();
  if (/\bsunday\b/.test(lower) || /\bsun\b/.test(lower)) {
    return { closed: true };
  }
  const today = new Date().getDay();
  if (/\btoday\b/.test(lower)) {
    if (today === 0) return { closed: true };
    return { day: WEEKDAYS[(today - 1 + 7) % 7] };
  }
  if (/\btomorrow\b/.test(lower)) {
    const tomorrow = (today + 1) % 7;
    if (tomorrow === 0) return { closed: true };
    return { day: WEEKDAYS[(tomorrow - 1 + 7) % 7] };
  }
  for (const [word, day] of Object.entries(DAY_WORDS)) {
    if (new RegExp(`\\b${word}\\b`).test(lower)) {
      return { day };
    }
  }
  return null;
}

function formatTimeLabel(minutes: number): string {
  const hour24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(mins).padStart(2, "0")} ${period}`;
}

function parseTime(text: string): string | null {
  const match = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const mins = match[2] ? Number(match[2]) : 0;
  const meridiem = match[3]?.toLowerCase();
  if (mins > 59) return null;
  if (meridiem === "pm" && hour < 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  if (!meridiem) {
    if (hour > 12) {
      // 24-hour clock, e.g. 14:00
    } else if (hour >= 7 && hour <= 11) {
      // morning, e.g. "10" means 10 AM
    } else if (hour >= 1 && hour <= 6) {
      hour += 12; // afternoon, e.g. "2" means 2 PM
    } else if (hour === 12) {
      // noon
    } else {
      return null;
    }
  }
  const total = hour * 60 + mins;
  if (total < OPEN_MINUTES || total > CLOSE_MINUTES) return null;
  return formatTimeLabel(total);
}

function cleanName(raw: string): string | null {
  const cleaned = raw
    .trim()
    .replace(/^(my name is|name is|it'?s|i am|i'm|this is)\s+/i, "")
    .replace(/[.!?]+$/, "")
    .trim();
  if (!cleaned) return null;
  if (/\d/.test(cleaned)) return null;
  if (/^\d{1,2}(:\d{2})?\s*(am|pm)?$/i.test(cleaned)) return null;
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0 || words.length > 3) return null;
  if (!words.every((w) => /^[A-Za-z][A-Za-z.'-]*$/.test(w))) return null;
  if (cleaned.replace(/[^A-Za-z]/g, "").length < 2) return null;
  return cleaned;
}

function isCancelIntent(lower: string): boolean {
  return /\b(cancel|stop|never\s?mind|start over|reset|cancel karni|khatam)\b/.test(
    lower
  );
}

function isRescheduleIntent(lower: string): boolean {
  return /\b(reschedule|re-schedule|change my appointment|move my appointment|change the appointment|badalni|change karni)\b/.test(
    lower
  );
}

function isHoursIntent(lower: string): boolean {
  return /\b(hour|hours|open|opening|close|closing|schedule|when are you|timing|khula|band|kis time|timing kya)\b/.test(
    lower
  );
}

function isServicesIntent(lower: string): boolean {
  return /\b(service|services|offer|offers|treatment|treatments|what do you do|services kya|kya kya)\b/.test(
    lower
  );
}

function isHumanIntent(lower: string): boolean {
  return /\b(person|human|someone|staff|doctor|dentist|transfer|real|agent|speak to|talk to|leave a message|message|paigham)\b/.test(
    lower
  );
}

function isLocationIntent(lower: string): boolean {
  return /\b(where are you|location|address|kahan|kidhar|pata|kis jagah)\b/.test(
    lower
  );
}

function isContactIntent(lower: string): boolean {
  return /\b(phone number|contact|call you|your number|number kya|rabta)\b/.test(
    lower
  );
}

function isBookingIntent(lower: string): boolean {
  return /\b(book|booking|appointment|visit|slot|reserve|appointment chahiye|book karni|appointment lena)\b/.test(
    lower
  );
}

function isGreetingIntent(lower: string): boolean {
  return /^(hi|hello|hey|good morning|good afternoon|good evening|salaam|salam|assalam|aoa)\b/.test(
    lower
  );
}

function isPriceIntent(lower: string): boolean {
  return /\b(price|prices|pricing|cost|costs|fee|fees|how much|charge|charges|qimat|kitne)\b/.test(
    lower
  );
}

function isThanksOrBye(lower: string): boolean {
  return /\b(thank|thanks|bye|goodbye|see you|shukriya|meharbani|allah hafiz)\b/.test(
    lower
  );
}

function isAffirmative(lower: string): boolean {
  return /^(yes|yeah|yep|sure|ok|okay|please|go ahead|han|haan|ji|theek)\b/.test(
    lower
  );
}

function isNegative(lower: string): boolean {
  return /^(no|nah|nope|not now|nahi|na)\b/.test(lower);
}

function isRomanUrdu(lower: string): boolean {
  return /\b(salam|assalam|aoa|shukriya|meharbani|timing|khula|band|chahiye|karni|kya hai|kis time|kahan|kidhar|badalni|khatam|paigham|rabta|qimat|kitne|han|haan|ji|theek|nahi)\b/.test(
    lower
  );
}

type ReplyKey =
  | "greeting"
  | "askService"
  | "askDay"
  | "askTime"
  | "askName"
  | "cleared"
  | "hours"
  | "services"
  | "price"
  | "human"
  | "unknown"
  | "cancelAsk"
  | "cancelNeed"
  | "location"
  | "contact"
  | "thanks"
  | "noReply"
  | "invalidDay"
  | "invalidTime"
  | "invalidName"
  | "closedSunday"
  | "rescheduleAsk"
  | "messageNoted";

const REPLIES: Record<ReplyKey, { en: string; ur: string }> = {
  greeting: {
    en: "Hi there! I can book an appointment for you, share our opening hours, or tell you about our services. What would you like to do?",
    ur: "Salam! Main aapki appointment book kar sakti hoon, timing bata sakti hoon, ya services ke baare mein bata sakti hoon. Aapko kis cheez mein madad chahiye?",
  },
  askService: {
    en: "Which service would you like: Check-up, Cleaning, or Toothache visit?",
    ur: "Konsi service chahiye: Check-up, Cleaning, ya Toothache visit?",
  },
  askDay: {
    en: "What day would you like to come in?",
    ur: "Kis din aana chahenge?",
  },
  askTime: {
    en: "What time between 9:00 AM and 6:00 PM works best?",
    ur: "Subah 9 se shaam 6 ke darmiyan kis time aana chahenge?",
  },
  askName: {
    en: "What name should I put the booking under?",
    ur: "Booking kis naam par rakhein?",
  },
  cleared: {
    en: "No problem, I have cleared that. Let me know if you need appointments, opening hours, or services.",
    ur: "Koi baat nahi, maine woh clear kar diya hai. Appointment, timing ya services ke baare mein pooch sakte hain.",
  },
  hours: {
    en: `${DEMO_BUSINESS.name} is open ${DEMO_BUSINESS.hours}. Would you like to book an appointment?`,
    ur: `Demo Dental Clinic Monday se Saturday, subah 9 bajay se shaam 6 bajay tak khula rehta hai. Kya aap appointment book karna chahenge?`,
  },
  services: {
    en: `Our sample services are ${formatServiceList()}. Would you like to book one of these?`,
    ur: `Hamari sample services hain: Check-up (30 min), Cleaning (45 min), Toothache visit (30 min). Kya aap in mein se koi book karna chahenge?`,
  },
  price: {
    en: "Pricing is not listed in this sample demo. I can share our services or help you book a demo appointment.",
    ur: "Is sample demo mein pricing nahi likhi. Main services bata sakti hoon ya demo appointment book karne mein madad kar sakti hoon.",
  },
  human: {
    en: "No team member is on this demo line, so please leave a short note. I will pass your message to the clinic team.",
    ur: "Is demo line par abhi koi team member nahi hai, is liye mukhtasar note chhor dein. Main aapka paigham clinic team tak pahuncha dungi.",
  },
  unknown: {
    en: "I didn't catch that. You can ask about appointments, opening hours, or services.",
    ur: "Samajh nahi aaya. Aap appointment, timing ya services ke baare mein pooch sakte hain.",
  },
  cancelAsk: {
    en: "Of course. Which booking should I cancel? Please tell me the name and the day, for example: 'Cancel the Check-up on Monday for Alex'.",
    ur: "Zaroor. Konsi booking cancel karni hai? Naam aur din batayein — masalan 'Alex ki Monday wali Check-up cancel kar dein'.",
  },
  cancelNeed: {
    en: "I still need the name and the day of the booking to cancel it. For example: 'Cancel the Check-up on Monday for Alex'.",
    ur: "Cancel karne ke liye mujhe booking ka naam aur din chahiye. Masalan: 'Alex ki Monday wali Check-up cancel kar dein'.",
  },
  location: {
    en: "This is a sample demo clinic, so it has no real address or phone number. In the real product, Sadaa answers with your own business details.",
    ur: "Ye ek sample demo clinic hai, is liye iska koi asal pata ya phone number nahi hai. Asal product mein Sadaa aapke business ki apni details se jawab degi.",
  },
  contact: {
    en: "This demo line has no real phone number. Leave a short message here and I will pass it to the clinic team.",
    ur: "Is demo line ka koi asal number nahi hai. Yahan mukhtasar paigham chhor dein, main clinic team tak pahuncha dungi.",
  },
  thanks: {
    en: `You are welcome. Thank you for trying the ${DEMO_BUSINESS.name} demo.`,
    ur: "Khush aamdeed. Demo Dental Clinic ka demo try karne ka shukriya.",
  },
  noReply: {
    en: "No problem. Let me know if you need anything else.",
    ur: "Koi baat nahi. Kuch aur chahiye ho to batayein.",
  },
  invalidDay: {
    en: "I didn't catch the day. Please pick a day from Monday to Saturday — we are closed on Sunday.",
    ur: "Din samajh nahi aaya. Monday se Saturday mein se koi din batayein — Sunday ko clinic band hota hai.",
  },
  invalidTime: {
    en: "That time doesn't work — we are open 9:00 AM to 6:00 PM. Please pick a time in that range, for example '2:00 PM'.",
    ur: "Woh time theek nahi hai — hum subah 9 se shaam 6 tak khule rehte hain. Is darmiyan koi time batayein, masalan '2:00 PM'.",
  },
  invalidName: {
    en: "I didn't catch the name. Could you share your first name for the booking?",
    ur: "Naam samajh nahi aaya. Booking ke liye apna pehla naam batayein?",
  },
  closedSunday: {
    en: `We are closed on Sunday and open ${DEMO_BUSINESS.hours}. Which other day works for you?`,
    ur: "Sunday ko clinic band hota hai. Hum Monday se Saturday, subah 9 se shaam 6 tak khule rehte hain. Koi aur din batayein?",
  },
  rescheduleAsk: {
    en: "I can cancel your current booking and make a new one. Which booking should I change? Please tell me the name and the day.",
    ur: "Main aapki purani booking cancel karke nayi bana sakti hoon. Pehle batayein, konsi booking badalni hai? Naam aur din batayein.",
  },
  messageNoted: {
    en: "Thank you, I have noted that down. I will pass your message to the clinic team.",
    ur: "Shukriya, maine note kar liya hai. Main aapka paigham clinic team tak pahuncha dungi.",
  },
};

function reply(lang: DemoLang, key: ReplyKey): string {
  return REPLIES[key][lang];
}

function stripCancelNoise(text: string): string {
  return text
    .toLowerCase()
    .replace(/\b(cancel|please|the|appointment|booking|for|on|at|my|meri|ki|ko|kar|dein|karo)\b/g, " ")
    .replace(/\b(check[\s-]?up|check|exam|routine|clean|cleaning|hygiene|polish|toothache|tooth\s?ache|pain|ache|hurt|hurting|emergency)\b/g, " ")
    .replace(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun|today|tomorrow)\b/g, " ")
    .replace(/\d{1,2}(:\d{2})?\s*(am|pm)?/gi, " ")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type CancelDetails = {
  name?: string;
  day?: string;
  service?: string;
};

function parseCancelDetails(text: string, state: DemoState): CancelDetails {
  const service = matchService(text) ?? state.cancelService;
  const parsedDay = parseDay(text);
  const day =
    parsedDay && "day" in parsedDay ? parsedDay.day : state.cancelDay;
  const rawName = cleanName(stripCancelNoise(text)) ?? state.cancelName;
  // stripCancelNoise lowercases, so restore normal casing for display
  const name = rawName
    ? rawName
        .split(" ")
        .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
        .join(" ")
    : undefined;
  return { name, day, service };
}

export function getReply(
  input: string,
  state: DemoState
): DemoReplyResult {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();
  // Session language: Roman-Urdu markers switch to Urdu, clear English
  // markers switch back, short slot answers (Monday, 2pm, a name) keep it.
  const lang: DemoLang = isRomanUrdu(lower)
    ? "ur"
    : /\b(the|what|where|how|when|is|are|your|you|please|book|cancel|appointment|hello|hi|thanks|my|i want|need)\b/.test(
          lower
        )
      ? "en"
      : (state.lang ?? "en");
  const base: DemoState = { ...state, lang };

  if (!trimmed) {
    return { reply: reply(lang, "unknown"), state: base };
  }

  const finishCancel = (
    details: CancelDetails,
    pendingReschedule: boolean
  ): DemoReplyResult => {
    const cancelled: DemoCancelled = {
      name: details.name ?? "",
      day: details.day ?? "",
      service: details.service,
    };
    const done =
      lang === "ur"
        ? `${cancelled.name} ki ${cancelled.service ?? "appointment"} ${cancelled.day} wali booking cancel kar di hai.`
        : `Done — I have cancelled the ${cancelled.service ?? "appointment"} on ${cancelled.day} for ${cancelled.name}.`;
    if (pendingReschedule) {
      return {
        reply:
          lang === "ur"
            ? `${done} Nayi booking ke liye konsi service chahiye: Check-up, Cleaning, ya Toothache visit?`
            : `${done} Would you like to book a new time? Which service: Check-up, Cleaning, or Toothache visit?`,
        state: { stage: "ask_service", lang },
        cancelled,
      };
    }
    return {
      reply: done,
      state: { stage: "idle", lang },
      cancelled,
    };
  };

  // Cancel works at any stage: inside a booking flow it clears the flow,
  // otherwise it asks which booking to cancel (or cancels it from details).
  if (isCancelIntent(lower)) {
    const inFlow = [
      "ask_service",
      "ask_day",
      "ask_time",
      "ask_name",
      "take_message",
    ].includes(state.stage);
    if (inFlow) {
      return { reply: reply(lang, "cleared"), state: { stage: "idle", lang } };
    }
    if (state.stage === "cancel_ask") {
      const details = parseCancelDetails(trimmed, state);
      if (details.name && details.day) {
        return finishCancel(details, state.pendingReschedule ?? false);
      }
      return {
        reply: reply(lang, "cancelNeed"),
        state: {
          ...base,
          stage: "cancel_ask",
          cancelName: details.name ?? state.cancelName,
          cancelDay: details.day ?? state.cancelDay,
          cancelService: details.service ?? state.cancelService,
        },
      };
    }
    const details = parseCancelDetails(trimmed, state);
    if (details.name && details.day) {
      return finishCancel(details, false);
    }
    return {
      reply: reply(lang, "cancelAsk"),
      state: {
        ...base,
        stage: "cancel_ask",
        cancelName: details.name,
        cancelDay: details.day,
        cancelService: details.service,
      },
    };
  }

  // Stage: waiting for cancel details
  if (state.stage === "cancel_ask") {
    const details = parseCancelDetails(trimmed, state);
    if (details.name && details.day) {
      return finishCancel(details, state.pendingReschedule ?? false);
    }
    return {
      reply: reply(lang, "cancelNeed"),
      state: {
        ...base,
        stage: "cancel_ask",
        cancelName: details.name ?? state.cancelName,
        cancelDay: details.day ?? state.cancelDay,
        cancelService: details.service ?? state.cancelService,
      },
    };
  }

  // Stage: taking a message for a human team member
  if (state.stage === "take_message") {
    if (isThanksOrBye(lower)) {
      return { reply: reply(lang, "thanks"), state: { stage: "idle", lang } };
    }
    return {
      reply: reply(lang, "messageNoted"),
      state: { stage: "idle", lang },
    };
  }

  // Stage: booking, ask for service
  if (state.stage === "ask_service") {
    if (isHoursIntent(lower)) {
      return {
        reply: `${reply(lang, "hours")} ${reply(lang, "askService")}`,
        state: base,
      };
    }
    const matched = matchService(trimmed);
    if (matched) {
      return {
        reply:
          lang === "ur"
            ? `Theek hai, ${matched}. Kis din aana chahenge?`
            : `Got it, ${matched}. What day would you like to come in?`,
        state: { ...base, service: matched, stage: "ask_day" },
      };
    }
    return { reply: reply(lang, "askService"), state: base };
  }

  // Stage: booking, ask for day (validated)
  if (state.stage === "ask_day") {
    const parsed = parseDay(trimmed);
    if (parsed && "closed" in parsed) {
      return { reply: reply(lang, "closedSunday"), state: base };
    }
    if (!parsed) {
      return { reply: reply(lang, "invalidDay"), state: base };
    }
    return {
      reply:
        lang === "ur"
          ? `Theek hai, ${parsed.day}. ${reply(lang, "askTime")}`
          : `Sounds good for ${parsed.day}. ${reply(lang, "askTime")}`,
      state: { ...base, day: parsed.day, stage: "ask_time" },
    };
  }

  // Stage: booking, ask for time (validated, inside opening hours)
  if (state.stage === "ask_time") {
    const time = parseTime(trimmed);
    if (!time) {
      return { reply: reply(lang, "invalidTime"), state: base };
    }
    return {
      reply:
        lang === "ur"
          ? `${time} note kar liya. ${reply(lang, "askName")}`
          : `Noted for ${time}. ${reply(lang, "askName")}`,
      state: { ...base, time, stage: "ask_name" },
    };
  }

  // Stage: booking, ask for name (validated) and confirm
  if (state.stage === "ask_name") {
    const name = cleanName(trimmed);
    if (!name) {
      return { reply: reply(lang, "invalidName"), state: base };
    }
    const service = state.service ?? "Check-up";
    const day = state.day ?? "your requested day";
    const time = state.time ?? "your requested time";
    const booked: DemoBooking = { name, service, day, time };
    return {
      reply:
        lang === "ur"
          ? `Shukriya, ${name}. Aapki ${service} ki demo booking ${day} ${time} par confirm ho gayi hai.`
          : `Thanks, ${name}. Your demo booking for a ${service} on ${day} at ${time} is confirmed.`,
      state: { stage: "idle", lang },
      booked,
    };
  }

  // Stage: offered booking after answering hours or services
  if (state.stage === "offer_booking") {
    if (isAffirmative(lower)) {
      return {
        reply: reply(lang, "askService"),
        state: { ...base, stage: "ask_service" },
      };
    }
    if (isNegative(lower)) {
      return { reply: reply(lang, "noReply"), state: { stage: "idle", lang } };
    }
  }

  // General intents (greeting / idle / offer_booking)
  if (isRescheduleIntent(lower)) {
    return {
      reply: reply(lang, "rescheduleAsk"),
      state: { ...base, stage: "cancel_ask", pendingReschedule: true },
    };
  }

  if (isHumanIntent(lower)) {
    return {
      reply: reply(lang, "human"),
      state: { ...base, stage: "take_message" },
    };
  }

  if (isLocationIntent(lower)) {
    return { reply: reply(lang, "location"), state: { ...base, stage: "idle" } };
  }

  if (isContactIntent(lower)) {
    return {
      reply: reply(lang, "contact"),
      state: { ...base, stage: "take_message" },
    };
  }

  if (isPriceIntent(lower)) {
    return {
      reply: reply(lang, "price"),
      state: { ...base, stage: "offer_booking" },
    };
  }

  if (isHoursIntent(lower)) {
    return {
      reply: reply(lang, "hours"),
      state: { ...base, stage: "offer_booking" },
    };
  }

  if (isServicesIntent(lower)) {
    return {
      reply: reply(lang, "services"),
      state: { ...base, stage: "offer_booking" },
    };
  }

  const directService = matchService(trimmed);
  if (isBookingIntent(lower) || directService) {
    if (directService) {
      return {
        reply:
          lang === "ur"
            ? `Zaroor, main ${directService} book kar sakti hoon. Kis din aana chahenge?`
            : `Sure, I can book a ${directService}. What day would you like to come in?`,
        state: { ...base, service: directService, stage: "ask_day" },
      };
    }
    return {
      reply: reply(lang, "askService"),
      state: { ...base, stage: "ask_service" },
    };
  }

  if (isGreetingIntent(lower)) {
    return { reply: reply(lang, "greeting"), state: { stage: "idle", lang } };
  }

  if (isThanksOrBye(lower)) {
    return { reply: reply(lang, "thanks"), state: { stage: "idle", lang } };
  }

  return { reply: reply(lang, "unknown"), state: { stage: "idle", lang } };
}
