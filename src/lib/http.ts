import { promises as fs } from "node:fs";
import path from "node:path";

/** Visitor IP as the proxy reports it. */
export function clientIp(req: Request): string | null {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null
  );
}

/**
 * Per-IP bucket in memory. Fine on one server; with several instances
 * each one counts on its own.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  max: number,
  windowMs: number
): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
    }
    return { ok: true, retryAfter: 0 };
  }
  b.count += 1;
  if (b.count > max) {
    return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

/** Appends one lead to .data/<file>. Read-only filesystems just log it. */
export async function saveLead(file: string, entry: unknown, logOnFail: unknown) {
  try {
    const dir = path.join(process.cwd(), ".data");
    await fs.mkdir(dir, { recursive: true });
    await fs.appendFile(path.join(dir, file), JSON.stringify(entry) + "\n", "utf8");
  } catch {
    console.log(`[${file}] fs unavailable, logging only:`, logOnFail);
  }
}

/** Makes user text safe inside the HTML email. */
export function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** "Sendt"-time in Norwegian time; the server clock runs in UTC. */
export const osloNow = () =>
  new Date().toLocaleString("nb-NO", { timeZone: "Europe/Oslo" });
