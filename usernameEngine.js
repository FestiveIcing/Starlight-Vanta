// Starlight Vanta — local username generation engine (no backend)

const BANKS = {
  aesthetic: ["vanta","lume","mira","aura","halo","sage","wisp","dusk","luna","vela","arc","haze","iris","nyx","opal","silk","tide","ash","cove","fawn","hush","rune","echo","nova","void","frost","ember","dawn","gleam","quill","onyx","velvet","zephyr","solace","willow","cinder","lumen","astra","plume","slate","river","amber","indigo","prism","reverie","silhouette","marble","cobalt","halcyon","aria","eclipse","cosmo","lyric","saffron","tessa","nori","feather","calm","quartz","juno","mauve"],
  dark: ["void","umbra","raven","onyx","dusk","nyx","wraith","shade","obsidian","crypt","hollow","spectre","veil","abyss","hex","phantom","noct","ghoul","malice","ruin","blight","eclipse","inferno","calamity","thorn","wreck","revenant","wound","tomb","grim","ashen","voidborn","noctis","umbra","sable","mourn"],
  futuristic: ["neo","cyber","flux","quantum","vector","axiom","synth","pixel","glitch","circuit","helix","prism","neon","volt","byte","grid","matrix","apex","quark","nexus","sentry","cipher","reactor","plasma","datavault","orb","ion","lambda","delta","signal","protocol","kinetic","vertex","pulse","core","lumen","astro","mech","virt","holo"],
  gaming: ["shadow","blaze","storm","frost","venom","rogue","reaper","titan","phantom","vortex","snipe","clutch","alpha","omega","apex","demon","ghost","slayer","ravage","rampage","berserk","outlaw","havoc","specter","ranger","wreck","saint","venom","crimson","jugg","hex","blade","raze","saber","talon","onyx"],
  soft: ["lily","petal","cloud","mochi","honey","blossom","lunar","soft","dream","feather","velvet","pastel","dawn","dew","calm","milky","cotton","breeze","plum","mint","sprout","glimmer","halcyon","serene","pebble","saffron","peach","coco","hazel","ivy","sugi","fae","aura","lull","dove","wren"],
  rare: ["vex","noa","kai","zen","rio","mae","eli","ove","rae","sao","zil","pyr","orin","ael","syl","vor","thyx","wyn","io","lyr","oz","ure","nyx","vu","qil","xae","zho","mir","ael","cyr","dra","fey","mox","ru","ty","vi","za"],
  minimal: ["no","vo","ae","io","lu","za","mi","ta","el","or","ix","om","vu","ra","en","si","ne","ka","ys","uv","ax","ox","ez","ur","vi","lo","mu","ni","su","te","na","ro","ki","fe"],
  short: ["arc","flux","vex","nyx","vox","zen","halo","echo","nova","axis","kira","lyra","moss","peri","silk","tide","wolf","ash","elm","rune","jade","opal","mira","sage","wisp","onyx","dusk","lume","fawn","hush","cove","dawn","frost","ember","gleam"],
  abstract: ["xyn","vor","thys","aelo","quor","myth","zeph","nyra","volk","syn","oryx","qil","zaro","umb","phy","vael","cron","isca","wren","oxy","zilch","vyn","pyra","myrr","xaro","veli","quill","oryx","zeno","aero","ixen","ovyr","quill"],
};

const PREFIX = ["x","v","neo","void","i","mr","the","lil","real","its","just","only","true","dr","sir","ms","dark","cyber","tox","syn","ax","no","one","go","fae"];
const SUFFIX = ["x","7","404","vx","io","99","_","zx","ex","ox","ae","xd","007","777","13","21","v2","x2","_yt","_ttv"];

export const STYLES = ["rare","aesthetic","minimal","short","dark","futuristic","gaming","clean","abstract","experimental"];
export const STRUCTURES = ["word","word+number","prefix+word","word+suffix","two-word","random","pattern","ultra-short"];
export const MODIFIERS = ["lowercase","uppercase","symmetrical","minimal","cyber","mysterious","soft","elegant","chaotic","futuristic"];
export const BUILDER_TRANSFORMS = ["lowercase","uppercase","alternating","removeVowels","duplicate","leet","addNumbers","separators","reverse","mirror","compact"];

