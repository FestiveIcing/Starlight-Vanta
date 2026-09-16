import {
  AFFIX_HEAD,
  AFFIX_TAIL,
  BLOCKED_SUBSTRINGS,
  NUMBER_SUFFIXES,
  REGISTERS,
  REGISTER_WEIGHTS,
  SHORT_ROOTS,
  STRUCTURES,
  STRUCTURE_LABELS,
  STYLES,
  TONES,
  TONE_LABELS,
} from "./lexicon.js";
import { cleanStem, coinWord, isPronounceable, isVowel, joinParts, tailFrom } from "./phonology.js";
import { describe, flow, rarity } from "./score.js";

export { STYLES, STRUCTURES, STRUCTURE_LABELS, TONES, TONE_LABELS };

function createRng(seed) {
  let state = seed >>> 0 || 0x9e3779b9;
  const next = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0x100000000;
  };
  return {
    next,
    int: (max) => Math.floor(next() * max),
    pick: (list) => list[Math.floor(next() * list.length)],
    chance: (probability) => next() < probability,
  };
}

function randomSeed() {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    return crypto.getRandomValues(new Uint32Array(1))[0];
  }
  return Math.floor(Math.random() * 0xffffffff);
}

function rootPool(style) {
  const weights = REGISTER_WEIGHTS[style] || REGISTER_WEIGHTS.aesthetic;
  const pool = [];
  for (const [register, weight] of Object.entries(weights)) {
    const words = REGISTERS[register] || [];
    for (let i = 0; i < weight; i += 1) pool.push(...words);
  }
  return pool;
}

function trimRoot(word) {
  return word.replace(/(ing|ed|ium|ius|us|um)$/, "");
}

function shorten(rng, word) {
  if (word.length <= 5) return word;
  const cut = word.slice(0, 4 + rng.int(2));
  return isPronounceable(cut) ? cut : word;
}

function buildSingle(rng, pool) {
  return rng.pick(rng.chance(0.35) ? SHORT_ROOTS : pool);
}

// A blend only earns its place when the two roots actually share a seam, or
// when a vowel hands off cleanly to a consonant. Anything else is two words
// shoved together, which is exactly what reads as generated.
function buildBlend(rng, pool) {
  const left = trimRoot(rng.pick(pool));
  const right = trimRoot(rng.pick(pool));
  if (left === right || left.slice(0, 3) === right.slice(0, 3)) return null;

  const head = cleanStem(left, 3, 5);
  const tail = rng.chance(0.55) ? tailFrom(right, 3) : right;
  if (!head || tail.length < 3) return null;

  for (let overlap = Math.min(3, head.length - 1, tail.length - 1); overlap >= 1; overlap -= 1) {
    if (head.slice(-overlap) === tail.slice(0, overlap)) {
      const merged = head + tail.slice(overlap);
      return merged.length >= 5 && merged.length <= 11 ? merged : null;
    }
  }

  const handoff = isVowel(head[head.length - 1]) && !isVowel(tail[0]);
  if (!handoff || head.length + tail.length > 9) return null;
  return head + tail;
}

function buildRootAffix(rng, pool) {
  const root = trimRoot(rng.pick(rng.chance(0.4) ? SHORT_ROOTS : pool));
  return rng.chance(0.25)
    ? joinParts(rng.pick(AFFIX_HEAD), root)
    : joinParts(shorten(rng, root), rng.pick(AFFIX_TAIL));
}

function buildCoined(rng) {
  return coinWord(rng, rng.chance(0.62) ? 2 : 3);
}

function buildCompound(rng, pool) {
  const left = rng.pick(SHORT_ROOTS);
  const right = trimRoot(rng.pick(pool));
  if (left === right || right.startsWith(left) || right.length > 7) return null;
  const compound = joinParts(left, right);
  return compound.length >= 5 && compound.length <= 11 ? compound : null;
}

function buildNumbered(rng, pool) {
  const base = rng.chance(0.5) ? buildSingle(rng, pool) : buildRootAffix(rng, pool);
  return base + rng.pick(NUMBER_SUFFIXES);
}

