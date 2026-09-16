import { isVowel, vowelRatio } from "./phonology.js";

const LETTER_FREQUENCY = {
  e: 12.7, t: 9.1, a: 8.2, o: 7.5, i: 7.0, n: 6.7, s: 6.3, h: 6.1, r: 6.0,
  d: 4.3, l: 4.0, c: 2.8, u: 2.8, m: 2.4, w: 2.4, f: 2.2, g: 2.0, y: 2.0,
  p: 1.9, b: 1.5, v: 1.0, k: 0.8, j: 0.15, x: 0.15, q: 0.1, z: 0.07,
};

const COMMON_BIGRAMS = new Set([
  "th", "he", "in", "er", "an", "re", "on", "at", "en", "nd", "ti", "es",
  "or", "te", "of", "ed", "is", "it", "al", "ar", "st", "to", "nt", "ng",
]);

function letterRarity(name) {
  const letters = name.replace(/[^a-z]/g, "");
  if (!letters.length) return 0;
  let total = 0;
  for (const ch of letters) {
    const frequency = LETTER_FREQUENCY[ch] ?? 1;
    total += Math.log10(13 / frequency);
  }
  return total / letters.length;
}

function lengthRarity(length) {
  if (length <= 3) return 1;
  if (length <= 4) return 0.92;
  if (length <= 5) return 0.8;
  if (length <= 6) return 0.68;
  if (length <= 8) return 0.52;
  if (length <= 10) return 0.38;
  if (length <= 13) return 0.24;
  return 0.12;
}

export function rarity(name) {
  const lower = name.toLowerCase();
  const letters = lower.replace(/[^a-z]/g, "");
  const distinct = new Set(letters).size;

  let value = 0;
  value += lengthRarity(lower.length) * 46;
  value += Math.min(letterRarity(lower) / 0.95, 1) * 28;
  value += (distinct / Math.max(letters.length, 1)) * 14;
  value += /[jqxzv]/.test(letters) ? 6 : 0;
  value -= (lower.match(/\d/g) || []).length * 3.5;
  value -= /[._-]/.test(lower) ? 4 : 0;
  value -= /(.)\1/.test(letters) ? 3 : 0;

  return Math.max(1, Math.min(99, Math.round(value + 6)));
}

export function flow(name) {
  const lower = name.toLowerCase().replace(/[^a-z]/g, "");
  if (lower.length < 2) return 20;

  let value = 58;
  const ratio = vowelRatio(lower);
  value += (1 - Math.abs(ratio - 0.42) / 0.42) * 22;

  let alternations = 0;
  let commonPairs = 0;
  for (let i = 1; i < lower.length; i += 1) {
    if (isVowel(lower[i]) !== isVowel(lower[i - 1])) alternations += 1;
    if (COMMON_BIGRAMS.has(lower.slice(i - 1, i + 1))) commonPairs += 1;
  }
  value += (alternations / (lower.length - 1)) * 18;
  value += Math.min(commonPairs, 3) * 2;
  value -= (lower.match(/[bcdfgjkpqtvwxz]{3}/g) || []).length * 14;
  value -= (lower.match(/(.)\1/g) || []).length * 5;
  value -= (name.match(/\d/g) || []).length * 2;

  return Math.max(5, Math.min(99, Math.round(value)));
}

export function describe(name) {
  const r = rarity(name);
  const f = flow(name);
  if (r >= 80 && f >= 70) return "rare and easy to say";
  if (r >= 80) return "very rare";
  if (r >= 62 && f >= 72) return "uncommon, reads cleanly";
  if (f >= 80) return "smooth, widely readable";
  if (r >= 62) return "uncommon";
  return "common shape";
}
