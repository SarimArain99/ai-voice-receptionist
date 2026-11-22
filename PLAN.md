# Sadaa — AI Voice Receptionist (Project 1 of 3)

## Pick (22 Nov 2026, Muhammad: "1, 2, 3, teeno banao aik aik kr k")
Order: (1) AI Voice Receptionist → (2) Digital Khata + WhatsApp udhaar reminders → (3) Clinic Token & Queue System.
- **Product name:** Sadaa (Urdu: voice/echo) — AI Voice Receptionist for small businesses (clinics, salons, restaurants, property dealers).
- **Stack:** Next.js 16 App Router + Tailwind v4, static-first. Repo (to create): `SarimArain99/ai-voice-receptionist`. Vercel: `sadaa` / `ai-voice-receptionist`.
- **Generation:** Gemini Argon 4 (web) in chunks via browser tasks. Every file reviewed vs real data + Hallmark Floor before push. Never push Gemini output unchecked.

## V1 scope (honest)
- Landing page with a LIVE interactive demo: visitor types (or speaks via Web Speech API) to the receptionist; it answers FAQs, books an appointment, takes a message. Demo business is a clearly-labelled SAMPLE clinic — demo content is labelled as demo, never presented as a real client.
- Dashboard: Overview (today at a glance), Calls (transcript + summary + outcome badge), Appointments, Callers (light CRM), Settings (business profile: name, hours, services).
- Brain v1: rule-based intent engine (works with no API key). OpenAI brain optional later.
- **NOT in v1:** real phone calls. Real telephony is Phase 2 — see below (webhooks built 22 Nov 2026, awaiting accounts). Say so plainly; never imply v1 answers real calls.

## Phase 2 — real calls + WhatsApp (started 22 Nov 2026, Muhammad: "Twilio bhi kro or Whatsapp bhi", no payment)
- **Free paths only (his instruction, no payment):**
  - **Twilio trial** — no card needed; 75 free voice minutes, 30 days (Oct 2026 docs; the signup page still says "$15 credit"). Limits: calls only to/from verified numbers (max 5, sign-up country only), 10 min per call, a short trial message plays first asking the caller to press a key. Enough to build + prove Phase 2 on his own number.
  - **WhatsApp Cloud API** — no platform fee from Meta; 1,000 free service messages per number per month (from 1 Oct 2026); inbound messages always free. Text replies work in this tier. WhatsApp voice *calls* via the Cloud API exist but are beta/limited — not in this build.
  - Honest limit: no free path gives a public number anyone can call forever — number + minutes always cost someone eventually. Trial proves it; paid number is a later decision.
- **Built 22 Nov 2026 (code ready + tested locally, push pending approval):**
  - `src/app/api/twilio/voice/route.ts` — TwiML webhook: greets, Gathers speech (en-US), runs the same rule-based engine as the browser demo, speaks the reply, Gathers again; no speech twice → polite goodbye + Hangup. State travels in the Gather action URL (base64url DemoState in `src/lib/phone-state.ts`) — stateless, no DB. Twilio's own speech recognition does STT; `<Say>` does TTS. Roman-Urdu speech does not transcribe reliably (en-US); spoken replies use an English voice.
  - `src/app/api/whatsapp/webhook/route.ts` + `src/lib/whatsapp.ts` — GET verifies the webhook (hub.verify_token vs WHATSAPP_VERIFY_TOKEN); POST handles text messages through the same engine and replies via the Graph API; voice notes are downloaded and transcribed via Hugging Face Whisper (HF_TOKEN, free HF account) — without the token the sender gets a polite Roman-Urdu text asking for a typed message. State is in-memory per sender (cold start restarts the flow from idle; engine handles it gracefully).
  - `.env.example` documents the env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_VERIFY_TOKEN, HF_TOKEN (optional).
- **Still needed from Muhammad:**
  1. Twilio: sign up at twilio.com/try-twilio (free trial, no card) with his Gmail, verify his phone by SMS; then share Account SID + Auth Token via the secure card (never in chat). Then: buy/claim the trial number, point its voice webhook at `https://ai-voice-receptionist-livid-rho.vercel.app/api/twilio/voice`, verify his number as a caller ID, test a real call.
  2. WhatsApp: Meta/WhatsApp Cloud API setup needs his Facebook login — the secure Facebook card is already waiting in chat (AI Employee re-auth, 20 Nov). Once submitted: create the Meta app + test number, register the webhook URL `.../api/whatsapp/webhook` with the verify token, test a real message + voice note.
  3. Optional: free Hugging Face account token for voice-note transcription.
- **Not yet done:** Twilio request-signature validation (needs TWILIO_AUTH_TOKEN); saving Twilio/WhatsApp bookings + calls into the dashboard (needs a store — Neon like Dayline); HF router URL not yet live-tested with a real token — verify on first use; WhatsApp in-memory state should move to a DB before real business use.

## Research (22 Nov 2026)
- Landing patterns: hero = live call demo (phone UI + transcript view), value prop in one line, CTAs repeated (Try the demo), use-case tiles by industry, 3-step how-it-works, no fake testimonials.
- Dashboard patterns (NeuralConfig/StrandCalls, VOIP UX): Overview first, Calls with transcripts (most useful thing), outcome badges (Appointment / Message / Info / Urgent / Spam), Appointments list + calendar, Callers CRM, progressive disclosure, one metric that matters.
- Voice UX: progressive enhancement — voice is an enhancement layer; typed chat fallback + visible buttons always present.
- Demand: AI receptionist searches up ~100x in a year; AI voice agents a named fast-growing Fiverr category; managed receptionist $300–1,500/mo, custom build $2,000–8,000 setup.

