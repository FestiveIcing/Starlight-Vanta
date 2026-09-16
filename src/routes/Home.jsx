import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import Seo from "../components/Seo";
import NameChip from "../components/NameChip";
import { COLLECTIONS, generate, generateFromSeed } from "../lib/engine";
import { useVanta } from "../state/VantaContext";
import { useLocalState } from "../lib/storage";
import { cn, formatCount } from "../lib/utils";

const SEED_EXAMPLES = ["ember", "atlas", "koi", "vesper", "moss", "orbit"];

const FAQ = [
  {
    q: "Where does the generation actually happen?",
    a: "In the tab you have open. The vocabulary, the phonotactic rules and the scoring all ship as part of the page, so a name exists on your machine and nowhere else. There is no generation endpoint to call.",
  },
  {
    q: "Are the names checked against real platforms?",
    a: "No. Checking availability would mean sending every candidate to Instagram, Discord or Steam on your behalf, which is exactly the traffic this site is built to avoid. Copy a name you like and check it yourself.",
  },
  {
    q: "What do the two numbers mean?",
    a: "Rarity comes from length, letter frequency and character variety — short names made of uncommon letters score highest. Flow measures how readable the result is out loud. A name can be rare and unreadable, so both are shown rather than averaged into one score.",
  },
  {
    q: "Is anything saved about me?",
    a: "Saved names, history and settings live in your browser's local storage and are never transmitted. The only thing that reaches the server is a count of how many names were produced, with no identifier attached, and you can switch that off in Settings.",
  },
];

function useCountUp(target, enabled) {
  const [value, setValue] = useState(target);
  const previous = useRef(target);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      previous.current = target;
      return undefined;
    }
    const from = previous.current;
    previous.current = target;
    if (from === target) return undefined;

    const start = performance.now();
    const duration = 700;
    let frame;
    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, enabled]);

  return value;
}

/* The hero is the tool, not a picture of the tool: type a word, names appear. */
function Hero() {
  const { reduceMotion } = useVanta();
  const [word, setWord] = useState("");
  const [placeholder, setPlaceholder] = useState(SEED_EXAMPLES[0]);
  const [nudge, setNudge] = useState(0);

  useEffect(() => {
    if (word || reduceMotion) return undefined;
    const timer = setInterval(() => {
      setPlaceholder(SEED_EXAMPLES[Math.floor(Math.random() * SEED_EXAMPLES.length)]);
    }, 2600);
    return () => clearInterval(timer);
  }, [word, reduceMotion]);

  const active = word.trim().length >= 2 ? word.trim() : placeholder;

  const results = useMemo(
    () => generateFromSeed(active, { style: "aesthetic" }, 6, 4177 + nudge),
    [active, nudge]
  );

  return (
    <section className="flex flex-col items-center gap-7 pt-4 text-center">
      <motion.h1
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl"
      >
        Find a name{" "}
        <span className="bg-gradient-to-r from-violet-400 to-fuchsia-300 bg-clip-text text-transparent">
          worth keeping.
        </span>
      </motion.h1>

      <p className="max-w-lg text-pretty text-sm leading-relaxed text-white/55 sm:text-base">
        Start with a word that already means something to you. Vanta builds around it using phonetic
        rules, then scores what survives.
      </p>

      <div className="w-full max-w-xl">
        <div className="flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] p-2 backdrop-blur-xl transition-colors focus-within:border-violet-400/50">
          <input
            value={word}
            onChange={(event) => setWord(event.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 14))}
            placeholder={placeholder}
            aria-label="A word to build names around"
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-base text-white outline-none placeholder:text-white/25 sm:text-lg"
          />
          <button
            type="button"
            onClick={() => setNudge((value) => value + 1)}
            className="shrink-0 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500"
          >
            Again
          </button>
        </div>

        <div className="mt-4 flex min-h-[76px] flex-wrap items-start justify-center gap-2">
          {results.map((item) => (
            <NameChip key={item.name} name={item.name} rarity={item.rarity} size="lg" />
          ))}
        </div>

        {!word && (
          <p className="mt-1 text-[11px] text-white/25">
            Showing names built from “{placeholder}”. Type your own above.
          </p>
        )}
      </div>

      <Link
        to="/generator"
        className="group flex items-center gap-1.5 text-sm text-white/55 transition-colors hover:text-white"
      >
        Or open the full generator
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </section>
  );
}