const BUILDERS = {
  single: buildSingle,
  blend: buildBlend,
  "root-affix": buildRootAffix,
  coined: (rng) => buildCoined(rng),
  compound: buildCompound,
  numbered: buildNumbered,
};

function applyTone(rng, name, tone) {
  switch (tone) {
    case "capitalized":
      return name.charAt(0).toUpperCase() + name.slice(1);
    case "condensed":
      return name.replace(/[aeiou]$/, "");
    case "spaced": {
      const cut = 2 + rng.int(Math.max(1, name.length - 4));
      if (cut <= 1 || cut >= name.length - 1) return name;
      return `${name.slice(0, cut)}_${name.slice(cut)}`;
    }
    default:
      return name.toLowerCase();
  }
}

// Invented words drift into real English surprisingly often; these are the
// fragments that give it away.
const ENGLISH_NOISE = /their|there|about|would|could|should|people|through|another|between|nothing|thing|which|where|because|please|really/;

const FLOW_FLOOR = { coined: 85, blend: 82, compound: 80, seeded: 80, remix: 78, default: 74 };

function isAcceptable(name, config, structure = "default") {
  const bare = name.toLowerCase();
  if (bare.length < config.minLength || bare.length > config.maxLength) return false;
  if (!/^[a-z][a-z0-9_]*$/.test(bare)) return false;
  if (!config.allowDigits && /\d/.test(bare)) return false;
  if (!config.allowSeparators && /_/.test(bare)) return false;
  for (const blocked of BLOCKED_SUBSTRINGS) if (bare.includes(blocked)) return false;

  const letters = bare.replace(/[0-9_]/g, "");
  if (!isPronounceable(letters)) return false;
  if (ENGLISH_NOISE.test(letters)) return false;
  return flow(letters) >= (FLOW_FLOOR[structure] ?? FLOW_FLOOR.default);
}

export const DEFAULT_CONFIG = {
  style: "aesthetic",
  minLength: 4,
  maxLength: 10,
  structures: ["single", "blend", "root-affix"],
  tone: "lowercase",
  allowDigits: false,
  allowSeparators: false,
};

export function normalizeConfig(config = {}) {
  const merged = { ...DEFAULT_CONFIG, ...config };
  const structures = (merged.structures || []).filter((s) => STRUCTURES.includes(s));
  const maxLength = Math.min(20, Math.max(3, merged.maxLength));
  return {
    ...merged,
    structures: structures.length ? structures : DEFAULT_CONFIG.structures,
    maxLength,
    minLength: Math.min(Math.max(2, merged.minLength), maxLength),
    style: STYLES.includes(merged.style) ? merged.style : DEFAULT_CONFIG.style,
    tone: TONES.includes(merged.tone) ? merged.tone : DEFAULT_CONFIG.tone,
  };
}

function decorate(name, config, structure) {
  return {
    name,
    style: config.style,
    structure,
    rarity: rarity(name),
    flow: flow(name),
    note: describe(name),
  };
}

export function generate(rawConfig, count = 12, seed = randomSeed()) {
  const config = normalizeConfig(rawConfig);
  const rng = createRng(seed);
  const pool = rootPool(config.style);
  const results = new Map();
  const stems = new Map();

  const structures = config.allowDigits
    ? [...config.structures, "numbered"]
    : config.structures.filter((s) => s !== "numbered");
  const active = structures.length ? structures : ["single"];

  let attempts = 0;
  while (results.size < count && attempts < count * 120) {
    attempts += 1;
    const structure = active[attempts % active.length];
    const build = BUILDERS[structure];
    const raw = build(rng, pool);
    if (!raw) continue;

    const toned = applyTone(rng, String(raw).toLowerCase(), config.tone);
    if (!isAcceptable(toned, config, structure)) continue;

    const key = toned.toLowerCase();
    if (results.has(key)) continue;

    // Keep the grid varied: at most two names sharing the same opening stem.
    const stem = key.slice(0, 3);
    if ((stems.get(stem) || 0) >= 2) continue;
    stems.set(stem, (stems.get(stem) || 0) + 1);

    results.set(key, decorate(toned, config, structure));
  }

  return [...results.values()].sort((a, b) => b.rarity + b.flow - (a.rarity + a.flow));
}

