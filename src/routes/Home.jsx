import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Seo from "../components/Seo";
import SpecimenRow from "../components/SpecimenRow";
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

function Eyebrow({ children }) {
  return (
    <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-white/30">
      <span className="h-px w-6 bg-white/20" />
      {children}
    </p>
  );
}

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
    let frame;
    const step = (now) => {
      const progress = Math.min(1, (now - start) / 700);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, enabled]);

  return value;
}

function Hero() {
  const { reduceMotion } = useVanta();
  const [word, setWord] = useState("");
  const [placeholder, setPlaceholder] = useState(SEED_EXAMPLES[0]);
  const [nudge, setNudge] = useState(0);

  useEffect(() => {
    if (word || reduceMotion) return undefined;
    const timer = setInterval(() => {
      setPlaceholder(SEED_EXAMPLES[Math.floor(Math.random() * SEED_EXAMPLES.length)]);
    }, 2800);
    return () => clearInterval(timer);
  }, [word, reduceMotion]);

  const active = word.trim().length >= 2 ? word.trim() : placeholder;
  const results = useMemo(
    () => generateFromSeed(active, { style: "aesthetic" }, 7, 4177 + nudge),
    [active, nudge]
  );

  return (
    <section className="grid items-start gap-12 pt-2 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
      <div className="flex flex-col gap-7">
        <Eyebrow>Username generator</Eyebrow>

        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="display text-[clamp(2.75rem,7vw,4.75rem)] text-white"
        >
          Find a name
          <br />
          <span className="italic text-white/70">worth keeping.</span>
        </motion.h1>

        <p className="max-w-md text-pretty text-sm leading-relaxed text-white/50">
          Start with a word that already means something to you. Vanta builds around it using
          phonetic rules, then scores what survives.
        </p>

        <div className="flex max-w-md items-center gap-2 border-b border-white/15 pb-2 transition-colors focus-within:border-white/40">
          <input
            value={word}
            onChange={(event) => setWord(event.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 14))}
            placeholder={placeholder}
            aria-label="A word to build names around"
            className="min-w-0 flex-1 bg-transparent py-2 font-mono text-xl text-white outline-none placeholder:text-white/20"
          />
          <button
            type="button"
            onClick={() => setNudge((value) => value + 1)}
            className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-white/35 transition-colors hover:text-white"
          >
            Again
          </button>
        </div>

        <Link
          to="/generator"
          className="group inline-flex w-fit items-center gap-2 text-sm text-white/55 transition-colors hover:text-white"
        >
          Open the full generator
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="lg:pt-10">
        <div className="mb-1 flex items-baseline justify-between">
          <Eyebrow>Built from “{active}”</Eyebrow>
          <span className="font-mono text-[10px] text-white/20">rarity</span>
        </div>
        <div className="border-t border-white/[0.07]">
          {results.map((item) => (
            <SpecimenRow key={item.name} name={item.name} rarity={item.rarity} note={item.note} />
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkedExample() {
  const steps = [
    { label: "Two roots", value: "lumen · nova", note: "Drawn from the celestial register." },
    { label: "Shared seam", value: "lume(n)(n)ova", note: "The repeated n collapses instead of doubling." },
    { label: "Filtered", value: "lumenova", note: "Vowel ratio 0.50, no consonant cluster, not an English word." },
    { label: "Scored", value: "rarity 64 · flow 96", note: "Deterministic — this name always scores the same." },
  ];

  return (
    <section className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
      <div className="flex flex-col gap-5">
        <Eyebrow>The method</Eyebrow>
        <h2 className="display text-[clamp(1.9rem,3.4vw,2.9rem)] text-white">
          It builds names.
          <br />
          <span className="italic text-white/60">It doesn't staple digits to words.</span>
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-white/45">
          Every candidate passes the same four steps. Anything that fails one is thrown away and
          rebuilt rather than trimmed to fit, which is why you never see a name cut off halfway
          through a syllable.
        </p>
      </div>

      <ol className="flex flex-col border-t border-white/[0.07]">
        {steps.map((step, index) => (
          <li key={step.label} className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-white/[0.07] py-5">
            <span className="font-mono text-xs text-white/20">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">{step.label}</p>
              <p className="mt-1.5 font-mono text-lg text-white">{step.value}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/40">{step.note}</p>
            </div>
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
    <section className="grid items-center gap-12 border-y border-white/[0.07] py-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
      <div className="flex flex-col gap-5">
        <Eyebrow>Keep or pass</Eyebrow>
        <h2 className="display text-[clamp(1.9rem,3.4vw,2.9rem)] text-white">
          Not sure what
          <br />
          <span className="italic text-white/60">you're after?</span>
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-white/45">
          Judge a handful and the site works out which register you respond to, then hands the
          generator over already tuned. Everything you keep is bookmarked.
        </p>

        <div className="flex items-center gap-4">
          <div className="flex gap-1" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, dot) => (
              <span
                key={dot}
                className={cn(
                  "h-px w-7 transition-colors",
                  dot < Math.min(seen, 5) ? "bg-white/70" : "bg-white/15"
                )}
              />
            ))}
          </div>
          <span className="text-[11px] text-white/25">
            {seen} judged · {profile.kept.length} kept
          </span>
        </div>

        {leaning && (
          <Link
            to={`/generator?style=${leaning}`}
            className="group inline-flex w-fit items-center gap-2 text-sm text-white/70 hover:text-white"
          >
            You lean {leaning} — open the generator
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex min-h-[132px] items-center justify-center border-y border-white/[0.07] px-6">
          <motion.p
            key={current?.name}
            initial={reduceMotion ? false : { opacity: 0, y: 5 }}
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
            className="flex-1 border border-white/12 py-3 text-xs uppercase tracking-[0.18em] text-white/45 transition-colors hover:border-white/30 hover:text-white"
          >
            Pass
          </button>
          <button
            type="button"
            onClick={() => judge(true)}
            className="flex-1 border border-white/70 bg-white py-3 text-xs uppercase tracking-[0.18em] text-black transition-colors hover:bg-white/85"
          >
            Keep
          </button>
        </div>
      </div>
    </section>
  );
}

function CollectionPreview() {
  const [active, setActive] = useState(COLLECTIONS[0].name);
  const preview = useMemo(() => {
    const collection = COLLECTIONS.find((entry) => entry.name === active) || COLLECTIONS[0];
    return generate(collection.config, 7, 20260916);
  }, [active]);

  return (
    <section className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
      <div className="flex flex-col gap-5">
        <Eyebrow>Collections</Eyebrow>
        <h2 className="display text-[clamp(1.9rem,3.4vw,2.9rem)] text-white">
          Twelve ways in.
        </h2>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {COLLECTIONS.map((collection) => (
            <button
              key={collection.name}
              type="button"
              onMouseEnter={() => setActive(collection.name)}
              onFocus={() => setActive(collection.name)}
              onClick={() => setActive(collection.name)}
              className={cn(
                "text-sm transition-colors",
                active === collection.name
                  ? "text-white underline decoration-white/30 underline-offset-4"
                  : "text-white/35 hover:text-white/70"
              )}
            >
              {collection.name}
            </button>
          ))}
        </div>
        <Link to="/collections" className="group mt-1 inline-flex w-fit items-center gap-2 text-sm text-white/55 hover:text-white">
          Open all twelve
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="border-t border-white/[0.07]">
        {preview.map((item) => (
          <SpecimenRow key={item.name} name={item.name} rarity={item.rarity} note={item.note} />
        ))}
      </div>
    </section>
  );
}

function Numbers() {
  const { stats, statsLoaded, reduceMotion } = useVanta();
  const total = useCountUp(stats.total, statsLoaded && !reduceMotion);

  const rows = [
    { value: formatCount(total), label: "Names generated", note: `includes a disclosed ${formatCount(stats.baseline)} baseline` },
    { value: formatCount(stats.today), label: "Today", note: "resets at midnight UTC" },
    { value: formatCount(stats.week), label: "This week", note: "rolling seven days" },
    { value: stats.styles?.[0]?.style || "—", label: "Busiest register", note: stats.configured ? "across all visitors" : "counter warming up" },
  ];

  return (
    <section className="flex flex-col gap-8">
      <Eyebrow>By the numbers</Eyebrow>
      <dl className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
        {rows.map((row) => (
          <div key={row.label}>
            <dd className="display text-[clamp(2rem,4vw,3.25rem)] text-white">{row.value}</dd>
            <dt className="mt-2 border-t border-white/[0.07] pt-2 text-xs text-white/50">{row.label}</dt>
            <p className="mt-0.5 text-[11px] text-white/25">{row.note}</p>
          </div>
        ))}
      </dl>
      <p className="max-w-xl text-[11px] leading-relaxed text-white/25">
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
    <section className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
      <div className="flex flex-col gap-5">
        <Eyebrow>Questions</Eyebrow>
        <h2 className="display text-[clamp(1.9rem,3.4vw,2.9rem)] text-white">
          The honest answers.
        </h2>
      </div>

      <div className="border-t border-white/[0.07]">
        {FAQ.map((item, index) => (
          <div key={item.q} className="border-b border-white/[0.07]">
            <button
              type="button"
              onClick={() => setOpen(open === index ? -1 : index)}
              aria-expanded={open === index}
              className="flex w-full items-center justify-between gap-6 py-4 text-left"
            >
              <span className="text-sm text-white/85">{item.q}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-white/25 transition-transform duration-300",
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
    <div className="flex flex-col gap-24 sm:gap-28">
      <Seo path="/" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Hero />
      <WorkedExample />
      <KeepOrPass />
      <CollectionPreview />
      <Numbers />
      <Questions />

      <section className="flex flex-col items-start justify-between gap-6 border-t border-white/[0.07] pt-10 sm:flex-row sm:items-end">
        <div>
          <h2 className="display text-[clamp(1.5rem,2.6vw,2.1rem)] text-white">
            Free, no accounts, no advertising.
          </h2>
          <p className="mt-2 max-w-md text-xs leading-relaxed text-white/45">
            If Vanta saved you an afternoon of refreshing a sign-up form, a one-off contribution
            covers the hosting.
          </p>
        </div>
        <Link
          to="/donate"
          className="group inline-flex shrink-0 items-center gap-2 border-b border-white/25 pb-1 text-sm text-white/80 transition-colors hover:border-white hover:text-white"
        >
          Donate
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </section>
    </div>
  );
}