/* A worked example beats three abstract "how it works" cards. */
function WorkedExample() {
  const steps = [
    { label: "Two roots", value: "lumen · nova", note: "Drawn from the celestial register." },
    { label: "Shared seam", value: "lume(n)(n)ova", note: "The repeated n collapses instead of doubling." },
    { label: "Filtered", value: "lumenova", note: "Vowel ratio 0.50, no consonant cluster, not an English word." },
    { label: "Scored", value: "rarity 64 · flow 96", note: "Deterministic — this name always scores the same." },
  ];

  return (
    <section className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:items-center">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          It builds names. It doesn't staple numbers to words.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-white/50">
          Every candidate passes through the same four steps. Anything that fails one is thrown away
          and rebuilt rather than trimmed to fit, which is why you never see a name cut off halfway
          through a syllable.
        </p>
        <Link
          to="/collections"
          className="group mt-6 inline-flex items-center gap-1.5 text-sm text-violet-300 transition-colors hover:text-violet-200"
        >
          See it across twelve collections
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      <ol className="relative flex flex-col gap-0 border-l border-white/10 pl-6">
        {steps.map((step, index) => (
          <li key={step.label} className="relative pb-6 last:pb-0">
            <span className="absolute -left-[26px] top-1 h-2 w-2 rounded-full bg-violet-400/70 ring-4 ring-[#050505]" />
            <p className="text-[10px] uppercase tracking-widest text-white/30">
              {String(index + 1).padStart(2, "0")} · {step.label}
            </p>
            <p className="mt-1 font-mono text-lg text-white">{step.value}</p>
            <p className="mt-1 text-xs leading-relaxed text-white/40">{step.note}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function KeepOrPass() {
  const [profile, setProfile] = useLocalState("vanta.taste", { kept: [], passed: 0 });
  const [pool, setPool] = useState([]);
  const [index, setIndex] = useState(0);
  const { toggleFavorite, isFavorite, reduceMotion } = useVanta();

  const refill = useCallback(() => {
    const styles = ["aesthetic", "rare", "dark", "futuristic", "nature", "mythic", "minimal"];
    const batch = styles.flatMap((style) =>
      generate({ style, minLength: 4, maxLength: 10, structures: ["single", "blend", "root-affix", "coined"] }, 3)
    );
    setPool(batch.sort(() => Math.random() - 0.5));
    setIndex(0);
  }, []);

  useEffect(() => {
    refill();
  }, [refill]);

  const current = pool[index];
  const seen = profile.kept.length + profile.passed;

  const leaning = useMemo(() => {
    const tally = {};
    for (const entry of profile.kept) tally[entry.style] = (tally[entry.style] || 0) + 1;
    const ranked = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    return ranked.length ? ranked[0][0] : null;
  }, [profile.kept]);

  function judge(keep) {
    if (!current) return;
    if (keep) {
      if (!isFavorite(current.name)) toggleFavorite(current);
      setProfile((prev) => ({ ...prev, kept: [...prev.kept, { name: current.name, style: current.style }].slice(-40) }));
    } else {
      setProfile((prev) => ({ ...prev, passed: prev.passed + 1 }));
    }
    if (index + 1 >= pool.length) refill();
    else setIndex(index + 1);
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent">
      <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-violet-300/60">Keep or pass</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            Not sure what you're after?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/50">
            Judge a handful of names and the site works out which register you actually respond to,
            then hands the generator over already tuned. Everything you keep is bookmarked.
          </p>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex gap-1" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, dot) => (
                <span
                  key={dot}
                  className={cn(
                    "h-1.5 w-6 rounded-full transition-colors",
                    dot < Math.min(seen, 5) ? "bg-violet-400/80" : "bg-white/10"
                  )}
                />
              ))}
            </div>
            <span className="text-[11px] text-white/30">
              {seen} judged · {profile.kept.length} kept
            </span>
          </div>

          {leaning && (
            <Link
              to={`/generator?style=${leaning}`}
              className="group mt-4 inline-flex items-center gap-1.5 text-sm text-violet-300 hover:text-violet-200"
            >
              You lean {leaning} — open the generator
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex min-h-[112px] items-center justify-center rounded-2xl border border-white/10 bg-black/40 px-6">
            <motion.p
              key={current?.name}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="break-all text-center font-mono text-3xl text-white sm:text-4xl"
            >
              {current?.name ?? "…"}
            </motion.p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => judge(false)}
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] py-3 text-sm text-white/55 transition-colors hover:bg-white/[0.07] hover:text-white active:scale-[0.98]"
            >
              Pass
            </button>
            <button
              type="button"
              onClick={() => judge(true)}
              className="flex-1 rounded-xl bg-violet-600 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-500 active:scale-[0.98]"
            >
              Keep
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CollectionPreview() {
  const [active, setActive] = useState(COLLECTIONS[0].name);
  const preview = useMemo(() => {
    const collection = COLLECTIONS.find((entry) => entry.name === active) || COLLECTIONS[0];
    return generate(collection.config, 6, 20260916);
  }, [active]);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Collections</h2>
        <Link to="/collections" className="shrink-0 text-xs text-violet-300 hover:text-violet-200">
          Open all twelve →
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {COLLECTIONS.map((collection) => (
          <button
            key={collection.name}
            type="button"
            onMouseEnter={() => setActive(collection.name)}
            onFocus={() => setActive(collection.name)}
            onClick={() => setActive(collection.name)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors duration-200",
              active === collection.name
                ? "border-violet-400/50 bg-violet-500/15 text-violet-100"
                : "border-white/10 text-white/45 hover:border-white/25 hover:text-white/85"
            )}
          >
            {collection.name}
          </button>
        ))}
      </div>

      <div className="flex min-h-[44px] flex-wrap gap-2">
        {preview.map((item) => (
          <NameChip key={item.name} name={item.name} rarity={item.rarity} />
        ))}
      </div>
    </section>
  );
}

function Numbers() {
  const { stats, statsLoaded, reduceMotion } = useVanta();
  const total = useCountUp(stats.total, statsLoaded && !reduceMotion);

  const rows = [
    { label: "Names generated, all time", value: formatCount(total), note: `includes a disclosed ${formatCount(stats.baseline)} baseline` },
    { label: "Generated today", value: formatCount(stats.today), note: "resets at midnight UTC" },
    { label: "Generated this week", value: formatCount(stats.week), note: "rolling seven days" },
    { label: "Busiest register this week", value: stats.styles?.[0]?.style || "—", note: stats.configured ? "across all visitors" : "counter warming up" },
  ];

  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">By the numbers</h2>
      <dl className="grid grid-cols-1 border-t border-white/[0.08] sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((row) => (
          <div key={row.label} className="border-b border-white/[0.08] px-1 py-5 sm:border-r sm:last:border-r-0 sm:pl-0 sm:pr-6 lg:pl-6 lg:first:pl-0">
            <dd className="font-mono text-3xl tabular-nums text-white">{row.value}</dd>
            <dt className="mt-2 text-xs text-white/55">{row.label}</dt>
            <p className="mt-0.5 text-[11px] text-white/25">{row.note}</p>
          </div>
        ))}
      </dl>
      <p className="text-[11px] text-white/25">
        The counter records a number and a register name. No identifiers, no cookies, no IP logging —
        and you can opt out entirely in{" "}
        <Link to="/settings" className="text-white/40 underline underline-offset-2 hover:text-white">
          Settings
        </Link>
        .
      </p>
    </section>
  );
}

