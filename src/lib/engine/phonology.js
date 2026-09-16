const ONSETS = [
  ["", 6], ["b", 5], ["c", 3], ["d", 5], ["f", 4], ["g", 3], ["h", 3], ["j", 2],
  ["k", 4], ["l", 6], ["m", 6], ["n", 5], ["p", 4], ["q", 1], ["r", 5], ["s", 6],
  ["t", 6], ["v", 5], ["w", 3], ["x", 2], ["z", 3],
  ["br", 3], ["cr", 2], ["dr", 3], ["fr", 2], ["gr", 2], ["pr", 2], ["tr", 3], ["vr", 1],
  ["bl", 2], ["cl", 2], ["fl", 3], ["gl", 3], ["pl", 2], ["sl", 3],
  ["sk", 2], ["sn", 2], ["sp", 2], ["st", 3], ["sw", 1], ["sy", 2],
  ["th", 3], ["ph", 2], ["ch", 2], ["sh", 3], ["kh", 1], ["rh", 1], ["ly", 2], ["ny", 2],
];

const NUCLEI = [
  ["a", 9], ["e", 8], ["i", 7], ["o", 7], ["u", 4], ["y", 3],
  ["ae", 3], ["ai", 3], ["au", 2], ["ea", 3], ["ei", 2], ["eo", 2],
  ["ia", 3], ["ie", 2], ["io", 3], ["oa", 1], ["oe", 1], ["oi", 1],
  ["ou", 2], ["ua", 1], ["ue", 1], ["ui", 1], ["yr", 1], ["ya", 2],
];

const CODAS = [
  ["", 14], ["l", 6], ["m", 5], ["n", 8], ["r", 7], ["s", 5], ["t", 4],
  ["x", 3], ["v", 2], ["k", 2], ["th", 2], ["sh", 1], ["ne", 3], ["ra", 3],
  ["lo", 2], ["na", 3], ["ro", 2], ["li", 2], ["ri", 2], ["rn", 2], ["rs", 1],
  ["lt", 1], ["ls", 1], ["nt", 2], ["nd", 2], ["nx", 1], ["sk", 1], ["st", 2],
];

function expand(table) {
  const out = [];
  for (const [value, weight] of table) for (let i = 0; i < weight; i += 1) out.push(value);
  return out;
}

const ONSET_POOL = expand(ONSETS);
const NUCLEUS_POOL = expand(NUCLEI);
const CODA_POOL = expand(CODAS);

const VOWELS = new Set(["a", "e", "i", "o", "u", "y"]);

export function isVowel(ch) {
  return VOWELS.has(ch);
}

export function vowelRatio(word) {
  if (!word.length) return 0;
  let count = 0;
  for (const ch of word) if (isVowel(ch)) count += 1;
  return count / word.length;
}

export function longestRun(word, predicate) {
  let best = 0;
  let run = 0;
  for (const ch of word) {
    if (predicate(ch)) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 0;
    }
  }
  return best;
}

const AWKWARD = [
  /[bcdfgjkpqtvwxz]{3}/,
  /(.)\1\1/,
  /[qg]$/,
  /^[xq][bcdfgklmnprstvwz]/,
  /[aeiouy]{4}/,
  /[jqvxz]{2}/,
  /^[^a-z]/,
];

export function isPronounceable(word) {
  if (word.length < 2) return false;
  if (!/[aeiouy]/.test(word)) return false;
  for (const pattern of AWKWARD) if (pattern.test(word)) return false;
  const ratio = vowelRatio(word);
  return ratio >= 0.22 && ratio <= 0.68;
}

export function syllable(rng, { open = false } = {}) {
  const onset = ONSET_POOL[rng.int(ONSET_POOL.length)];
  const nucleus = NUCLEUS_POOL[rng.int(NUCLEUS_POOL.length)];
  const coda = open ? "" : CODA_POOL[rng.int(CODA_POOL.length)];
  return onset + nucleus + coda;
}

