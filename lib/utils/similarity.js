// Catches near-duplicate product names ("Surmai Fish Finger" vs "Surimi
// Fish Finger") that a SKU-uniqueness check can't — two products can have
// completely different SKUs and still be the same thing typed slightly
// differently. Dice coefficient on character bigrams is a simple, no-
// dependency way to flag "these look like the same product" without
// false-positiving on genuinely different short names.
function normalizeProductName(name) {
  return name
    .toLowerCase()
    .replace(/^f\s*&\s*c\s*/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function bigrams(str) {
  const set = new Set();
  for (let i = 0; i < str.length - 1; i++) set.add(str.slice(i, i + 2));
  return set;
}

function diceCoefficient(a, b) {
  const bigramsA = bigrams(a);
  const bigramsB = bigrams(b);
  if (bigramsA.size === 0 || bigramsB.size === 0) return 0;
  let overlap = 0;
  for (const bg of bigramsA) if (bigramsB.has(bg)) overlap += 1;
  return (2 * overlap) / (bigramsA.size + bigramsB.size);
}

const SIMILARITY_THRESHOLD = 0.6;

export function findSimilarNames(name, existingNames) {
  const normalized = normalizeProductName(name);
  if (normalized.length < 3) return [];
  return existingNames
    .map((existing) => ({ name: existing, score: diceCoefficient(normalized, normalizeProductName(existing)) }))
    .filter((r) => r.score >= SIMILARITY_THRESHOLD && r.name.toLowerCase() !== name.toLowerCase())
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((r) => r.name);
}
