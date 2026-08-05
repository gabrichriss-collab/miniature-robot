import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { notifyLead } from "@/lib/notifyLead";

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
    console.log("[contact] fs unavailable, logging only:", entry);
  }

  const emailSubject = subject
    ? `Ny henvendelse: ${subject}`
    : `Ny henvendelse fra ${name}`;

  const text = [
    `Ny henvendelse via tomrerkawiche.no`,
    ``,
    `Navn:     ${name}`,
    `E-post:   ${email}`,
    phone ? `Telefon:  ${phone}` : null,
    subject ? `Emne:     ${subject}` : null,
    ``,
    `Melding:`,
    message,
    ``,
    `— Sendt ${new Date().toLocaleString("nb-NO")}`
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family:Georgia,serif;color:#0a0a0a;max-width:640px">
      <h2 style="font-family:'Sorts Mill Goudy',Georgia,serif;font-weight:400;font-size:28px;margin:0 0 24px">
        Ny henvendelse
      </h2>
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        <tr><td style="padding:6px 0;color:#666;width:120px">Navn</td><td style="padding:6px 0"><strong>${escape(name)}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#666">E-post</td><td style="padding:6px 0"><a href="mailto:${escape(email)}">${escape(email)}</a></td></tr>
        ${phone ? `<tr><td style="padding:6px 0;color:#666">Telefon</td><td style="padding:6px 0"><a href="tel:${escape(phone)}">${escape(phone)}</a></td></tr>` : ""}
        ${subject ? `<tr><td style="padding:6px 0;color:#666">Emne</td><td style="padding:6px 0">${escape(subject)}</td></tr>` : ""}
      </table>
      <div style="margin-top:24px;padding:16px;border-left:2px solid #c9c4bc;white-space:pre-wrap">${escape(message)}</div>
      <p style="margin-top:32px;color:#999;font-size:12px">
        Trykk «Svar» for å svare kunden direkte.
      </p>
    </div>
  `;

  await notifyLead({
    kind: "contact",
    subject: emailSubject,
    text,
    html,
    meta: entry,
    replyTo: email
  });

  return NextResponse.json(
    { message: "Takk. Vi kommer tilbake til deg innen én virkedag." },
    { status: 200 }
  );
}

export function GET() {
  return NextResponse.json({ ok: true, service: "contact" });
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
