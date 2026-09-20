/**
 * Navigasjonspil for slidere — lang tynn strek med aapent pilhode.
 *
 * ÉN komponent speiles til begge retninger i stedet for to ikoner som maa
 * holdes i synk. "prev" er den samme tegningen snudd om sin egen y-akse.
 *
 * Geometrien er tegnet i et 72 x 16-koordinatsystem: stammen gaar hele
 * veien til spissen, og hodet er to diagonaler som moetes i samme punkt,
 * slik at strek og hode leses som én sammenhengende linje.
 *
 * vectorEffect="non-scaling-stroke" er det som holder streken like fin paa
 * mobil som paa desktop. Uten den ville 1,25 px krympet til under 1 px naar
 * pila skaleres ned til 56 px, og streken ville blitt utydelig paa halve
 * skjermene vaare.
 *
 * Fargen arves (stroke="currentColor"), saa pila tar forgrunnsfargen til
 * flaten den staar paa — ingen egen farge innfoeres.
 */
export default function SliderArrow({
  direction
}: {
  direction: "prev" | "next";
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 72 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-auto w-14 md:w-[72px] ${
        direction === "prev" ? "-scale-x-100" : ""
      }`}
    >
      {/* Stammen */}
      <path d="M0.75 8H71" vectorEffect="non-scaling-stroke" />
      {/* Aapent pilhode — to diagonaler, ingen fyll, ingen trekant.
          Lange, grunne bein (11 x 6,5 enheter) i stedet for et kort og
          bredt hode: det leser som en tegnet strek, ikke som et ikon. */}
      <path d="M60 1.5L71 8L60 14.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