function Questions() {
  const [open, setOpen] = useState(0);

  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Questions</h2>
      <div className="border-t border-white/[0.08]">
        {FAQ.map((item, index) => (
          <div key={item.q} className="border-b border-white/[0.08]">
            <button
              type="button"
              onClick={() => setOpen(open === index ? -1 : index)}
              aria-expanded={open === index}
              className="flex w-full items-center justify-between gap-6 py-4 text-left"
            >
              <span className="text-sm text-white/85">{item.q}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-white/30 transition-transform duration-300",
                  open === index && "rotate-180"
                )}
              />
            </button>
            {open === index && (
              <p className="max-w-2xl pb-5 text-xs leading-relaxed text-white/45">{item.a}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const faqSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    }),
    []
  );

  return (
    <div className="flex flex-col gap-24">
      <Seo path="/" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Hero />
      <WorkedExample />
      <KeepOrPass />
      <CollectionPreview />
      <Numbers />
      <Questions />

      <section className="flex flex-col items-start justify-between gap-5 border-t border-white/[0.08] pt-10 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-medium text-white">Free, no accounts, no advertising.</h2>
          <p className="mt-1 max-w-lg text-xs leading-relaxed text-white/45">
            If Vanta saved you an afternoon of refreshing a sign-up form, a one-off contribution
            covers the hosting.
          </p>
        </div>
        <Link
          to="/donate"
          className="shrink-0 rounded-full border border-violet-400/40 bg-violet-500/10 px-5 py-2.5 text-sm text-violet-100 transition-colors hover:bg-violet-500/20"
        >
          Donate
        </Link>
      </section>
    </div>
  );
}