// Names built around a word the visitor typed, rather than a random root.
export function generateFromSeed(word, rawConfig, count = 9, seed = randomSeed()) {
  const config = normalizeConfig({ ...rawConfig, minLength: 3, maxLength: 13 });
  const base = String(word || "").toLowerCase().replace(/[^a-z]/g, "");
  if (base.length < 2) return [];

  const rng = createRng(seed);
  const pool = rootPool(config.style);
  const results = new Map();
  const stem = trimRoot(base);

  const recipes = [
    () => joinParts(stem, rng.pick(AFFIX_TAIL)),
    () => joinParts(rng.pick(AFFIX_HEAD), base),
    () => joinParts(stem, trimRoot(rng.pick(pool))),
    () => joinParts(trimRoot(rng.pick(pool)), base),
    () => joinParts(stem, rng.pick(SHORT_ROOTS)),
    () => joinParts(rng.pick(SHORT_ROOTS), base),
    () => joinParts(shorten(rng, stem), rng.pick(AFFIX_TAIL)),
  ];

  let attempts = 0;
  while (results.size < count && attempts < count * 60) {
    const raw = recipes[attempts % recipes.length]();
    attempts += 1;
    if (!raw) continue;
    const toned = applyTone(rng, raw.toLowerCase(), config.tone);
    if (!isAcceptable(toned, { ...config, minLength: 3, maxLength: 13 }, "seeded")) continue;
    const key = toned.toLowerCase();
    if (key === base || results.has(key)) continue;
    results.set(key, decorate(toned, config, "seeded"));
  }

  return [...results.values()].sort((a, b) => b.rarity + b.flow - (a.rarity + a.flow));
}

export function remix(name, count = 9, seed = randomSeed()) {
  const base = String(name || "").toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (base.length < 2) return [];
  const rng = createRng(seed);
  const letters = base.replace(/[^a-z]/g, "");
  const stem = trimRoot(letters);
  const results = new Map();

  const recipes = [
    () => joinParts(stem, rng.pick(AFFIX_TAIL)),
    () => joinParts(rng.pick(AFFIX_HEAD), letters),
    () => letters.replace(/[aeiou]$/, "") + rng.pick(["a", "e", "o", "ia", "ae"]),
    () => joinParts(stem, rng.pick(SHORT_ROOTS)),
    () => joinParts(rng.pick(SHORT_ROOTS), stem),
    () => letters.slice(0, Math.max(3, letters.length - 2)) + rng.pick(AFFIX_TAIL),
    () => joinParts(letters, rng.pick(["ix", "yn", "ora", "eon"])),
  ];

  let attempts = 0;
  while (results.size < count && attempts < count * 40) {
    const raw = recipes[attempts % recipes.length]();
    attempts += 1;
    if (!raw) continue;
    const candidate = raw.toLowerCase();
    if (candidate === base || results.has(candidate)) continue;
    if (candidate.length < 3 || candidate.length > 18) continue;
    if (!isPronounceable(candidate)) continue;
    if (BLOCKED_SUBSTRINGS.some((blocked) => candidate.includes(blocked))) continue;
    results.set(candidate, decorate(candidate, { style: "remix" }, "remix"));
  }

  return [...results.values()];
}

export function buildCustom({ head = "", core = "", tail = "", tone = "lowercase" }) {
  const rng = createRng(0x5bf03635);
  const joined = joinParts(joinParts(head.toLowerCase(), core.toLowerCase()), tail.toLowerCase());
  const name = applyTone(rng, joined, tone).slice(0, 24);
  return {
    name,
    rarity: name ? rarity(name) : 0,
    flow: name ? flow(name) : 0,
    note: name ? describe(name) : "",
    valid: name.length >= 2 && /^[a-zA-Z][a-zA-Z0-9_]*$/.test(name),
  };
}

