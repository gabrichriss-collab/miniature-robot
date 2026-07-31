import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  company?: string; // honeypot
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  // Honeypot: silently accept but ignore
  if (body.company && body.company.trim().length > 0) {
    return NextResponse.json({ message: "Takk." }, { status: 200 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const subject = (body.subject ?? "").trim();

  const errors: string[] = [];
  if (name.length < 2) errors.push("Navn må være minst 2 tegn.");
  if (!EMAIL.test(email)) errors.push("E-postadressen er ikke gyldig.");
  if (message.length < 10) errors.push("Meldingen må være minst 10 tegn.");
  if (message.length > 5000) errors.push("Meldingen er for lang.");

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 422 });
  }

  const entry = {
    ts: new Date().toISOString(),
    ip:
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      null,
    ua: req.headers.get("user-agent") ?? null,
    name,
    email,
    phone: phone || null,
    subject: subject || null,
    message
  };

  // Persist to a local JSONL file when possible. In serverless production
  // this may be read-only — that's fine; we still return success and log.
  try {
    const dir = path.join(process.cwd(), ".data");
    await fs.mkdir(dir, { recursive: true });
    await fs.appendFile(
      path.join(dir, "contact.jsonl"),
      JSON.stringify(entry) + "\n",
      "utf8"
    );
  } catch {
    // Non-fatal — surface via server logs for the operator.
    console.log("[contact] fs unavailable, logging only:", entry);
  }

  // Forward to an outbound webhook if configured (e.g. Zapier, Slack, Resend).
  const hook = process.env.CONTACT_WEBHOOK_URL;
  if (hook) {
    try {
      await fetch(hook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(entry)
      });
    } catch (err) {
      console.error("[contact] webhook failed", err);
    }
  }

  return NextResponse.json(
    { message: "Takk. Vi kommer tilbake til deg innen én virkedag." },
    { status: 200 }
  );
}

export function GET() {
  return NextResponse.json({ ok: true, service: "contact" });
}
