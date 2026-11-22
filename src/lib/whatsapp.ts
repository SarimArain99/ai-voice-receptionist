/**
 * WhatsApp Cloud API helpers for Sadaa (Phase 2, Meta free tier).
 *
 * - Sending a text reply is free inside Meta's 1,000 free service
 *   messages per number per month (from 1 Oct 2026); inbound messages
 *   are always free.
 * - Voice notes are downloaded from Meta's media API and transcribed
 *   with a Hugging Face Inference token (free HF account). If HF_TOKEN
 *   is not set, transcription is skipped and the caller gets a text
 *   reply asking for a typed message instead — the webhook never crashes.
 */

const GRAPH = "https://graph.facebook.com/v21.0";

export async function sendWhatsAppText(
  to: string,
  body: string
): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) {
    console.warn(
      "[whatsapp] WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID not set — reply not sent."
    );
    return false;
  }
  const res = await fetch(`${GRAPH}/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { preview_url: false, body },
    }),
  });
  if (!res.ok) {
    console.error(
      "[whatsapp] send failed",
      res.status,
      await res.text().catch(() => "")
    );
  }
  return res.ok;
}

export async function downloadWhatsAppMedia(
  mediaId: string
): Promise<ArrayBuffer | null> {
  const token = process.env.WHATSAPP_TOKEN;
  if (!token) return null;
  const meta = await fetch(`${GRAPH}/${mediaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!meta.ok) return null;
  const { url } = (await meta.json()) as { url?: string };
  if (!url) return null;
  const file = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!file.ok) return null;
  return file.arrayBuffer();
}

/**
 * Transcribe a WhatsApp voice note (Opus/ogg) to text.
 * Uses the Hugging Face Inference router with a free HF account token.
 * Returns null when no token is set or transcription fails.
 * NOTE: verify the router URL on first use with a real token — the
 * endpoint shape is the current documented one, not yet live-tested.
 */
export async function transcribeAudio(
  audio: ArrayBuffer
): Promise<string | null> {
  const token = process.env.HF_TOKEN;
  if (!token) return null;
  const res = await fetch(
    "https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3-turbo",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "audio/ogg",
      },
      body: audio,
    }
  );
  if (!res.ok) {
    console.error("[whatsapp] transcription failed", res.status);
    return null;
  }
  const data = (await res.json()) as { text?: string };
  return data.text?.trim() || null;
}
