import { NextRequest } from "next/server";
import { getReply, type DemoState } from "@/lib/demo-engine";
import { decodeState, encodeState, xmlEscape } from "@/lib/phone-state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Twilio voice webhook for Sadaa (Phase 2, free trial).
 *
 * Twilio POSTs here when someone calls the Sadaa number. The flow is:
 *  - first call (no SpeechResult, no state): greet, then Gather speech
 *  - speech received: run the same rule-based demo engine as the browser
 *    demo, speak the reply, and Gather again so the caller can continue
 *  - no speech twice in a row: polite goodbye and Hangup
 *
 * Conversation state travels in the Gather action URL, so the webhook is
 * stateless — no database needed. Twilio's own speech recognition turns
 * the caller's voice into text (English, en-US); Roman-Urdu speech does
 * not transcribe reliably yet, and the spoken replies are read with an
 * English voice. That is a trial limitation, not a bug.
 *
 * Not yet wired: Twilio request-signature validation (needs
 * TWILIO_AUTH_TOKEN) and saving bookings/calls to a store. Both are
 * listed in PLAN.md under Phase 2.
 */

function twiml(body: string): Response {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`,
    { headers: { "Content-Type": "text/xml" } }
  );
}

function actionUrl(
  req: NextRequest,
  state: DemoState,
  noInput: number
): string {
  const url = new URL(req.url);
  url.search = "";
  url.searchParams.set("s", encodeState(state));
  url.searchParams.set("n", String(noInput));
  return url.toString();
}

function gather(
  req: NextRequest,
  say: string,
  state: DemoState,
  noInput: number
): Response {
  const action = actionUrl(req, state, 0);
  const retry = actionUrl(req, state, noInput + 1);
  return twiml(
    `<Gather input="speech" language="en-US" action="${xmlEscape(action)}" method="POST" speechTimeout="auto" timeout="6"><Say>${xmlEscape(say)}</Say></Gather>` +
      `<Redirect method="POST">${xmlEscape(retry)}</Redirect>`
  );
}

export async function GET(): Promise<Response> {
  return new Response("Sadaa Twilio voice webhook — POST only.", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

export async function POST(req: NextRequest): Promise<Response> {
  let speech = "";
  try {
    const form = await req.formData();
    speech = ((form.get("SpeechResult") as string | null) ?? "").trim();
  } catch {
    speech = "";
  }

  const params = req.nextUrl.searchParams;
  const state = decodeState(params.get("s"));
  const noInput = Number(params.get("n") ?? "0") || 0;
  const firstCall = params.get("n") === null && params.get("s") === null;

  // Caller spoke: run the engine and speak the reply.
  if (speech) {
    const result = getReply(speech, state);
    return gather(req, result.reply, result.state, 0);
  }

  // Very first hit from Twilio: greet and start listening.
  if (firstCall) {
    const greeting = getReply("hello", { stage: "idle" });
    return gather(req, greeting.reply, greeting.state, 0);
  }

  // Gather timed out twice with no speech: end the call politely.
  if (noInput >= 2) {
    return twiml(
      `<Say>${xmlEscape("Sorry, I could not hear you. Please call again later. Goodbye.")}</Say><Hangup/>`
    );
  }

  // Gather timed out once: ask the caller to repeat, then listen again.
  return gather(
    req,
    "Sorry, I did not catch that. Could you please repeat?",
    state,
    noInput
  );
}