// Coining runs on a much narrower inventory than the general pools above:
// invented names have to survive being read aloud by a stranger.
const COIN_ONSETS = expand([
  ["b", 3], ["c", 2], ["d", 3], ["f", 3], ["g", 2], ["h", 2], ["k", 3], ["l", 4],
  ["m", 4], ["n", 4], ["p", 3], ["r", 4], ["s", 4], ["t", 4], ["v", 4], ["w", 2],
  ["z", 2], ["th", 2],
]);

// Clusters are allowed to open a coined word, never to sit inside it.
const COIN_LEAD_ONSETS = expand([
  ["br", 1], ["dr", 1], ["fl", 1], ["gl", 1], ["pr", 1], ["sl", 1], ["st", 1], ["tr", 1],
]);

// The last syllable carries the ending, so it never takes a cluster.
const COIN_FINAL_ONSETS = expand([
  ["b", 2], ["c", 2], ["d", 3], ["f", 2], ["k", 2], ["l", 4], ["m", 4], ["n", 4],
  ["r", 4], ["s", 3], ["t", 3], ["v", 4], ["z", 2], ["th", 1],
]);

const COIN_NUCLEI = expand([
  ["a", 8], ["e", 7], ["i", 6], ["o", 6], ["u", 3],
  ["ae", 2], ["ia", 2], ["io", 2], ["ea", 1],
]);

const COIN_CODAS = expand([["", 10], ["l", 3], ["n", 4], ["r", 3], ["s", 2]]);
const COIN_ENDINGS = expand([
  ["a", 4], ["e", 3], ["o", 3], ["is", 2], ["yn", 2], ["ix", 2],
  ["en", 3], ["ra", 2], ["el", 2], ["ia", 2], ["us", 1],
]);

export function coinWord(rng, syllables) {
  let word = "";
  for (let i = 0; i < syllables - 1; i += 1) {
    const lead = i === 0 && rng.chance(0.18);
    const onset = lead
      ? COIN_LEAD_ONSETS[rng.int(COIN_LEAD_ONSETS.length)]
      : COIN_ONSETS[rng.int(COIN_ONSETS.length)];
    const nucleus = COIN_NUCLEI[rng.int(COIN_NUCLEI.length)];
    const coda = i === 0 && rng.chance(0.3) ? COIN_CODAS[rng.int(COIN_CODAS.length)] : "";
    word += onset + nucleus + coda;
  }
  const finalOnset = COIN_FINAL_ONSETS[rng.int(COIN_FINAL_ONSETS.length)];
  const ending = COIN_ENDINGS[rng.int(COIN_ENDINGS.length)];
  word += finalOnset + ending;
  return word.replace(/(.)\1+/g, "$1");
}

export function cleanStem(word, minLength = 3, maxLength = 5) {
  for (let i = Math.min(maxLength, word.length); i >= minLength; i -= 1) {
    const last = word[i - 1];
    if (isVowel(last) || "lnrs".includes(last)) return word.slice(0, i);
  }
  return word.slice(0, maxLength);
}

export function tailFrom(word, minLength = 3) {
  for (let i = 1; i < word.length - 1; i += 1) {
    if (!isVowel(word[i]) && isVowel(word[i + 1]) && word.length - i >= minLength) {
      return word.slice(i);
    }
  }
  return word;
}

export function joinParts(left, right) {
  if (!left) return right;
  if (!right) return left;

  for (let overlap = Math.min(3, left.length - 1, right.length - 1); overlap >= 1; overlap -= 1) {
    if (left.slice(-overlap) === right.slice(0, overlap)) {
      return left + right.slice(overlap);
    }
  }

  const seam = left.slice(-1) + right.slice(0, 1);
  if (!/[aeiouy]/.test(seam)) {
    if (left.slice(-1) === right.slice(0, 1)) return left + right.slice(1);
    const bridge = "aeo"[(left.charCodeAt(left.length - 1) + right.charCodeAt(0)) % 3];
    if (left.length + right.length > 7) return left + bridge + right;
  }
  return left + right;
}
