# CLAUDE.md — Screenplayr

## Project Overview

**Screenplayr** is a SaaS product that converts YouTube videos into professionally formatted movie screenplays. Users paste a YouTube URL and get a properly structured screenplay with scene headings, dialogue, action lines, and transitions.

**MVP constraints:** English language only, max 2-minute videos.

## Tech Stack

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS
- **Database:** SQLite via better-sqlite3 (file: `screenplayr.db`)
- **AI:** Anthropic Claude API (`@anthropic-ai/sdk`) for screenplay generation
- **Payments:** Stripe (subscriptions + webhooks)
- **Transcript:** `youtube-transcript` package for YouTube caption extraction

## Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

- `ANTHROPIC_API_KEY` — Required for AI screenplay generation
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` — Required for payments
- `STRIPE_WEBHOOK_SECRET` — Required for subscription webhooks
- `STRIPE_PRICE_STARTER` / `STRIPE_PRICE_PRO` / `STRIPE_PRICE_UNLIMITED` — Stripe price IDs
- `NEXT_PUBLIC_APP_URL` — App base URL (default: http://localhost:3000)

## Architecture

### File Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with navbar + footer
│   ├── page.tsx                # Landing page (hero, features, CTA)
│   ├── globals.css             # Global styles + screenplay CSS
│   ├── convert/page.tsx        # Video-to-screenplay converter (main feature)
│   ├── pricing/page.tsx        # Pricing plans with Stripe checkout
│   ├── my-scripts/page.tsx     # User's script history + viewer
│   ├── success/page.tsx        # Post-payment success page
│   └── api/
│       ├── convert/route.ts    # POST: extract transcript → generate screenplay
│       ├── scripts/route.ts    # GET: fetch user's scripts
│       ├── checkout/route.ts   # POST: create Stripe checkout session
│       └── webhook/route.ts    # POST: handle Stripe webhook events
└── lib/
    ├── db.ts                   # SQLite database (users, scripts, usage_logs)
    ├── youtube.ts              # YouTube URL parsing + transcript extraction
    ├── screenplay.ts           # Claude AI screenplay generation
    └── stripe.ts               # Stripe client + plan definitions + checkout
```

### Request Flow

1. User submits YouTube URL + email on `/convert`
2. `POST /api/convert` validates input, checks credits
3. `youtube.ts` extracts English transcript (rejects if >2 min or no English captions)
4. `screenplay.ts` sends transcript to Claude API with screenplay formatting prompt
5. Result saved to SQLite, credit decremented, screenplay returned to frontend

### Database Schema (SQLite)

- **users** — id, email, stripe_customer_id, plan, credits_remaining
- **scripts** — id, user_id, youtube_url, video_title, transcript, screenplay, status
- **usage_logs** — user_id, script_id, action, created_at

### Pricing Tiers

| Plan      | Price   | Credits/month |
|-----------|---------|---------------|
| Free      | $0      | 3 (total)     |
| Starter   | $9/mo   | 25            |
| Pro       | $29/mo  | 100           |
| Unlimited | $79/mo  | Unlimited     |

## Development Guidelines

### Conventions

- Keep code simple and readable; avoid premature abstraction
- Write small, focused commits with clear messages in imperative mood
- Do not commit secrets, credentials, `.env` files, or `*.db` files
- Use TypeScript strict mode; avoid `any` types
- Client components use `"use client"` directive

### Key Patterns

- **No auth framework yet** — users identified by email (MVP simplification)
- **Credits-based billing** — checked before each conversion, decremented on success
- **Stripe webhooks** handle subscription activation and monthly credit reset
- **Screenplay prompt** lives in `src/lib/screenplay.ts` — edit the system prompt to tune output quality
- **Video duration check** happens in `youtube.ts` — `MAX_DURATION_SECONDS = 120`

### CSS

- Dark theme with amber (`#f59e0b`) accent via CSS variables
- Screenplay output uses Courier New monospace with `.screenplay` class
- All styling through Tailwind utility classes
