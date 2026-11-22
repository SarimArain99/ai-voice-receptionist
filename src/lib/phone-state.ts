import type { DemoState } from "./demo-engine";

/**
 * Stateless conversation state for the phone channels.
 * The Twilio webhook carries the whole DemoState in the Gather action URL,
 * so no database or server session is needed for calls.
 */

export function encodeState(state: DemoState): string {
  return Buffer.from(JSON.stringify(state), "utf8").toString("base64url");
}

export function decodeState(raw: string | null): DemoState {
  if (!raw) return { stage: "idle" };
  try {
    const parsed = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8")
    ) as DemoState;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof parsed.stage !== "string"
    ) {
      return { stage: "idle" };
    }
    return parsed;
  } catch {
    return { stage: "idle" };
  }
}

/** Escape text for safe inclusion in a TwiML document. */
export function xmlEscape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