const STYLE_TO_BANK = {
  rare: ["rare","aesthetic","minimal"],
  aesthetic: ["aesthetic","soft"],
  minimal: ["minimal","short"],
  short: ["short","minimal"],
  dark: ["dark","aesthetic"],
  futuristic: ["futuristic","abstract"],
  gaming: ["gaming","futuristic"],
  clean: ["aesthetic","short"],
  abstract: ["abstract","futuristic"],
  experimental: ["abstract","minimal","dark"],
};

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function reverse(s) { return s.split("").reverse().join(""); }
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); }
function shuffleCase(s) { return s.split("").map((c) => (Math.random() < 0.5 ? c.toUpperCase() : c.toLowerCase())).join(""); }
function leet(s) {
  return s.replace(/a/gi, "4").replace(/e/gi, "3").replace(/i/gi, "1").replace(/o/gi, "0").replace(/s/gi, "5").replace(/t/gi, "7");
}
function patternName(len) {
  const v = "aeiou".split("");
  const c = "bcdfghjklmnpqrstvwxyz".split("");
  let s = "";
  for (let i = 0; i < len; i++) s += i % 2 === 0 ? rand(c) : rand(v);
  return s;
}

function applyModifiers(name, mods) {
  let n = name;
  for (const m of mods) {
    switch (m) {
      case "lowercase": n = n.toLowerCase(); break;
      case "uppercase": n = n.toUpperCase(); break;
      case "symmetrical": n = n + reverse(n); break;
      case "minimal": n = n.replace(/[aeiou]/gi, ""); break;
      case "cyber": n = leet(n); break;
      case "mysterious": n = "x" + n + "x"; break;
      case "soft": n = n.toLowerCase(); break;
      case "elegant": n = capitalize(n); break;
      case "chaotic": n = shuffleCase(n); break;
      case "futuristic": n = n.replace(/o/gi, "0").replace(/e/gi, "3").replace(/i/gi, "1"); break;
      default: break;
    }
  }
  return n;
}

function generateOne(config) {
  const banks = STYLE_TO_BANK[config.style] || ["aesthetic"];
  const bank = BANKS[rand(banks)] || BANKS.aesthetic;
  const base = rand(bank);
  let name = base;
  switch (config.structure) {
    case "word": name = base; break;
    case "word+number": name = base + Math.floor(Math.random() * 99); break;
    case "prefix+word": name = rand(PREFIX) + base; break;
    case "word+suffix": name = base + rand(SUFFIX); break;
    case "two-word": name = rand(bank) + rand(["", "o", "x", "a"]) + rand(bank); break;
    case "pattern": name = patternName(3 + Math.floor(Math.random() * 4)); break;
    case "ultra-short": name = base.slice(0, 2 + Math.floor(Math.random() * 2)); break;
    case "random":
      name = base + (Math.random() < 0.5 ? String(Math.floor(Math.random() * 99)) : "") + (Math.random() < 0.25 ? rand(SUFFIX) : "");
      break;
    default: break;
  }
  name = applyModifiers(name, config.modifiers || []);
  return name;
}

function enforceChars(name, config) {
  const c = config.chars;
  let allowed = "";
  if (c.letters) allowed += "a-zA-Z";
  if (c.numbers) allowed += "0-9";
  if (c.underscores) allowed += "_";
  if (c.periods) allowed += "\\.";
  if (c.minimalSymbols && !c.underscores) allowed += "_";
  if (!allowed) allowed = "a-z";
  const re = new RegExp("[^" + allowed + "]", "gi");
  let n = name.replace(re, "");
  if (!c.mixedCase && c.letters) n = n.toLowerCase();
  if (!c.repeatedChars) n = n.replace(/(.)\1{2,}/g, "$1$1");
  return n;
}

export function scoreUsername(name) {
  if (!name) return 40;
  let s = 50;
  const len = name.length;
  if (len <= 4) s += 26;
  else if (len <= 6) s += 22;
  else if (len <= 8) s += 14;
  else if (len <= 11) s += 6;
  else s -= 4;
  const uniq = new Set(name.toLowerCase()).size;
  s += Math.min(uniq * 3, 22);
  if (!/[0-9]/.test(name)) s += 8;
  const vowels = (name.match(/[aeiouAEIOU]/g) || []).length;
  if (len) {
    const vr = vowels / len;
    if (vr > 0.15 && vr < 0.6) s += 6;
  }
  if (/(.)\1{2,}/.test(name)) s -= 8;
  if (/^[a-z]/i.test(name)) s += 2;
  s += Math.floor(Math.random() * 9);
  return Math.max(41, Math.min(99, Math.round(s)));
}