export const PRESETS = [
  {
    name: "Gallery",
    desc: "Soft one-word handles that look right in lowercase.",
    config: { style: "aesthetic", minLength: 4, maxLength: 9, structures: ["single", "blend"], tone: "lowercase", allowDigits: false, allowSeparators: false },
  },
  {
    name: "Four letters",
    desc: "The short end of the register, where almost nothing is free.",
    config: { style: "minimal", minLength: 3, maxLength: 5, structures: ["single", "coined"], tone: "lowercase", allowDigits: false, allowSeparators: false },
  },
  {
    name: "Invented",
    desc: "Words that have never existed, built from legal syllables.",
    config: { style: "mythic", minLength: 5, maxLength: 9, structures: ["coined"], tone: "lowercase", allowDigits: false, allowSeparators: false },
  },
  {
    name: "Nightfall",
    desc: "Darker roots, longer vowels, no digits.",
    config: { style: "dark", minLength: 5, maxLength: 11, structures: ["single", "blend", "root-affix"], tone: "lowercase", allowDigits: false, allowSeparators: false },
  },
  {
    name: "Systems",
    desc: "Technical vocabulary for tooling, bots, and side projects.",
    config: { style: "futuristic", minLength: 4, maxLength: 12, structures: ["single", "compound", "root-affix"], tone: "lowercase", allowDigits: false, allowSeparators: false },
  },
  {
    name: "Field notes",
    desc: "Plants, weather, terrain — names that sound lived in.",
    config: { style: "nature", minLength: 4, maxLength: 11, structures: ["single", "blend"], tone: "lowercase", allowDigits: false, allowSeparators: false },
  },
  {
    name: "Competitive",
    desc: "Sharper compounds for tags that have to read at a glance.",
    config: { style: "gaming", minLength: 4, maxLength: 12, structures: ["compound", "root-affix"], tone: "capitalized", allowDigits: false, allowSeparators: false },
  },
  {
    name: "Taken twice over",
    desc: "Longer builds with digits, for platforms where everything is gone.",
    config: { style: "rare", minLength: 6, maxLength: 14, structures: ["blend", "root-affix", "numbered"], tone: "lowercase", allowDigits: true, allowSeparators: false },
  },
];

export const COLLECTIONS = [
  { name: "Rare", config: { style: "rare", minLength: 4, maxLength: 8, structures: ["single", "blend"], tone: "lowercase" } },
  { name: "Three letters", config: { style: "minimal", minLength: 3, maxLength: 3, structures: ["single", "coined"], tone: "lowercase" } },
  { name: "Four letters", config: { style: "minimal", minLength: 4, maxLength: 4, structures: ["single", "coined"], tone: "lowercase" } },
  { name: "Five letters", config: { style: "aesthetic", minLength: 5, maxLength: 5, structures: ["single", "coined", "blend"], tone: "lowercase" } },
  { name: "Invented", config: { style: "mythic", minLength: 5, maxLength: 10, structures: ["coined"], tone: "lowercase" } },
  { name: "Celestial", config: { style: "rare", minLength: 4, maxLength: 11, structures: ["single", "blend", "root-affix"], tone: "lowercase" } },
  { name: "Dark", config: { style: "dark", minLength: 4, maxLength: 11, structures: ["single", "blend"], tone: "lowercase" } },
  { name: "Technical", config: { style: "futuristic", minLength: 4, maxLength: 12, structures: ["single", "compound"], tone: "lowercase" } },
  { name: "Soft", config: { style: "aesthetic", minLength: 4, maxLength: 10, structures: ["single", "root-affix"], tone: "lowercase" } },
  { name: "Outdoors", config: { style: "nature", minLength: 4, maxLength: 11, structures: ["single", "blend"], tone: "lowercase" } },
  { name: "Mythic", config: { style: "mythic", minLength: 5, maxLength: 12, structures: ["single", "blend", "root-affix"], tone: "lowercase" } },
  { name: "With digits", config: { style: "rare", minLength: 5, maxLength: 13, structures: ["numbered"], tone: "lowercase", allowDigits: true } },
];