## Design direction (Picks)
- **Palette (researched, distinct):** ink `#131A24`, warm paper `#F6F3EC`, burgundy accent `#8C2B3D` (changed from terracotta `#E4572E` during review — terracotta + cream + serif is Hallmark's "named look", gate 65), green only for verified/answered states.
- **Type:** Fraunces (serif display) + Public Sans (body).
- **Signature:** the live demo call panel in the hero — a phone-style card with a real transcript and a pulsing "listening" state.
- **Rules:** design_craft + Hallmark Floor, sloplint clean, responsive 320–1920, no horizontal scroll, no invented stats/testimonials/prices, demo labelled as demo.

## Professional QA (22 Nov 2026, ~18:09 PKT) — live browser test + code review
- PASS: homepage, services/hours/price answers, booking end-to-end, Sunday-closed, nonsense fallback (idle), chips/Send/Reset, nav links, no spelling errors.
- FAILS found: (1) no day/time/name validation in booking flow — nonsense day accepted, 8:00 PM booked outside 9 AM–6 PM hours, "11:00 AM" accepted as a name; (2) "Cancel my appointment" alone starts a NEW booking; no appointments list to cancel from; (3) demo bookings saved to localStorage but never viewable, dashboard stays static sample data; (4) mic click gives no feedback; (5) "Hello" just repeats the greeting; (6) dashboard has no Overview, no call transcripts, no Callers, no Settings; (7) no contact/signup anywhere — pricing is one sentence, no way to request a quote; (8) mobile 390px not verified by the browser (needs Playwright check).
- Code review adds: no location/address intent, no phone/contact intent, no reschedule intent, no Urdu/Roman-Urdu support, voice-reply toggle gated on recognition support (should be on speechSynthesis), "checkup" vs "Check-up" inconsistency, no Open Graph image, description claims "24/7" (v1 is a demo).
- Fix round (22 Nov, DONE): engine validation + cancel/reschedule/location/contact intents + Roman-Urdu intents + conversational greeting; LiveDemo "Your demo appointments" list with per-booking cancel + mic feedback; DashboardPreview becomes a client component with Overview stats, expandable call transcripts, Callers, Settings, and live demo bookings merged in; pricing gets a Request-a-quote mailto (sarimarain99@gmail.com) + LinkedIn link; new FAQ section; footer contact links; metadata softened (no 24/7 claim). Verification: engine unit-tested via node (22 cases); sloplint clean 0/0/0; Playwright no overflow at 375/768/1440; live browser re-test 18:29–18:32 PKT all 6 tests PASS. Push commit d372d876 (8 files), Vercel auto-deployed, live verified.
- **v2.1 follow-up (18:32 PKT):** re-test found "Reset demo" cleared only the chat, not "Your demo appointments" (stale bookings from the first QA run stayed listed). Fixed: Reset now also clears the stored demo appointments and the dashboard stat. Build + sloplint clean; push commit f05b0318; Vercel auto-deployed.

## Live (22 Nov 2026, ~18:02 PKT) — DEPLOYED, verified
- **Repo:** https://github.com/SarimArain99/ai-voice-receptionist (public, empty-created via browser + Google sign-in; saved GitHub password was rejected, Google 2-Step number 55 approved on his phone). Push commit `ecd0c725` "Sadaa v1: AI voice receptionist demo (Next.js + Tailwind)" — 16 files; provider added its own "Initial commit" first, our README replaced it.
- **Vercel project:** https://vercel.com/muhammad-sarims-projects-9d792ee2/ai-voice-receptionist — imported from GitHub, Next.js, root ./, no env vars. Deployment `dpl_8XwE5JZbQWZYDJbbU23TQTFUhLpT`, status READY, 32s build.
- **Production URL:** https://ai-voice-receptionist-livid-rho.vercel.app — verified live HTTP 200, title "Sadaa: AI Voice Receptionist", hero "Never miss another customer call again". Note: plain `ai-voice-receptionist.vercel.app` was already taken by another project (RinglyAI), so Vercel assigned the `-livid-rho` suffix. The unique deployment URL (`-1yv38g3ko`) sits behind a Vercel login wall; the production domain is public.
- **Vercel connector note:** MCP calls hit the known 403 team-scope block (`muhammad-sarims-projects-9d792ee2`, no `authorize_team_access` tool) — project created via live browser dashboard instead. Email identity code took 2 tries (first two protected-reference passes failed; the second code was entered by the login agent and verified).
- **Next:** Muhammad's real-phone check (step 7). Then project 2 (Khata).

## Build sequence
1. Research + plan (done). 2. Gemini chunk 1: tokens + layout + hero/demo shell. 3. Chunks: demo engine, dashboard pages. 4. Assemble, review, sloplint. 5. GitHub push (done 22 Nov, commit ecd0c725). 6. Vercel deploy + live verify (done 22 Nov, READY). 7. Muhammad's real-phone check (pending). 8. Then project 2 (Khata).