export function generateUsernames(config, count = 12) {
  const [min, max] = config.length;
  const out = new Map();
  let guard = 0;
  const limit = count * 60;
  while (out.size < count && guard < limit) {
    guard++;
    let name = generateOne(config);
    if (!name) continue;
    name = enforceChars(name, config);
    if (name.length > max) name = name.slice(0, max);
    if (name.length < Math.max(2, min)) continue;
    if (!/^[a-z0-9._]+$/i.test(name)) continue;
    const key = name.toLowerCase();
    if (out.has(key)) continue;
    out.set(key, { name, style: config.style, score: scoreUsername(name), structure: config.structure });
  }
  // fallback fill so the UI is never empty
  while (out.size < count) {
    let len = min + Math.floor(Math.random() * Math.max(1, max - min + 1));
    len = Math.min(Math.max(len, 2), max);
    let name = enforceChars(patternName(len), config);
    if (name.length < 2) name = ("aei" + patternName(max)).slice(0, max);
    if (name.length > max) name = name.slice(0, max);
    let key = name.toLowerCase();
    if (out.has(key)) { name = name + Math.floor(Math.random() * 99); key = name.toLowerCase(); }
    out.set(key, { name, style: config.style, score: scoreUsername(name), structure: "pattern" });
    if (guard++ > limit + 80) break;
  }
  return [...out.values()];
}

export function generateRemixes(base, count = 8) {
  base = (base || "").toLowerCase();
  const variants = new Set();
  const fns = [
    () => base,
    () => "x" + base,
    () => base + "x",
    () => base + rand(["7", "404", "vx", "99", "io", "_", "zx"]),
    () => rand(PREFIX) + base,
    () => base + String(Math.floor(Math.random() * 99)),
    () => reverse(base),
    () => leet(base),
    () => base.replace(/[aeiou]/gi, ""),
    () => base.split("").map((c, i) => (i % 2 ? c.toUpperCase() : c.toLowerCase())).join(""),
    () => base.slice(0, Math.ceil(base.length / 2)) + rand(SUFFIX),
    () => base + base.slice(-1),
  ];
  let i = 0;
  while (variants.size < count && i < count * 8) {
    const v = fns[i % fns.length]();
    i++;
    if (v && v.length >= 2 && v.length <= 20 && /^[a-z0-9._]+$/i.test(v)) variants.add(v);
  }
  return [...variants].map((name) => ({ name, style: "remix", score: scoreUsername(name) }));
}

function applyTransform(n, t) {
  switch (t) {
    case "lowercase": return n.toLowerCase();
    case "uppercase": return n.toUpperCase();
    case "alternating": return n.split("").map((c, i) => (i % 2 ? c.toUpperCase() : c.toLowerCase())).join("");
    case "removeVowels": return n.replace(/[aeiou]/gi, "");
    case "duplicate": return n.split("").map((c) => c + c).join("");
    case "leet": return leet(n);
    case "addNumbers": return n + Math.floor(Math.random() * 999);
    case "separators": return n.split("").join("_");
    case "reverse": return reverse(n);
    case "mirror": return n + reverse(n);
    case "compact": return n.replace(/[aeiou_\.\-]/gi, "");
    default: return n;
  }
}

export function buildCustomUsername(prefix = "", core = "", suffix = "", transforms = []) {
  let n = core || "";
  if (prefix) n = prefix + n;
  if (suffix) n = n + suffix;
  for (const t of transforms) n = applyTransform(n, t);
  return n.slice(0, 24);
}

export const DEFAULT_CONFIG = {
  style: "aesthetic",
  length: 12,
  chars: { letters: true, numbers: true, underscores: false, periods: false, mixedCase: false, repeatedChars: false, minimalSymbols: false },
  structure: "word+number",
  modifiers: ["lowercase"],
};

export const PRESETS = [
  { name: "Aesthetic", desc: "Clean, lowercase, gallery-worthy names.", config: { style: "aesthetic", length: 10, chars: { letters: true, numbers: false, underscores: false, periods: false, mixedCase: false, repeatedChars: false, minimalSymbols: false }, structure: "word", modifiers: ["lowercase"] } },
  { name: "Rare & Short", desc: "3–6 character rarities.", config: { style: "rare", length: 6, chars: { letters: true, numbers: false, underscores: false, periods: false, mixedCase: false, repeatedChars: false, minimalSymbols: false }, structure: "word", modifiers: ["lowercase"] } },
  { name: "Dark Cyber", desc: "Leet-tinted, nocturnal handles.", config: { style: "dark", length: 12, chars: { letters: true, numbers: true, underscores: false, periods: false, mixedCase: false, repeatedChars: false, minimalSymbols: false }, structure: "word+number", modifiers: ["cyber"] } },
  { name: "Gaming Tag", desc: "Prefix-loaded competitive tags.", config: { style: "gaming", length: 12, chars: { letters: true, numbers: true, underscores: false, periods: false, mixedCase: false, repeatedChars: false, minimalSymbols: false }, structure: "prefix+word", modifiers: ["lowercase"] } },
  { name: "Minimal", desc: "Two-to-five character essentials.", config: { style: "minimal", length: 5, chars: { letters: true, numbers: false, underscores: false, periods: false, mixedCase: false, repeatedChars: false, minimalSymbols: false }, structure: "ultra-short", modifiers: ["lowercase"] } },
  { name: "Futuristic", desc: "Neon, protocol, circuit vibes.", config: { style: "futuristic", length: 12, chars: { letters: true, numbers: true, underscores: false, periods: false, mixedCase: false, repeatedChars: false, minimalSymbols: false }, structure: "prefix+word", modifiers: ["futuristic"] } },
  { name: "Soft & Dreamy", desc: "Gentle, pastel, lowercase.", config: { style: "soft", length: 10, chars: { letters: true, numbers: false, underscores: false, periods: false, mixedCase: false, repeatedChars: false, minimalSymbols: false }, structure: "word", modifiers: ["soft"] } },
  { name: "Abstract", desc: "CVCV patterns.", config: { style: "abstract", length: 8, chars: { letters: true, numbers: false, underscores: false, periods: false, mixedCase: false, repeatedChars: false, minimalSymbols: false }, structure: "pattern", modifiers: ["lowercase"] } },
  { name: "Experimental", desc: "Chaotic case, mixed everything.", config: { style: "experimental", length: 12, chars: { letters: true, numbers: true, underscores: false, periods: false, mixedCase: true, repeatedChars: true, minimalSymbols: false }, structure: "random", modifiers: ["chaotic"] } },
  { name: "Numbered", desc: "Word + clean numeric suffix.", config: { style: "aesthetic", length: 10, chars: { letters: true, numbers: true, underscores: false, periods: false, mixedCase: false, repeatedChars: false, minimalSymbols: false }, structure: "word+number", modifiers: ["lowercase"] } },
];

