# Deploy

The site ships as a standard Docker container so it runs anywhere. This
guide covers the recommended path — **Hetzner Cloud + Coolify** — and
lists escape hatches to other hosts. Nothing here is one-way: the same
container image runs on Fly.io, Railway, Render, DigitalOcean, or any
VPS with Docker.

---

## Recommended: Hetzner Cloud + Coolify (EU, ~€5/mo)

You get a Vercel-like git-push-to-deploy experience on a €4.51/mo VPS
hosted in Germany (GDPR-friendly, low latency to Norway).

### 1. Create the server

1. Sign up at [hetzner.com/cloud](https://www.hetzner.com/cloud).
2. Create a new project → **Add server**.
3. Location: **Falkenstein** or **Nuremberg** (both EU/Germany).
4. Image: **Ubuntu 24.04**.
5. Type: **CX22** (2 vCPU, 4 GB RAM, 40 GB SSD) — €4.51/mo.
6. SSH key: add yours.
7. Create.

### 2. Install Coolify (once)

SSH into the server, then:

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash
```

Coolify installs Docker, sets itself up on port 8000, and prints an
initial URL like `http://<server-ip>:8000`. Open it, create the admin
account, then point a subdomain (e.g. `coolify.tomrerkawiche.no`) at
the server and enable HTTPS in Coolify settings.

### 3. Connect the repo

In Coolify:

1. **Sources → New source → GitHub** and authorize the app.
2. **New Resource → Application → Public/Private repo**.
3. Repository: `gabrichriss-collab/miniature-robot`, branch: `main`.
4. Build pack: **Docker Compose** — Coolify picks up `docker-compose.yml`.
5. Domain: `tomrerkawiche.no` (and `www.tomrerkawiche.no`). Coolify
   provisions a free Let's Encrypt certificate automatically.
6. **Environment variables** (optional):
   - `CONTACT_WEBHOOK_URL` → your Slack/Zapier/Resend webhook.
7. **Persistent storage**: the compose file already declares a
   `contact-data` volume for `/app/.data` — Coolify handles it.
8. **Deploy**.

Coolify will pull the repo, build the Docker image, run the container,
and route traffic to it with HTTPS. Push to `main` from now on and it
redeploys automatically.

### 4. Point your domain

In your DNS provider:

```
A     tomrerkawiche.no        → <server-ip>
A     www.tomrerkawiche.no    → <server-ip>
```

Coolify handles the certificates once DNS resolves.

### 5. Grabbing contact submissions

Every submission is appended to `/app/.data/contact.jsonl` inside the
container, which lives on the persistent volume. To read it:

```bash
ssh root@<server-ip>
docker exec -it tomrer-kawiche cat /app/.data/contact.jsonl
```

Or set `CONTACT_WEBHOOK_URL` and forward them elsewhere.

---

## Local test (any machine with Docker)

```bash
docker compose up --build
# open http://localhost:3000
```

This is the same image Coolify runs in production, so if it works here
it works there.

---

## Escape hatches — moving off Coolify later

**Nothing changes in the codebase.** Same Dockerfile, same build.

- **Fly.io** — `fly launch --dockerfile Dockerfile`, then
  `fly volumes create contact_data --region arn --size 1` and mount at
  `/app/.data` in `fly.toml`. ~$3–5/mo.
- **Railway** — New project → Deploy from repo → uses the Dockerfile
  automatically. Add a volume mount at `/app/.data`. ~$5/mo.
- **Render** — New Web Service → Docker → set persistent disk to
  `/app/.data`. ~$7/mo.
- **Vercel/Netlify** — drop the local `.data` write (rely on
  `CONTACT_WEBHOOK_URL` instead — serverless filesystems are read-only)
  and it deploys as a standard Next.js app.
- **Any VPS** — `docker compose up -d` and put Caddy or Traefik in
  front for HTTPS.

Before moving hosts, copy `contact.jsonl` off the old server:

```bash
scp root@<old-server>:/var/lib/docker/volumes/*_contact-data/_data/contact.jsonl ./
```

---

## Environment variables

| Variable              | Required | Purpose                                             |
| --------------------- | -------- | --------------------------------------------------- |
| `CONTACT_WEBHOOK_URL` | No       | Forwards each contact submission as JSON via POST   |
| `PORT`                | No       | Defaults to 3000                                    |
| `HOSTNAME`            | No       | Defaults to 0.0.0.0                                 |
