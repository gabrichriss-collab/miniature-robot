import { PRICE_DB, type PriceEntry } from "@/data/pricing";

/**
 * Enkel keyword-basert fuzzy-match for norsk håndverker-terminologi.
 * Returnerer beste treff i PRICE_DB, eller null hvis ingen når terskelen.
 */
export function findBestMatch(input: string): PriceEntry | null {
  if (!input || input.length < 2) return null;

  const q = input.toLowerCase().replace(/[^a-zæøå0-9\s]/g, "");
  const words = q.split(/\s+/).filter((w) => w.length > 1);
  if (words.length === 0) return null;

  let bestMatch: PriceEntry | null = null;
  let bestScore = 0;

  for (const entry of PRICE_DB) {
    let score = 0;
    for (const kw of entry.keywords) {
      const kwLower = kw.toLowerCase();
      if (q.includes(kwLower)) {
        score += kwLower.length * 3;
      } else {
        const kwWords = kwLower.split(/\s+/);
        const allFound = kwWords.every((kw2) =>
          words.some((w) => w.includes(kw2) || kw2.includes(w))
        );
        if (allFound) score += kwLower.length * 2;
      }
    }
    for (const w of words) {
      if (entry.name.toLowerCase().includes(w)) score += w.length;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  return bestScore >= 4 ? bestMatch : null;
}
