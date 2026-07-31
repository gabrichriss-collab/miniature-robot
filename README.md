# TØMRER KAWICHE — Website

Full-stack Next.js 14 (App Router) site for **Tømrer Kawiche**. Frontend
and backend live together — the contact form posts to an internal
Next.js route handler at `/api/contact`.

## Design references

- **Polestar.com** — minimalism, generous whitespace, big serif display,
  ken-burns hero, tactile noise texture.
- **Veidekke.no** — Norwegian content structure: Tjenester, Prosjekter,
  Om oss, Bærekraft, Karriere, Kontakt.
- **Multiform.dk** — draggable horizontal slider with side arrows +
  index counter, and a thin hamburger icon that morphs into an `×` while
  a dark overlay clip-path reveals a fullscreen menu.

## Typography

- **Sorts Mill Goudy** — H1 / display. Loaded from Google Fonts.
- **Penumbra Std** — paragraph / body. Licensed; drop your `.woff2`
  files into `public/fonts/` (see `public/fonts/README.md`).
  Until then, **Cormorant Garamond** is loaded as a fallback so the
  overall serif tone still reads correctly.

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Environment

| Variable              | Purpose                                                |
| --------------------- | ------------------------------------------------------ |
| `CONTACT_WEBHOOK_URL` | Optional: outbound webhook for new contact submissions |

Submissions are also appended to `.data/contact.jsonl` locally when the
runtime filesystem is writable.

## Scripts

```bash
npm run dev         # local dev
npm run build       # production build
npm run start       # run production server
npm run lint        # eslint
npm run typecheck   # strict typecheck
```

## Routes

- `/` — Home (slider, manifest, services, featured projects, CTA)
- `/tjenester` — Services
- `/prosjekter` — Projects
- `/om-oss` — About / team
- `/baerekraft` — Sustainability
- `/karriere` — Careers (with prefill to contact)
- `/kontakt` — Contact form → `/api/contact`

## Deployment

The site ships as a Docker container (Next.js `standalone` output).
See [`DEPLOY.md`](./DEPLOY.md) for the recommended path — **Hetzner
Cloud + Coolify** in an EU/Germany data center (~€5/mo, GDPR-friendly).
The same image also runs on Fly.io, Railway, Render, any VPS with
Docker, or plain Vercel/Netlify.

Quick local test:

```bash
docker compose up --build
# → http://localhost:3000
```

Set `CONTACT_WEBHOOK_URL` if you want new leads pushed into email /
Slack / a CRM. Submissions are also appended to
`.data/contact.jsonl` on the persistent volume.
