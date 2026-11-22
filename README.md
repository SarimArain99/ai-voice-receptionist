# Sadaa — AI Voice Receptionist

An AI receptionist that answers every call, books appointments and takes messages, 24/7. Built for small businesses: clinics, salons, restaurants, property dealers.

## What it is

- **Live demo:** try the receptionist in your browser. Type or speak to it and it books a demo appointment, answers hours and services questions, or takes a message. The demo runs entirely in the browser with a rule-based engine and needs no API key.
- **Dashboard preview:** a sample view of calls (with transcripts, summaries and outcome badges) and appointments for today.
- **How it works:** three steps from setup to answered calls.

## Honest limits

- This version is a web demo and dashboard. It does **not** answer real phone calls. Real telephony (a Twilio number) is a later phase and needs a Twilio account.
- The demo business ("Demo Dental Clinic") is sample data, clearly labelled as such. No prices, testimonials or statistics are invented anywhere on the site.

## Stack

Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + TypeScript. Static site, no backend, no database. Demo appointments are stored in the visitor's own browser (localStorage).

## Run it

```bash
npm install
npm run dev
```

## Design

Ink `#131A24`, warm paper `#F6F3EC`, burgundy accent `#8C2B3D`. Fraunces display + Public Sans body. Built to the project's Hallmark design standard (sloplint clean).

Built by Muhammad Sarim.
