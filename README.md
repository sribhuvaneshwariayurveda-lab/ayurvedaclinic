# Sri Bhuvaneshwari Ayurveda Peedam — Website & CMS

A premium Ayurveda clinic website with a full admin CMS.

> **Status: Phase 1 — Homepage + design system, plus the premium motion layer.**
> The remaining public pages, CMS, database and integrations are built in the next
> phase after the visual direction is approved.

**Clinic:** Sri Bhuvaneshwari Ayurveda Peedam
**Doctor:** Dr. B. Neeraj Kalkin, BAMS
**Location:** Pasupathipalayam, Karur, Tamil Nadu
**WhatsApp:** +91 96299 07763

The visual language is **reference-inspired** by jamaldentistry.com (structure,
spacing rhythm, serif+sans pairing, section order, card/hover system and gold
accent), adapted to an original Ayurvedic botanical palette. No proprietary
assets, logos or text from the reference are used.

---

## Reference inspection — method & limits

The reference is a client-rendered Vite React SPA, so a plain fetch returns no
DOM. Rather than guess, the design was reverse-engineered from its compiled
bundles. What was **actually extracted**:

- **Design tokens** (`index-6U3DV37W.css`): gold `#d4b06a`, gold-dark `#b8943e`,
  gold-light `#edd99a`, champagne `#f8f6f2`, ink `#111/#333/#666`; fonts
  **Cinzel** + **Inter**; motion vocabulary (`shimmer`, `float`, `fadeUp`,
  `countUp`, `pulse-gold`, `spin-slow`); shadow/hover system (`luxury-shadow`).
- **Section order & content structure** and **image asset map** from the JS
  bundle (`hero_main`, `aboutimg`, `service_*`, `ai_*`, `ba_*`, …).

It does **not** give exact pixel spacing or photography framing. Screenshots
(desktop hero, a mid-page section, mobile home, footer) would refine proportions.

### Section order recovered (reference → our Home)
Header → Hero (copy + stats / media) → trust strip → About doctor (credentials,
floating images, philosophy) → Treatments grid (category cards + image zoom) →
consultation band → Why-us (6 cards) → testimonials → appointment CTA →
FAQ accordion → clinic/contact + map → final CTA → footer → floating WhatsApp.

---

## Ayurveda palette

| Role | Value |
| --- | --- |
| Deep forest green | `#1B3A2F` |
| Forest (deep / soft) | `#122A22` / `#2A4A3C` |
| Warm ivory | `#F7F3EA` / `#FBF9F4` |
| Muted botanical green | `#6E8B6B` / `#9DB39A` |
| Restrained gold | `#C9A24B` / `#A9842F` / `#E4CE93` |
| Ink | `#16201B` / `#33413A` / `#6B7A72` |

Type: **Cormorant Garamond** (display headings), **Inter** (body),
**Cinzel** (wordmark & section labels).

---

## Project structure

```
ayurveda-clinic/
├─ client/                    # React + Vite front-end
│  ├─ index.html              # meta + pre-paint motion bootstrap + <noscript> fallback
│  ├─ vite.config.js          # dev proxy → /api, /uploads
│  ├─ scripts/smoke.mjs       # jsdom smoke test (content, routing, motion presets)
│  └─ src/
│     ├─ main.jsx, App.jsx    # App: page transitions, scroll reset, motion watcher
│     ├─ styles/
│     │  ├─ tokens.css         # design tokens (single source of truth)
│     │  ├─ global.css         # base, layout, buttons, utilities
│     │  ├─ motion.css         # ALL animation (scoped behind [data-motion])
│     │  └─ components.css     # header/hero/cards/footer/sections
│     ├─ data/content.js       # content + siteSettings (CMS-controlled toggles)
│     ├─ lib/whatsapp.js       # encoded wa.me link + enquiry message builder
│     ├─ lib/motionSettings.js # preset resolution + <html data-motion> control
│     ├─ components/
│     │  ├─ ui/                # Icons, Media, Reveal, SectionHeading, Botanical
│     │  ├─ layout/            # Header, Footer, FloatingWhatsApp
│     │  └─ home/              # Hero, TrustStrip, AboutDoctor, Treatments,
│     │                        # ConsultBand, WhyChooseUs, Testimonials,
│     │                        # AppointmentForm, AppointmentCta, Faq,
│     │                        # ContactClinic, FinalCta
│     └─ pages/                # Home.jsx, Placeholder.jsx
└─ .gitignore
```

## Run the client

```bash
cd client
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → client/dist
npm run preview    # serve the production build
npm run test:smoke # build + jsdom smoke test (content, routes, motion presets)
```

## Motion & animation system

All animation lives in `client/src/styles/motion.css` and is scoped behind a
single attribute on `<html>`:

```
<html data-motion="full | subtle | off">
```

- **`full`** (default) — hero entrance, scroll reveals, staggered card grids,
  page transitions, drawer link stagger, botanical draw-in, one-shot WhatsApp
  entrance. Decorative loops (marquee, gentle float, gold shimmer) run.
- **`subtle`** — shorter/faster reveals, decorative loops paused.
- **`off`** — no non-essential motion; everything renders immediately visible.

The preset is resolved in `client/src/lib/motionSettings.js` in this order:

1. OS `prefers-reduced-motion: reduce` → always `off`
2. `?motion=full|subtle|off` URL param → QA / admin preview
3. `localStorage["sbap:motion"]` → visitor preference
4. `siteSettings.animations` in `data/content.js` → **CMS/admin setting**
5. Default `full`

Only those three values are ever accepted, so the CMS can never inject arbitrary
styles or code — it can only pick a preset.

**Fail-safe by design**

- A tiny **pre-paint script** in `index.html` sets `data-motion` before first
  paint (no flash of hidden content).
- If JavaScript is disabled the attribute is never set → all content renders
  fully visible and static (`<noscript>` shows the clinic name, phone and
  WhatsApp link).
- If the app bundle fails to boot, a 4-second failsafe removes the attribute so
  content can never stay hidden.
- `Reveal` falls back to visible when `IntersectionObserver` is unavailable, and
  a **single shared observer** handles the page (elements unobserve after
  firing — no replay, no per-element observers).
- Animations only touch `transform`, `opacity` and `clip-path` (compositor
  friendly, no layout shift).

### Admin control (CMS phase)

The admin can set `siteSettings.animations` to any supported preset via the
existing content/CMS layer, and visitors can self-serve with
`?motion=off` / `localStorage`. No executable code is ever accepted from the CMS.

## WhatsApp appointments

- Floating WhatsApp button on every page.
- Appointment **enquiry** form: name, phone, preferred date, preferred time,
  treatment of interest.
- Builds a correctly URL-encoded `wa.me` message via
  `client/src/lib/whatsapp.js`.
- The UI explicitly states an enquiry is **not a confirmed appointment**.
- The number is read from `clinic.whatsapp` in `data/content.js` (currently
  `+91 96299 07763`) and will be editable from the admin panel (stored in the
  database) in the CMS phase.
- The floating button has a single tasteful entrance effect (no continuous
  bouncing) and stays fixed and reachable while scrolling.

## Placeholders

Clinic name, doctor name, phone, WhatsApp number and address are now the **real**
clinic details. Remaining placeholders: the email (hidden until supplied), the
Google Maps embed (a "Get Directions" search link is shown instead), and all
photography (on-brand placeholders until real licensed botanical/clinic images
are supplied to `Media`). No patient data, cure rates, testimonials or
guaranteed results have been invented.
