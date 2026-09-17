"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "ok" | "error";

const projectTypes = [
  "Rehabilitering",
  "Tilbygg",
  "Terrasse & uterom",
  "Fasade / kledning",
  "Vinduer & dører",
  "Innvendig",
  "Annet"
];

const timeframes = [
  "Så snart som mulig",
  "Innen 3 måneder",
  "Innen 6 måneder",
  "I løpet av året",
  "Ikke bestemt ennå"
];

export default function ContactForm({
  prefillRole,
  prefillProjectType,
  prefillMessage
}: {
  prefillRole?: string;
  prefillProjectType?: string;
  prefillMessage?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    setMessage("");
    const form = new FormData(e.currentTarget);
    // Files are noted in the message body so the existing text-based API
    // still works. Real upload handling can be added when a storage bucket
    // is wired up (TODO: FILE STORAGE FOR PHOTO UPLOADS).
    const fileList = form.getAll("photos") as File[];
    const filenames = fileList
      .filter((f) => f instanceof File && f.size > 0)
      .map((f) => f.name);
    if (filenames.length > 0) {
      form.set(
        "message",
        `${form.get("message") ?? ""}\n\nVedlagte bilder (${filenames.length}): ${filenames.join(", ")}`
      );
    }
    form.delete("photos");
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
      setMessage(data.message ?? "Takk. Vi tar kontakt for befaring.");
      (e.target as HTMLFormElement).reset();
    } catch {
      setStatus("error");
      setMessage("Kunne ikke sende meldingen. Sjekk nettverket.");
    }
  };

  const defaultSubject = prefillRole
    ? `Søknad: ${prefillRole}`
    : prefillProjectType
    ? `Forespørsel: ${prefillProjectType}`
    : "";

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-8"
      aria-describedby="form-status"
    >
      <Select
        label="Hva ønsker du hjelp med?"
        name="projectType"
        defaultValue={prefillProjectType ?? ""}
        options={projectTypes}
        required
      />

      <Field
        label="Hvor gjelder det?"
        name="location"
        placeholder="Postnummer eller sted"
        autoComplete="postal-code"
      />

      <label className="block">
        <span className="eyebrow text-ink/60">
          Fortell kort om prosjektet <span aria-hidden>*</span>
        </span>
        <textarea
          name="message"
          rows={6}
          required
          defaultValue={prefillMessage ?? ""}
          className="mt-3 w-full resize-none border-b border-ink/30 bg-transparent py-3 text-lg outline-none transition-colors focus:border-ink"
          placeholder="Beskriv omfang, tidsplan og eventuelle spesielle ønsker…"
        />
      </label>

      <label className="block">
        <span className="eyebrow text-ink/60">Bilder</span>
        <input
          type="file"
          name="photos"
          multiple
          accept="image/*"
          className="mt-3 block w-full text-sm text-ink/80 file:mr-4 file:border file:border-ink/30 file:bg-transparent file:px-4 file:py-2 file:eyebrow file:text-ink hover:file:bg-ink hover:file:text-bone"
        />
        <span className="mt-2 block text-xs text-ink/50">
          Bilder av området eller inspirasjon hjelper oss å svare presist.
        </span>
      </label>

      <Select
        label="Når ønsker du arbeidet utført?"
        name="timeframe"
        options={timeframes}
      />

      <div className="mt-6 border-t border-ink/10 pt-8">
        <p className="eyebrow mb-6 text-ink/60">Kontaktinformasjon</p>
        <div className="grid gap-8 md:grid-cols-2">
          <Field label="Navn" name="name" required autoComplete="name" />
          <Field
            label="Telefon"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
          />
        </div>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <Field
            label="E-post"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
          <Field
            label="Emne"
            name="subject"
            defaultValue={defaultSubject}
            placeholder="F.eks. Ny terrasse Bergen"
          />
        </div>
      </div>

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
          {status === "sending"
            ? "Sender…"
            : message || "Vi svarer innen én virkedag."}
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="group inline-flex items-center gap-4 border border-ink px-8 py-5 eyebrow press hover:bg-ink hover:text-bone disabled:opacity-60"
        >
          {status === "sending" ? "Sender…" : "Send forespørsel"}
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
  defaultValue,
  placeholder
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-ink/60">
        {label}
        {required ? <span aria-hidden> *</span> : ""}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-3 w-full border-b border-ink/30 bg-transparent py-3 text-lg outline-none transition-colors focus:border-ink"
      />
    </label>
  );
}

function Select({
  label,
  name,
  options,
  required,
  defaultValue
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-ink/60">
        {label}
        {required ? <span aria-hidden> *</span> : ""}
      </span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="mt-3 w-full border-b border-ink/30 bg-transparent py-3 text-lg text-ink outline-none transition-colors focus:border-ink"
      >
        <option value="">Velg…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