export const EXPLORE_PRESETS = {
  "Rare": { style: "rare", length: [3, 7], chars: { letters: true, numbers: false, underscores: false, periods: false, mixedCase: false, repeatedChars: false, minimalSymbols: false }, structure: "word", modifiers: ["lowercase"] },
  "4 Letter": { style: "rare", length: [4, 4], chars: { letters: true, numbers: false, underscores: false, periods: false, mixedCase: false, repeatedChars: false, minimalSymbols: false }, structure: "word", modifiers: ["lowercase"] },
  "5 Letter": { style: "aesthetic", length: [5, 5], chars: { letters: true, numbers: false, underscores: false, periods: false, mixedCase: false, repeatedChars: false, minimalSymbols: false }, structure: "word", modifiers: ["lowercase"] },
  "Minimal": { style: "minimal", length: [2, 5], chars: { letters: true, numbers: false, underscores: false, periods: false, mixedCase: false, repeatedChars: false, minimalSymbols: false }, structure: "ultra-short", modifiers: ["lowercase"] },
  "Dark": { style: "dark", length: [4, 10], chars: { letters: true, numbers: false, underscores: false, periods: false, mixedCase: false, repeatedChars: false, minimalSymbols: false }, structure: "word", modifiers: ["lowercase"] },
  "Cyber": { style: "futuristic", length: [4, 12], chars: { letters: true, numbers: true, underscores: false, periods: false, mixedCase: false, repeatedChars: false, minimalSymbols: false }, structure: "word+number", modifiers: ["cyber"] },
  "Soft": { style: "soft", length: [4, 10], chars: { letters: true, numbers: false, underscores: false, periods: false, mixedCase: false, repeatedChars: false, minimalSymbols: false }, structure: "word", modifiers: ["soft"] },
  "Futuristic": { style: "futuristic", length: [4, 12], chars: { letters: true, numbers: true, underscores: false, periods: false, mixedCase: false, repeatedChars: false, minimalSymbols: false }, structure: "prefix+word", modifiers: ["futuristic"] },
  "One-word": { style: "aesthetic", length: [5, 9], chars: { letters: true, numbers: false, underscores: false, periods: false, mixedCase: false, repeatedChars: false, minimalSymbols: false }, structure: "word", modifiers: ["lowercase"] },
  "Abstract": { style: "abstract", length: [4, 9], chars: { letters: true, numbers: false, underscores: false, periods: false, mixedCase: false, repeatedChars: false, minimalSymbols: false }, structure: "pattern", modifiers: ["lowercase"] },
  "Numbers": { style: "short", length: [4, 10], chars: { letters: true, numbers: true, underscores: false, periods: false, mixedCase: false, repeatedChars: false, minimalSymbols: false }, structure: "word+number", modifiers: ["lowercase"] },
  "Symbols": { style: "aesthetic", length: [5, 12], chars: { letters: true, numbers: true, underscores: true, periods: false, mixedCase: false, repeatedChars: false, minimalSymbols: true }, structure: "word+suffix", modifiers: ["lowercase"] },
  "Experimental": { style: "experimental", length: [4, 12], chars: { letters: true, numbers: true, underscores: false, periods: false, mixedCase: true, repeatedChars: true, minimalSymbols: false }, structure: "random", modifiers: ["chaotic"] },
};