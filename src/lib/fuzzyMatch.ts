import { PRICE_DB, type PriceEntry } from "../data/pricing";

/**
 * Keyword-basert match for norsk håndverker-terminologi.
 *
 * Treffet her bestemmer hvilken arbeidspost og materialoppskrift kunden
 * faktisk blir priset etter, så reglene er bevisst strenge: heller ingen
 * match enn feil match.
 *
 * Et ord i søket matcher et nøkkelord kun når ett av dem er en PREFIKS av
 * det andre, det korteste er minst 4 tegn, og lengdeforskjellen er liten
 * nok til å være bøying. Det gjør at «vindu» treffer «vinduer», mens «ny»
 * ikke treffer «vinyl» og «vindu» ikke treffer «vindusrestaurering».
 */

const MIN_WORD_LENGTH = 4;

/** Største lengdeforskjell vi godtar som bøying, ikke som nytt ord. */
const MAX_INFLECTION_DIFF = 3;

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

/** Prefiksmatch begge veier, med gulv på ordlengde. */
function wordMatches(queryWord: string, target: string): boolean {
  if (queryWord === target) return true;
  if (Math.min(queryWord.length, target.length) < MIN_WORD_LENGTH) return false;
  if (Math.abs(queryWord.length - target.length) > MAX_INFLECTION_DIFF) {
    return false;
  }
  return target.startsWith(queryWord) || queryWord.startsWith(target);
}

export function findBestMatch(input: string): PriceEntry | null {
  const q = normalize(input);
  if (q.length < 2) return null;

  const words = tokenize(input);
  if (words.length === 0) return null;

  let bestMatch: PriceEntry | null = null;
  let bestScore = 0;

  for (const entry of PRICE_DB) {
    let score = 0;

    for (const kw of entry.keywords) {
      const kwNorm = normalize(kw);
      if (!kwNorm) continue;

      // Hele nøkkelordfrasen står i søket — sterkeste signal.
      if (q.includes(kwNorm)) {
        score += kwNorm.length * 3;
        continue;
      }

      // Ellers: alle ordene i nøkkelordet må finnes igjen i søket.
      const kwWords = kwNorm.split(" ");
      const allFound = kwWords.every((kwWord) =>
        words.some((w) => wordMatches(w, kwWord))
      );
      if (allFound) score += kwNorm.length * 2;
    }

    // Svakt tillegg for ord som går igjen i selve navnet.
    const nameWords = tokenize(entry.name);
    for (const w of words) {
      if (nameWords.some((n) => wordMatches(w, n))) score += w.length;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  return bestScore >= 8 ? bestMatch : null;
}
