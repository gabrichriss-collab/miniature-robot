import { site } from "@/lib/site";

/**
 * Send a lead notification to Tømrer Kawiche via:
 *  1. Email through Resend (if RESEND_API_KEY is set) — primary
 *  2. A generic outbound webhook (if CONTACT_WEBHOOK_URL is set) — optional
 *
 * Both channels are best-effort; failures are logged but never thrown,
 * so a broken third-party doesn't fail the customer request.
 *
 * Env vars:
 *   RESEND_API_KEY   – "re_xxx..." from resend.com/api-keys
 *   LEAD_TO_EMAIL    – inbox to receive leads (default: site.email)
 *   LEAD_FROM_EMAIL  – sender ("Tømrer Kawiche <kontakt@tomrerkawiche.no>")
 *                      until the domain is verified in Resend, use
 *                      "onboarding@resend.dev" (works out of the box)
 *   CONTACT_WEBHOOK_URL – optional; JSON POSTed for Slack / CRM / Zapier
 */

export type LeadKind = "contact" | "prisestimat";

export type LeadPayload = {
  kind: LeadKind;
  subject: string;
  /** Plain-text body — used for fallback email + webhook. */
  text: string;
  /** Optional HTML body — used when available. */
  html?: string;
  /** Optional structured data forwarded to the webhook. */
  meta?: Record<string, unknown>;
  /** Optional single attachment (PDF for prisestimat downloads). */
  attachment?: {
    filename: string;
    /** Raw bytes of the file. */
    content: Buffer;
    contentType?: string;
  };
  /** Reply-to override (the customer's own email so you can just hit Reply). */
  replyTo?: string;
};

export async function notifyLead(payload: LeadPayload): Promise<void> {
  await Promise.all([sendEmail(payload), forwardWebhook(payload)]);
}

async function sendEmail(payload: LeadPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("[lead] RESEND_API_KEY not set — skipping email");
    return;
  }

  const to = process.env.LEAD_TO_EMAIL ?? site.email;
  const from =
    process.env.LEAD_FROM_EMAIL ??
    `Tømrer Kawiche · nettsiden <onboarding@resend.dev>`;

  const body: Record<string, unknown> = {
    from,
    to: [to],
    subject: payload.subject,
    text: payload.text,
    ...(payload.html ? { html: payload.html } : {}),
    ...(payload.replyTo ? { reply_to: payload.replyTo } : {})
  };

  if (payload.attachment) {
    body.attachments = [
      {
        filename: payload.attachment.filename,
        content: payload.attachment.content.toString("base64")
      }
    ];
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(
        `[lead] Resend responded ${res.status}: ${errText.slice(0, 400)}`
      );
    }
  } catch (err) {
    console.error("[lead] Resend fetch failed", err);
  }
}

async function forwardWebhook(payload: LeadPayload): Promise<void> {
  const hook = process.env.CONTACT_WEBHOOK_URL;
  if (!hook) return;

  const body = {
    kind: payload.kind,
    subject: payload.subject,
    text: payload.text,
    meta: payload.meta ?? {}
  };

  try {
    const res = await fetch(hook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      console.error(`[lead] webhook responded ${res.status}`);
    }
  } catch (err) {
    console.error("[lead] webhook failed", err);
  }
}
