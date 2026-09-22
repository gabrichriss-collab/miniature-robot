/**
 * Liten pil for tekstlenker — kort stamme med aapent pilhode.
 *
 * Samme streksprak som SliderArrow og MenuMark: 1,25 px, currentColor,
 * non-scaling-stroke, ingen sirkel, ingen flate, ingen ramme.
 *
 * Hvorfor en egen komponent og ikke bare en nedskalert SliderArrow:
 * hodet maa vaere proporsjonalt STOERRE paa en kort pil. SliderArrow har
 * et hode paa 11 av 72 enheter (~15 %); skalert ned til 18 px ville hodet
 * blitt under 3 px og forsvunnet. Her er det 4 av 17 (~24 %), som holder
 * merket lesbart i tekststoerrelse. Det er to tegninger fordi de har to
 * jobber — ikke to versjoner av samme ikon.
 *
 * Forskyvningen paa hover ligger her, men utloeses av .group paa lenken,
 * slik at hele lenken er hover-flaten og ikke bare pila.
 */
export default function LinkArrow() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 18 12"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-[18px] shrink-0 transition-transform duration-500 ease-swoop group-hover:translate-x-1 motion-reduce:transition-none"
    >
      <path d="M0.75 6H17" vectorEffect="non-scaling-stroke" />
      <path d="M13 2L17 6L13 10" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
