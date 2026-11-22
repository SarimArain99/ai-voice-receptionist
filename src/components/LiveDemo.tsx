"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  DEMO_BUSINESS,
  type DemoBooking,
  type DemoMessage,
  type DemoState,
  getReply,
} from "@/lib/demo-engine";

const STORAGE_KEY = "sadaa-demo-appointments";

const SUGGESTION_CHIPS = [
  "Book an appointment",
  "What are your hours?",
  "What services do you offer?",
] as const;

const INITIAL_MESSAGES: DemoMessage[] = [
  {
    from: "receptionist",
    text: `Hello, you have reached ${DEMO_BUSINESS.name}. How can I help you today?`,
  },
];

const INITIAL_STATE: DemoState = { stage: "greeting" };

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
  isFinal: boolean;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface BrowserSpeechRecognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

type WindowWithSpeech = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

function saveDemoAppointment(booking: DemoBooking): boolean {
  try {
    const existingRaw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = existingRaw ? JSON.parse(existingRaw) : [];
    const list = Array.isArray(parsed) ? parsed : [];
    const next = [
      ...list,
      {
        ...booking,
        business: DEMO_BUSINESS.name,
        demo: true,
        savedAt: new Date().toISOString(),
      },
    ];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export default function LiveDemo() {
  const [messages, setMessages] = useState<DemoMessage[]>(INITIAL_MESSAGES);
  const [engineState, setEngineState] = useState<DemoState>(INITIAL_STATE);
  const [input, setInput] = useState("");
  const [savedNotice, setSavedNotice] = useState(false);

  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechChecked, setSpeechChecked] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceRepliesEnabled, setVoiceRepliesEnabled] = useState(true);

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<DemoState>(engineState);

  useEffect(() => {
    stateRef.current = engineState;
  }, [engineState]);

  useEffect(() => {
    const win = window as WindowWithSpeech;
    const supported = Boolean(
      win.SpeechRecognition || win.webkitSpeechRecognition
    );
    setSpeechSupported(supported);
    setSpeechChecked(true);

    return () => {
      recognitionRef.current?.abort();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    const container = listRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, savedNotice]);

  function speakText(text: string) {
    if (!voiceRepliesEnabled || typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore synthesis errors in restricted browser environments
    }
  }

  function sendMessage(rawText: string, shouldSpeakReply = false) {
    const trimmed = rawText.trim();
    if (!trimmed) return;

    const result = getReply(trimmed, stateRef.current);
    stateRef.current = result.state;
    setEngineState(result.state);

    setMessages((prev) => [
      ...prev,
      { from: "caller", text: trimmed },
      { from: "receptionist", text: result.reply },
    ]);

    if (result.booked) {
      const saved = saveDemoAppointment(result.booked);
      setSavedNotice(saved);
    } else {
      setSavedNotice(false);
    }

    if (shouldSpeakReply) {
      speakText(result.reply);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim()) return;
    const text = input;
    setInput("");
    sendMessage(text, false);
  }

  function handleChipClick(chip: string) {
    sendMessage(chip, false);
  }

  function handleToggleMic() {
    if (!speechSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const win = window as WindowWithSpeech;
    const SpeechRecognitionAPI =
      win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) {
        sendMessage(transcript, true);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setIsListening(false);
    }
  }

  function handleReset() {
    recognitionRef.current?.abort();
    setIsListening(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    stateRef.current = INITIAL_STATE;
    setEngineState(INITIAL_STATE);
    setMessages(INITIAL_MESSAGES);
    setSavedNotice(false);
    setInput("");
  }

  return (
    <section
      id="live-demo"
      aria-labelledby="live-demo-heading"
      className="border-t border-ink/10 bg-paper px-4 py-16 text-ink sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="mb-3 inline-flex items-center rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            Interactive demo for a sample clinic
          </p>

          <h2
            id="live-demo-heading"
            className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
          >
            Try it yourself
          </h2>

          <p className="mt-2 max-w-xl text-base leading-relaxed text-muted">
            This is a working browser demo of the Sadaa receptionist answering
            calls for a sample clinic ({DEMO_BUSINESS.name}, demo data only).
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-ink/15 bg-paper shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 bg-ink/5 px-4 py-3.5 sm:px-5">
            <div>
              <p className="text-sm font-semibold text-ink">
                {DEMO_BUSINESS.name}
              </p>
              <p className="text-xs text-muted">
                {DEMO_BUSINESS.note}. Runs locally in your browser.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {speechSupported && (
                <button
                  type="button"
                  onClick={() => setVoiceRepliesEnabled((prev) => !prev)}
                  className="rounded-lg border border-ink/15 bg-paper px-3 py-2 text-xs font-medium text-ink transition-colors hover:border-ink/30"
                  aria-pressed={voiceRepliesEnabled}
                >
                  {voiceRepliesEnabled ? "Voice reply: On" : "Voice reply: Off"}
                </button>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-ink/15 bg-paper px-3 py-2 text-xs font-medium text-muted transition-colors hover:border-ink/30 hover:text-ink"
              >
                Reset demo
              </button>
            </div>
          </div>

          <div
            ref={listRef}
            role="log"
            aria-live="polite"
            aria-label="Demo receptionist conversation"
            className="h-80 space-y-3.5 overflow-y-auto bg-paper px-4 py-5 sm:h-96 sm:px-5"
          >
            {messages.map((message, index) => {
              const isCaller = message.from === "caller";
              return (
                <div
                  key={`${message.from}-${index}`}
                  className={`flex flex-col ${
                    isCaller ? "items-end" : "items-start"
                  }`}
                >
                  <span className="mb-1 text-xs text-muted">
                    {isCaller ? "You (demo caller)" : "Sadaa (demo receptionist)"}
                  </span>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[78%] ${
                      isCaller
                        ? "rounded-br-sm bg-accent text-accent-ink"
                        : "rounded-bl-sm border border-ink/10 bg-ink/5 text-ink"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              );
            })}

            {savedNotice && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-xl border border-accent/25 bg-accent/10 px-3.5 py-2 text-xs font-medium text-accent"
              >
                <svg
                  className="h-4 w-4 shrink-0"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path
                    d="M4.5 10.5L8.25 14.25L15.5 6.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Saved to your demo appointments.</span>
              </div>
            )}
          </div>

          <div className="border-t border-ink/10 bg-ink/5 px-4 py-3 sm:px-5">
            <div className="flex flex-wrap gap-2">
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className="rounded-full border border-ink/15 bg-paper px-3 py-2 text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-ink/10 bg-paper p-3.5 sm:p-4"
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleMic}
                disabled={!speechSupported}
                aria-label={
                  isListening ? "Stop voice input" : "Start voice input"
                }
                aria-pressed={isListening}
                title={
                  speechSupported
                    ? isListening
                      ? "Stop listening"
                      : "Speak to the demo receptionist"
                    : "Voice input is not supported in this browser"
                }
                className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                  !speechSupported
                    ? "cursor-not-allowed border-ink/10 bg-ink/5 text-muted/60"
                    : isListening
                      ? "border-accent bg-accent text-accent-ink"
                      : "border-ink/15 bg-paper text-ink hover:border-accent hover:text-accent"
                }`}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <rect x="9" y="3" width="6" height="11" rx="3" />
                  <path
                    d="M5 11a7 7 0 0 0 14 0"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 18v3m-3 0h6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <label htmlFor="live-demo-input" className="sr-only">
                Type a message to the demo receptionist
              </label>
              <input
                id="live-demo-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isListening
                    ? "Listening..."
                    : "Type a message for the demo clinic..."
                }
                className="h-11 flex-1 rounded-xl border border-ink/15 bg-paper px-3.5 text-sm text-ink placeholder:text-muted focus:border-accent"
              />

              <button
                type="submit"
                disabled={!input.trim()}
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-accent px-4 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Send
              </button>
            </div>

            {speechChecked && !speechSupported && (
              <p className="mt-2 text-xs text-muted">
                Microphone voice input is not supported in this browser. Type a
                message or use the quick prompts above.
              </p>
            )}

            {isListening && (
              <p className="mt-2 text-xs font-medium text-accent">
                Listening for your voice. Speak now or click the microphone to
                stop.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
