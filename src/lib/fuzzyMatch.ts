import { PRICE_DB, type PriceEntry } from "../data/pricing";

/**
 * Oppslag fra fritekst til en post i prislista.
 *
 * Treffet her avgjør hvilken arbeidspost og materialoppskrift kunden blir
 * priset etter, så reglene er bevisst strenge: heller ingen match enn feil
 * match.
 *
 * INGEN VILKÅRLIG DELSTRENGSØKING. Tidligere ga «kontakt» treff på
 * «Taktekking» fordi «tak» står inni ordet, og «ny terrasse» ga
 * «Vinylgulv» fordi «ny» står inni «vinyl». Nå sammenliknes hele ORD:
 *
 *   1. eksakt likt ord
 *   2. bøying — felles prefiks, minst 4 tegn, høyst 3 tegns forskjell
 *      («vindu» ↔ «vinduer», «terrasse» ↔ «terrassen»)
 *   3. sammensatt ord — norske sammensetninger har hodet sist, så
 *      «bordkledning» treffer «kledning». Krever at nøkkelordet er minst
 *      5 tegn, slik at korte ord som «tak» aldri slår inn i «kontakt».
 */

/** Korteste ord som kan bøyningsmatche. */
const MIN_INFLECTION_LENGTH = 4;

/**
 * Norske bøyningsendelser. Vi godtar KUN disse — ikke en vilkårlig
 * lengdeforskjell. Uten lista ble «terrasse» lest som en bøying av
 * «terrassedør», fordi «dør» tilfeldigvis er tre tegn.
 */
const INFLECTION_SUFFIXES = [
  "",
  "a",
  "e",
  "n",
  "r",
  "s",
  "t",
  "en",
  "er",
  "et",
  "ar",
  "na",
  "ne",
  "ns",
  "rs",
  "ane",
  "ene",
  "ers",
  "ets"
];
/** Korteste nøkkelord som kan matche som ledd i et sammensatt ord. */
const MIN_COMPOUND_LENGTH = 5;
/** Under denne poengsummen svarer vi heller «ingen match». */
const SCORE_THRESHOLD = 8;

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-zæøå0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(s: string): string[] {
  return normalize(s)
    .split(" ")
    .filter((w) => w.length > 1);
}

/** Matcher ett søkeord mot ett nøkkelord — alltid på ordgrense. */
export function wordMatches(queryWord: string, keyword: string): boolean {
  if (queryWord === keyword) return true;

  // Bøying: samme stamme, og det som skiller dem er en kjent endelse.
  const [shorter, longer] =
    queryWord.length <= keyword.length
      ? [queryWord, keyword]
      : [keyword, queryWord];
  if (
    shorter.length >= MIN_INFLECTION_LENGTH &&
    longer.startsWith(shorter) &&
    INFLECTION_SUFFIXES.includes(longer.slice(shorter.length))
  ) {
    return true;
  }

  // Sammensatt ord: «bordkledning» → «kledning», «parkettgulv» → «parkett».
  if (
    keyword.length >= MIN_COMPOUND_LENGTH &&
    queryWord.length > keyword.length &&
    (queryWord.endsWith(keyword) || queryWord.startsWith(keyword))
  ) {
    return true;
  }

  return false;
}

/** Står alle ordene i nøkkelordfrasen i søket? */
function phraseMatches(queryWords: string[], keywordWords: string[]): boolean {
  return keywordWords.every((kw) => queryWords.some((q) => wordMatches(q, kw)));
}

/** Står frasens ord etter hverandre i søket? Gir ekstra vekt. */
function phraseIsContiguous(
  queryWords: string[],
  keywordWords: string[]
): boolean {
  if (keywordWords.length < 2) return false;
  for (let i = 0; i + keywordWords.length <= queryWords.length; i++) {
    if (keywordWords.every((kw, j) => wordMatches(queryWords[i + j], kw))) {
      return true;
    }
  }
  return false;
}

export function findBestMatch(input: string): PriceEntry | null {
  const queryWords = tokenize(input);
  if (queryWords.length === 0) return null;

  let bestMatch: PriceEntry | null = null;
  let bestScore = 0;

  for (const entry of PRICE_DB) {
    let score = 0;

    for (const kw of entry.keywords) {
      const kwWords = tokenize(kw);
      if (kwWords.length === 0) continue;
      if (!phraseMatches(queryWords, kwWords)) continue;

      const weight = kwWords.join("").length;
      score += phraseIsContiguous(queryWords, kwWords) ? weight * 3 : weight * 2;
    }

    // Svakt tillegg for ord som går igjen i selve navnet.
    const nameWords = tokenize(entry.name);
    for (const q of queryWords) {
      if (nameWords.some((n) => wordMatches(q, n))) score += q.length;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  return bestScore >= SCORE_THRESHOLD ? bestMatch : null;
}
