# CoU Justice Lab — ন্যায়বন্ধু..

**Bangladesh-based legal self-help portal + Digital Legal Aid System (DLAS) prototype.**
Built for the ADLASB Grand Finale case ("Five Doors, One Record") — but designed as a full public-facing platform, not a demo slide.

🌐 **Live:** https://cou-justice-lab.vercel.app/

---

## What's inside

### Public self-help site (Bangla-first, EN toggle)
| Area | Routes |
|---|---|
| Home: hero, instant search, quick chips | `/` |
| **Self-Help Resource Library** — nested category → sub-category → guide/tool drill-down | `/` (widget) |
| 9 topic guides (family, land, labour, abuse, consumer, cyber, helpline…) with steps, docs, FAQ, law refs | `/topics`, `/topics/[slug]` |
| **Form Toolbox** — 6 guided wizards that generate printable applications/notices/complaints | `/toolbox`, `/toolbox/[slug]` |
| Help center finder (DLAO / UDC / NGO / helpline, district filter) | `/centers` |
| "How Can We Help You?" + "Find a legal self-help center near you!" sections | `/help` |
| About / Contact | `/about`, `/contact` |

### Case prototype (23 mandatory items, one shared record)
| Area | Routes |
|---|---|
| Architecture overview: backbone pipeline + 5 doors | `/prototype` |
| **Part A** — 5 citizen scenarios (Moyuri, Ripon, Nabila, Nuching, Malek) with must-solve, evidence, failure tests | `/prototype/scenarios` |
| **6 integrated flows** with stage-by-stage record writes | `/prototype/flows` |
| **Part B** — 7 provider role consoles (live queues over the shared case store) | `/prototype/roles/[dlao|mediator|helpline|udc|lawyer|receiving|admin]` |
| **Part C** — 11 tech challenges **with live interactive demos** (T1–T11) | `/prototype/tech`, `/prototype/tech/[slug]` |
| 23-item coverage matrix (Implemented / Integrated / Testable) | `/prototype/coverage` |
| Golden Thread G1–G10 | `/prototype/golden-thread` |

### Cross-cutting
- **ন্যায়বন্ধু chat widget** (bottom-right) — bilingual rule-based assistant that answers intents and **navigates the whole site** (topics, tools, centers, prototype demos, per-scenario).
- **PWA + offline** (`/sw.js`, `/offline.html`) with a **Light mode / data-saver** toggle (bottom-left) — T10.
- Role-based views, provenance badges, safe-contact states, audit trail — all wired through `src/lib/dlasStore.tsx`, one shared record store used by every demo (G1–G10).

## Tech
Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · zero runtime deps beyond Next/React. No external fonts, images or CDNs — everything ships as inline SVG. First-load JS ≈ 103–138 kB.

## Run locally
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Deploy to Vercel
1. Push this folder to a GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new) → import the repo.
3. Framework preset: **Next.js** (auto-detected). No env vars needed.
4. Deploy — done.

Or from the CLI:
```bash
npm i -g vercel
vercel --prod
```

## Project structure
```
src/
  app/                 # App Router pages (public + prototype)
  components/          # Header, Footer, ChatWidget, ResourceLibrary,
                       # ToolWizard, CenterFinder, RoleConsole, tech/TechDemo
  data/                # topics, tools, centers, caseData (A1–A5, B1–B7, T1–T11, F1–F6, G1–G10)
  lib/                 # i18n, types, search, chatBrain, dlasStore, utils
public/
  images/              # hero-rural-bd.svg (নদী-বিল hero), og-cover.svg
  icons/               # lotus-of-justice logo
  sw.js, offline.html, manifest.json
```

## Responsible-design notes (mirrors the case's rules)
- Sample data only — no real NID/case/beneficiary data.
- Human authority, safe contact, provenance, and audit are visible in every module.
- Cryptographic/verification demos state their threat models; nothing claims absolute tamper-proofing.

© 2026 CoU Justice Lab — educational prototype.
