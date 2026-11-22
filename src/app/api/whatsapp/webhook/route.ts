import { NextRequest } from "next/server";
import { getReply, type DemoState } from "@/lib/demo-engine";
import {
  downloadWhatsAppMedia,
  sendWhatsAppText,
  transcribeAudio,
} from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * WhatsApp Cloud API webhook for Sadaa (Phase 2, Meta free tier).
 *
 * GET verifies the webhook (Meta sends hub.mode / hub.verify_token /
 * hub.challenge when the webhook is registered; the token must match
 * WHATSAPP_VERIFY_TOKEN).
 *
 * POST receives inbound messages. Text messages run through the same
 * rule-based demo engine as the browser demo and get a text reply.
 * Voice notes are downloaded and transcribed when HF_TOKEN is set;
 * without it, the sender gets a polite text asking for a typed message.
 *
 * Conversation state is kept in memory, keyed by sender number. On a
 * cold start or a new server instance the booking flow restarts from
 * idle, which the engine handles gracefully. A Neon-backed store is
 * the next step (see PLAN.md).
 *
 * Always answers 200 quickly: Meta retries deliveries on anything else.
 */

const sessions = new Map<string, DemoState>();

export async function GET(req: NextRequest): Promise<Response> {
  const params = req.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  if (
    mode === "subscribe" &&
    verifyToken &&
    token === verifyToken &&
    challenge
  ) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

type IncomingMessage = {
  from: string;
  type: string;
  text?: { body?: string };
  audio?: { id?: string };
};

type WebhookBody = {
  entry?: Array<{
    changes?: Array<{
      value?: { messages?: IncomingMessage[] };
    }>;
  }>;
};

async function handleMessage(message: IncomingMessage): Promise<void> {
  const from = message.from;
  if (!from) return;
  const state = sessions.get(from) ?? { stage: "idle" };

  let text = "";
  if (message.type === "text") {
    text = message.text?.body?.trim() ?? "";
  } else if (message.type === "audio" && message.audio?.id) {
    const audio = await downloadWhatsAppMedia(message.audio.id);
    const transcript = audio ? await transcribeAudio(audio) : null;
    if (transcript) {
      text = transcript;
    } else {
      await sendWhatsAppText(
        from,
        "Voice note mil gaya — abhi main voice notes sun nahi sakti. Please apna paigham text mein likh dein, ya 'book appointment' likhein."
      );
      return;
    }
  } else {
    // Images, stickers, locations and other types are ignored for now.
    return;
  }

  if (!text) return;
  const result = getReply(text, state);
  sessions.set(from, result.state);
  await sendWhatsAppText(from, result.reply);
}

export async function POST(req: NextRequest): Promise<Response> {
  let body: WebhookBody;
  try {
    body = (await req.json()) as WebhookBody;
  } catch {
    return new Response("Bad Request", { status: 400 });
  }
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const message of change.value?.messages ?? []) {
        await handleMessage(message).catch((err) =>
          console.error("[whatsapp] handle failed", err)
        );
      }
    }
  }
  return new Response("EVENT_RECEIVED", { status: 200 });
}
