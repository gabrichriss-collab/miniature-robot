export type Service = {
  slug: string;
  kicker: string;
  /** Short label used in navigation, cards, and headings. */
  title: string;
  /** One-sentence customer-oriented summary. */
  lede: string;
  /** Long-form intro for the dedicated service page. */
  intro: string;
  /** Typical scope items shown as a bulleted list on the service page. */
  typicalScope: string[];
  /** Material / solution choices we work with. */
  materials: string[];
  /** Technical considerations we prioritise. */
  technical: string[];
  /** Factors that influence price on this kind of job. */
  priceFactors: string[];
  /** Short FAQ, shown on the service page. */
  faq: Array<{ q: string; a: string }>;
  /** Wood-toned gradient used as card fallback when no image is present. */
  gradient: string;
  /** Optional real photo. Path under /public. Replaces the gradient when set. */
  image?: string;
};

export const services: Service[] = [
  {
    slug: "rehabilitering",
    kicker: "01 — Rehabilitering",
    title: "Rehabilitering",
    lede:
      "Oppussing, ombygging og oppgradering av eksisterende bolig — fra enkeltrom til helhetlig rehab.",
    intro:
      "Vi tar oss av rehabilitering der det eksisterende huset skal bevares og løftes. Vi går grundig gjennom det som allerede står, planlegger tiltakene i riktig rekkefølge, og løser overgangene mellom det gamle og det nye slik at det holder over tid.",
    typicalScope: [
      "Total oppussing av rom eller etasje",
      "Bytte av bjelker, sviller og bærende deler",
      "Nye gulv, tak og innvendige overflater",
      "Utbedring av fukt- og råteskader",
      "Oppgradering av isolasjon og tetting"
    ],
    materials: [
      "Massivtre og limtre",
      "Standard bindingsverk i gran",
      "Trebaserte platekonstruksjoner",
      "Tradisjonelle overflater — olje, lin, kalk"
    ],
    technical: [
      "Fuktkontroll og lufting bak overflater",
      "Riktig oppbygging av gulv, vegg og tak",
      "Overganger mot eksisterende konstruksjon",
      "Dokumentert våtromsarbeid der det er relevant"
    ],
    priceFactors: [
      "Omfang og areal",
      "Tilstand på eksisterende konstruksjon",
      "Materialvalg og overflater",
      "Rive- og saneringsbehov",
      "Adkomst og logistikk"
    ],
    faq: [
      {
        q: "Kan dere ta hele prosjektet, inkludert rørlegger og elektriker?",
        a: "Ja. Vi tar rollen som ansvarlig håndverker og henter inn faste samarbeidspartnere på rør, elektro og andre fag når prosjektet krever det."
      },
      {
        q: "Må vi flytte ut mens arbeidet pågår?",
        a: "Det kommer an på omfanget. På større rehab-jobber gir det som regel raskere fremdrift om huset står tomt, men mye kan gjøres etappevis."
      }
    ],
    gradient: "linear-gradient(150deg,#161311 0%,#4a3b30 55%,#9a8265 100%)"
  },
  {
    slug: "tilbygg",
    kicker: "02 — Tilbygg",
    title: "Tilbygg",
    lede:
      "Utvidelser, tilbygg og mindre bygningsmessige påbygg — planlagt for å møte det eksisterende huset presist.",
    intro:
      "Tilbygg handler først og fremst om å møte det som allerede står. Vi planlegger overgangen mellom gammelt og nytt tidlig — bæring, tetting, kledning og innvendige detaljer — slik at tilbygget både fungerer teknisk og leser seg som en del av huset.",
    typicalScope: [
      "Utvidelse av stue, kjøkken eller bad",
      "Loftsutbygging og takløft",
      "Nye soverom eller kontor",
      "Hagestue eller mindre frittstående bygg",
      "Bæreveggendringer i eksisterende hus"
    ],
    materials: [
      "Bindingsverk i gran",
      "Massivtre der det gir mening",
      "Isolerte klimavegger",
      "Fasadekledning tilpasset eksisterende hus"
    ],
    technical: [
      "Fundamentering og tilkobling til eksisterende grunn",
      "Vindtetting og lufting mellom nytt og gammelt",
      "Riktig oppbygging av tak- og veggkonstruksjon",
      "Overganger i kledning, list og beslag"
    ],
    priceFactors: [
      "Størrelse (m²) og form",
      "Grunnforhold og fundamentering",
      "Kompleksitet i sammenkobling med huset",
      "Materialvalg og finish",
      "Søknads- og prosjekteringsbehov"
    ],
    faq: [
      {
        q: "Trenger tilbygget søknad?",
        a: "De fleste tilbygg er søknadspliktige. Vi hjelper til med å avklare med kommunen og henter inn ansvarlig søker der det trengs."
      },
      {
        q: "Hvor lang tid tar et vanlig tilbygg?",
        a: "Fra befaring til ferdig utført ligger de fleste tilbygg mellom 8 og 20 uker, avhengig av størrelse og søknadsprosess."
      }
    ],
    gradient: "linear-gradient(150deg,#181c1a 0%,#3a4a3f 50%,#7c8c78 100%)"
  },
  {
    slug: "terrasse-og-uterom",
    kicker: "03 — Uterom",
    title: "Terrasse & uterom",
    lede:
      "Terrasser, pergolaer, levegger, trapper og rekkverk — bygget for å tåle vestlandsvær.",
    intro:
      "Uterom i Bergen og omegn må stå imot mye vær. Vi bygger terrasser og uterom med riktig oppbygging, gode overflater og skjulte innfestinger der det er mulig, slik at treet får være i fokus og konstruksjonen ikke skiller seg ut.",
    typicalScope: [
      "Ny terrasse — bakkeplan eller løftet",
      "Trapper, rekkverk og håndlister",
      "Levegger og pergolaer",
      "Overbygg og tak over uteplass",
      "Utvidelse eller ombygging av eksisterende terrasse"
    ],
    materials: [
      "Trykkimpregnert furu",
      "Termofuru og royalimpregnert kledning",
      "Sibirsk lerk og eik der det gir mening",
      "Rustfrie og skjulte innfestinger"
    ],
    technical: [
      "Bæring og fundamentering — punkt eller såle",
      "Fall og drenering vekk fra huset",
      "Lufting under bord og bak leveggkledning",
      "Slitesterke overganger mot fasade og terreng"
    ],
    priceFactors: [
      "Areal og høyde over bakken",
      "Grunnforhold og fundament",
      "Materialvalg",
      "Rekkverk, trapper og tak",
      "Belysning og strøm"
    ],
    faq: [
      {
        q: "Hvor lenge holder en terrasse?",
        a: "Med god oppbygging, riktig treverk og enkelt vedlikehold holder en terrasse i 20–30 år. Underkonstruksjon og innfestinger avgjør levetiden mer enn selve gulvbordene."
      },
      {
        q: "Kan dere bygge terrassen slik at jeg kan bygge tak over senere?",
        a: "Ja. Vi kan dimensjonere fundament og bæring for et fremtidig tak eller pergola, slik at du ikke må gjøre om jobben når du er klar."
      }
    ],
    gradient: "linear-gradient(150deg,#1e1712 0%,#5a3d28 50%,#b58a5f 100%)"
  },
  {
    slug: "fasade",
    kicker: "04 — Fasade",
    title: "Fasade",
    lede:
      "Bytte av kledning, fasadeoppgradering og tilhørende detaljering — planlagt for lang levetid.",
    intro:
      "Fasaden er det som beskytter huset ditt mot vær. Vi bytter kledning, oppgraderer vindsperre og lufting, og løser detaljene rundt vinduer, kanter og innfestinger — slik at fasaden holder tett og ser riktig ut i mange tiår.",
    typicalScope: [
      "Ny kledning på hele eller deler av fasaden",
      "Utbedring av vindsperre og lufting",
      "Skifte av vindskier, hjørner og beslag",
      "Isolasjonsoppgradering ved kledningsbytte",
      "Reparasjon av råteskader"
    ],
    materials: [
      "Royalimpregnert kledning",
      "Ubehandlet gran og sedertre",
      "Termofuru og lerk",
      "Malmfuru til vindskier og lister"
    ],
    technical: [
      "Riktig lufting bak kledning (min. 23 mm)",
      "Vindsperre uten hull og perforeringer",
      "Vannbrett og beslag som holder tett",
      "Skjulte skruer og innfestinger der estetikken krever det"
    ],
    priceFactors: [
      "Fasadeareal og antall vinduer/dører",
      "Tilstand på underliggende konstruksjon",
      "Materialvalg",
      "Stillasbehov og adkomst",
      "Behov for isolasjonsoppgradering"
    ],
    faq: [
      {
        q: "Bør jeg bytte kledning og etterisolere samtidig?",
        a: "Ofte lønner det seg. Når kledningen først er nede har du tilgang til vindsperre og konstruksjon — å legge til ekstra isolasjon i samme jobb er både billigere og gir bedre resultat enn å gjøre det senere."
      },
      {
        q: "Kan dere bytte kledning uten at jeg må flytte ut?",
        a: "Ja. Vi bytter én fasadeside om gangen slik at huset holdes tett gjennom hele prosessen."
      }
    ],
    gradient: "linear-gradient(150deg,#171614 0%,#3d3830 50%,#8a8377 100%)"
  },
  {
    slug: "vinduer-og-dorer",
    kicker: "05 — Vindu & dør",
    title: "Vinduer & dører",
    lede:
      "Skifte og montering av vinduer og dører — med gode gerikter, foringer og tetting.",
    intro:
      "Vinduer og dører er en investering som varer i 30 år eller mer, og det er detaljene rundt åpningen som avgjør om det holder tett. Vi tar hele jobben — riving, tilpasning, isolering, foring, gerikt og utvendig beslag.",
    typicalScope: [
      "Bytte av enkeltvinduer eller hele bygningen",
      "Nye ytterdører og balkongdører",
      "Bytte av innvendige dører",
      "Utvidelse av åpninger — inklusive bæring",
      "Utvendige foringer, gerikter og beslag"
    ],
    materials: [
      "Trevinduer med aluminium utvendig",
      "Rene trevinduer der det er ønsket",
      "Ytterdører i tre eller kompositt",
      "Rustfrie innfestinger og beslag"
    ],
    technical: [
      "Riktig tetting og dampsperre rundt karm",
      "Vannbrett og beslag som leder vekk vann",
      "Isolerte foringer uten kuldebroer",
      "Justering og innregulering av hengsler og lås"
    ],
    priceFactors: [
      "Antall vinduer og dører",
      "Størrelse og glasstype",
      "Behov for utvidelse av åpning",
      "Utvendige foringer og beslag",
      "Adkomst og stillasbehov"
    ],
    faq: [
      {
        q: "Kan jeg beholde eksisterende karm og bare bytte glass?",
        a: "På eldre vinduer med solid karm kan det være en god løsning. På vinduer med råteskader eller dårlig tetting anbefaler vi som regel å bytte hele vinduet."
      },
      {
        q: "Hvor lenge tar det å bytte alle vinduene i et hus?",
        a: "Et vanlig enebolig-bytte gjøres på 1–2 uker, avhengig av antall og om det skal endres på åpningsstørrelser."
      }
    ],
    gradient: "linear-gradient(150deg,#1c1a17 0%,#3a3128 50%,#6b5b46 100%)"
  },
  {
    slug: "innvendig",
    kicker: "06 — Innvendig",
    title: "Innvendig",
    lede:
      "Vegger, tak, gulv, list- og gerikter og annen innvendig tømrer- og snekkerarbeid.",
    intro:
      "De innvendige detaljene er det du ser hver dag — presise lister, rette kanter, tette overganger. Vi tar innvendige jobber som del av en større rehab eller som eget oppdrag, med fokus på at det ser riktig ut både nært og på avstand.",
    typicalScope: [
      "Nye eller tilpassede innvendige vegger",
      "Himlinger, taknedforinger og innredninger",
      "Nye tregulv, sliping og oljing",
      "List- og gerikter, tilpasset detalj",
      "Skjulte dører og fastmøbler"
    ],
    materials: [
      "Ask, eik, furu, gran — massivtre og finér",
      "Tregulv i eik og ask",
      "MDF og kryssfinér der det passer",
      "Overflater i olje, såpe og lin"
    ],
    technical: [
      "Rette overflater — sparklet, slipt og tørket",
      "Riktige overganger mellom materialer",
      "Skjulte innfestinger på synlige lister",
      "Justering for hus som setter seg"
    ],
    priceFactors: [
      "Areal og romantall",
      "Materialvalg og finish",
      "Kompleksitet i tilpasninger",
      "Om det skal fjernes eksisterende overflater",
      "Behov for maling og etterarbeid"
    ],
    faq: [
      {
        q: "Kan dere ta bare innvendige arbeider?",
        a: "Ja. Vi tar innvendige jobber som egne oppdrag — for eksempel nye lister i hele huset, nytt tregulv eller ombygging av ett rom."
      },
      {
        q: "Kan dere skreddersy fastinnredning?",
        a: "Ja. Vi tegner og bygger fastinnredning tilpasset rommet — hyller, benker, garderober og skjulte oppbevaringsløsninger."
      }
    ],
    gradient: "linear-gradient(150deg,#14110e 0%,#3a2b1e 50%,#8a6a3f 100%)"
  }
];
