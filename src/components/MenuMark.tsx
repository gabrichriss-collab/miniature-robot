/**
 * Menymerke — en lang, tynn vannrett strek med en kortere loddrett
 * strek gjennom midten.
 *
 * Den VANNRETTE streken er identiteten. Den forsvinner aldri, verken
 * aapen eller lukket, og den er ca. tre ganger saa lang som den
 * loddrette er hoey. Det er derfor merket aldri leser som et vanlig
 * likearmet pluss eller som en hamburger.
 *
 * Lukket:  ────────┼────────
 * Aapen:   ─────────────────
 *
 * Aapningen er IKKE et bytte av ikon. Den loddrette streken trekker seg
 * inn i den vannrette fra begge ender samtidig (scaleY mot sitt eget
 * midtpunkt, som ligger noeyaktig paa den vannrette streken), mens den
 * vannrette strekker seg 4 % ut. Det er den samme geometrien hele veien,
 * og den reverseres naar menyen lukkes.
 *
 * Bevisst IKKE en rotasjon til kryss: et kryss ville kastet bort den
 * lange vannrette linja som er hele poenget med kontrollen.
 *
 * Bygget av spans og ikke SVG fordi transform-origin paa en SVG-path
 * uten hoeyde (en ren vannrett linje) er upaalitelig paa tvers av
 * nettlesere. Her er origo rett og slett elementets midtpunkt.
 *
 * 800 ms med ease-menu. Bevegelsen skal kunne SES.
 */
export default function MenuMark({ open }: { open: boolean }) {
  const line =
    "absolute block bg-current transition-transform duration-[800ms] ease-menu motion-reduce:transition-none motion-reduce:duration-0";

  return (
    <span className="relative block h-5 w-14 md:w-16">
      {/* Vannrett — identiteten. Strekker seg litt ut naar menyen aapnes. */}
      <span
        aria-hidden
        className={`${line} left-0 top-1/2 w-full -translate-y-1/2 ${
          open ? "scale-x-[1.04]" : ""
        }`}
        style={{ height: "1.25px" }}
      />
      {/* Loddrett — trekker seg inn i den vannrette streken. */}
      <span
        aria-hidden
        className={`${line} left-1/2 top-0 h-full -translate-x-1/2 ${
          open ? "scale-y-0" : ""
        }`}
        style={{ width: "1.25px" }}
      />
    </span>
  );
}
