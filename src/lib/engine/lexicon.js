export const REGISTERS = {
  celestial: [
    "astra", "aurora", "caelum", "cosmo", "eclipse", "elara", "halcyon", "helio",
    "lumen", "luna", "lyra", "meridian", "nebula", "nova", "orion", "polaris",
    "solace", "solstice", "stellar", "vega", "vesper", "zenith", "zodia",
  ],
  mineral: [
    "alabaster", "amber", "basalt", "cinnabar", "cobalt", "garnet", "graphite",
    "jasper", "lazuli", "marble", "obsidian", "onyx", "opal", "porcelain",
    "quartz", "selenite", "silica", "slate", "topaz",
  ],
  nature: [
    "alder", "arbor", "bracken", "cinder", "clover", "dune", "ember", "fennel",
    "fern", "glacier", "grove", "harbor", "heather", "juniper", "laurel",
    "meadow", "monsoon", "moss", "reed", "sable", "saffron", "sequoia",
    "sorrel", "thistle", "tundra", "verdant", "willow",
  ],
  weather: [
    "aether", "cirrus", "drizzle", "frost", "gale", "haze", "monsoon", "nimbus",
    "solstice", "squall", "tempest", "thaw", "tide", "vapor", "zephyr",
  ],
  dark: [
    "ashen", "cinder", "crypt", "dusk", "eclipse", "ember", "hollow", "mourn",
    "noctis", "obsidian", "penumbra", "raven", "requiem", "sable", "shroud",
    "sorrow", "specter", "umbra", "vesper", "void", "wraith",
  ],
  soft: [
    "aria", "bloom", "cameo", "cashmere", "chiffon", "cocoa", "cotton", "dew",
    "eden", "feather", "halo", "honey", "lilac", "linen", "lull", "mellow",
    "mochi", "muslin", "pastel", "petal", "plume", "satin", "sorbet", "velvet",
  ],
  technical: [
    "apex", "axiom", "beacon", "cipher", "circuit", "delta", "helix", "index",
    "kernel", "kinetic", "lattice", "lumen", "matrix", "nexus", "orbit",
    "parallax", "photon", "prism", "protocol", "quantum", "relay", "signal",
    "vector", "vertex", "vortex",
  ],
  mythic: [
    "aegis", "alchemy", "auspex", "chimera", "daedal", "elysium", "erebus",
    "hydra", "icarus", "kraken", "labyrinth", "myrrh", "oracle", "phoenix",
    "reverie", "seraph", "sibyl", "thalia", "valkyr", "wyvern",
  ],
  motion: [
    "arc", "cascade", "drift", "echo", "flux", "glide", "lapse", "orbit",
    "pivot", "pulse", "ripple", "surge", "sway", "trace", "veer", "wander",
  ],
};

export const SHORT_ROOTS = [
  "arc", "ash", "aur", "cael", "cove", "dusk", "elm", "fay", "flux", "glen",
  "haze", "iris", "jade", "kai", "lark", "lume", "lux", "mira", "moss", "nyx",
  "onyx", "opal", "quill", "reef", "rune", "sage", "sol", "tide", "vale",
  "vane", "vega", "veil", "vex", "wisp", "wren", "wyn", "yew", "zeph",
];

export const AFFIX_HEAD = [
  "aer", "ala", "cel", "cin", "cyr", "del", "ely", "eve", "hal", "ilo",
  "kal", "lue", "mar", "nol", "oro", "ryl", "sel", "ter", "val", "ver",
];

export const AFFIX_TAIL = [
  "ara", "ael", "eon", "era", "ia", "ine", "ion", "ira", "is", "ith",
  "ix", "lyn", "ona", "ora", "ox", "ris", "ryn", "sen", "ven", "yn",
];

export const REGISTER_WEIGHTS = {
  rare: { mineral: 2, mythic: 3, celestial: 2, motion: 1 },
  aesthetic: { soft: 3, nature: 2, mineral: 2, celestial: 2 },
  minimal: { motion: 3, nature: 1, mineral: 1 },
  clean: { nature: 3, weather: 2, soft: 2, motion: 1 },
  dark: { dark: 4, mineral: 2, mythic: 1 },
  futuristic: { technical: 4, celestial: 2, motion: 1 },
  gaming: { technical: 2, dark: 3, mythic: 2, motion: 1 },
  nature: { nature: 4, weather: 2, soft: 1 },
  mythic: { mythic: 4, celestial: 2, dark: 1 },
  experimental: { technical: 1, mythic: 1, dark: 1, motion: 1, mineral: 1 },
};

export const STYLES = Object.keys(REGISTER_WEIGHTS);

export const STRUCTURES = [
  "single",
  "blend",
  "root-affix",
  "coined",
  "compound",
  "numbered",
];

export const STRUCTURE_LABELS = {
  single: "One word",
  blend: "Blended",
  "root-affix": "Root + ending",
  coined: "Invented",
  compound: "Compound",
  numbered: "With digits",
};

export const TONES = ["lowercase", "capitalized", "condensed", "spaced"];

export const TONE_LABELS = {
  lowercase: "all lowercase",
  capitalized: "Capitalised",
  condensed: "no vowel endings",
  spaced: "with separator",
};

// Anything that could read as a slur, a real-world brand, or an obvious
// impersonation risk is filtered out before a name is ever shown.
export const BLOCKED_SUBSTRINGS = [
  "admin", "anal", "cunt", "fuck", "hitler", "kill", "nazi", "nigg", "porn",
  "rape", "sex", "shit", "slut", "support", "twat", "official", "verified",
];

export const NUMBER_SUFFIXES = [
  "01", "07", "09", "11", "13", "21", "22", "33", "44", "77", "88", "99",
  "100", "111", "202", "303", "404", "808", "909",
];
