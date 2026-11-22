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
- **NOT in v1:** real phone calls. Real telephony (Twilio number) is Phase 2 — needs Muhammad's Twilio account/payment. Say so plainly; never imply v1 answers real calls.

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

## Build sequence
1. Research + plan (done). 2. Gemini chunk 1: tokens + layout + hero/demo shell. 3. Chunks: demo engine, dashboard pages. 4. Assemble, review, sloplint. 5. GitHub push (approval card — approve fast). 6. Vercel deploy + live verify + screenshots 375/768/1440. 7. Muhammad's real-phone check. 8. Then project 2 (Khata).
