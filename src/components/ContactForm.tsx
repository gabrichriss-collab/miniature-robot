"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "ok" | "error";

export default function ContactForm({ prefillRole }: { prefillRole?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    setMessage("");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Noe gikk galt. Prøv igjen senere.");
        return;
      }
      setStatus("ok");
      setMessage(data.message ?? "Takk. Vi kommer tilbake til deg snart.");
      (e.target as HTMLFormElement).reset();
    } catch {
      setStatus("error");
      setMessage("Kunne ikke sende meldingen. Sjekk nettverket.");
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-8"
      aria-describedby="form-status"
    >
      <div className="grid gap-8 md:grid-cols-2">
        <Field label="Navn" name="name" required autoComplete="name" />
        <Field
          label="E-post"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <Field
          label="Telefon"
          name="phone"
          type="tel"
          autoComplete="tel"
        />
        <Field
          label="Emne"
          name="subject"
          defaultValue={prefillRole ? `Søknad: ${prefillRole}` : ""}
        />
      </div>

      <label className="block">
        <span className="eyebrow text-ink/60">Melding</span>
        <textarea
          name="message"
          rows={6}
          required
          className="mt-3 w-full resize-none border-b border-ink/30 bg-transparent py-3 text-lg outline-none transition-colors focus:border-ink"
          placeholder="Fortell kort hva du lurer på eller hva prosjektet handler om…"
        />
      </label>

      {/* honeypot */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <p className="mt-2 text-sm text-ink/60">
        Når du sender inn, kan vi ta kontakt om det du spør etter. Vi
        behandler personopplysninger etter{" "}
        <a className="uline" href="/personvern">
          personvernerklæringen
        </a>{" "}
        og deler dem ikke med andre.
      </p>

      <div className="mt-4 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <p
          id="form-status"
          className={`eyebrow text-sm ${
            status === "ok"
              ? "text-moss"
              : status === "error"
              ? "text-rust"
              : "text-ink/60"
          }`}
          role="status"
          aria-live="polite"
        >
          {status === "sending" ? "Sender…" : message || "Vi svarer innen én virkedag."}
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="group inline-flex items-center gap-4 border border-ink px-8 py-5 eyebrow press hover:bg-ink hover:text-bone disabled:opacity-60"
        >
          {status === "sending" ? "Sender…" : "Send melding"}
          <span
            aria-hidden
            className="transition-transform duration-500 ease-swoop group-hover:translate-x-1"
          >
            →
          </span>
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  defaultValue
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-ink/60">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        className="mt-3 w-full border-b border-ink/30 bg-transparent py-3 text-lg outline-none transition-colors focus:border-ink"
      />
    </label>
  );
}
