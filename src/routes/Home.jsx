import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, Copy, Sparkles } from "lucide-react";
import Seo from "../components/Seo";
import GlassPanel from "../components/GlassPanel";
import Field from "../components/Field";
import ResultCard from "../components/ResultCard";
import { generate, generateFromSeed, PRESETS } from "../lib/engine";
import { useVanta } from "../state/VantaContext";
import { useLocalState } from "../lib/storage";
import { formatCount } from "../lib/utils";

const FAQ = [
  {
    q: "Where does the generation actually happen?",
    a: "In the tab you have open. The word banks, the phonotactic rules and the scoring all ship as part of the page, so a name exists on your machine and nowhere else. There is no generation endpoint to call.",
  },
  {
    q: "Are the names checked against real platforms?",
    a: "No. Checking availability would mean sending every candidate to Instagram, Discord or Steam on your behalf, which is exactly the kind of traffic this site is built to avoid. Copy a name you like and check it yourself.",
  },
  {
    q: "What do the two meters mean?",
    a: "Rarity is a function of length, letter frequency and character variety — short names made of uncommon letters score highest. Flow measures how readable the result is out loud: vowel balance, consonant clusters and syllable alternation. A name can be rare and unreadable, so both are shown.",
  },
  {
    q: "Is anything saved about me?",
    a: "Saved names, history and settings live in your browser's local storage and are never transmitted. The only thing that reaches the server is a count of how many names were produced, with no identifier attached, and you can switch that off in Settings.",
  },
];

function useCountUp(target, enabled) {
  const [value, setValue] = useState(target);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return undefined;
    }
    const start = performance.now();
    const from = 0;
    const duration = 900;
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

function Stat({ label, value, hint }) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4">
      <span className="font-mono text-2xl tabular-nums text-white sm:text-3xl">{value}</span>
      <span className="text-xs text-white/55">{label}</span>
      {hint && <span className="text-[11px] text-white/25">{hint}</span>}
    </div>
  );
}

function TasteTest() {
  const [profile, setProfile] = useLocalState("vanta.taste", { kept: [], passed: 0 });
  const [pool, setPool] = useState([]);
  const [index, setIndex] = useState(0);
  const { toggleFavorite, isFavorite } = useVanta();

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

  const seen = profile.kept.length + profile.passed;

  return (
    <GlassPanel className="flex flex-col gap-5 p-6">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-white/35">Keep or pass</p>
        <p className="mt-1 text-sm text-white/50">
          Judge a few names and the site works out which register you actually like.
        </p>
      </div>

      <div className="flex min-h-[72px] items-center justify-center rounded-xl border border-white/10 bg-black/30 px-4">
        <motion.p key={current?.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-2xl text-white">
          {current?.name ?? "…"}
        </motion.p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => judge(false)}
          className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          Pass
        </button>
        <button
          type="button"
          onClick={() => judge(true)}
          className="flex-1 rounded-lg bg-violet-600 py-2 text-xs font-medium text-white transition-colors hover:bg-violet-500"
        >
          Keep
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-4 text-[11px]">
        <span className="text-white/30">{seen} judged · {profile.kept.length} kept</span>
        {leaning ? (
          <Link to={`/generator?style=${leaning}`} className="flex items-center gap-1 text-violet-300 hover:text-violet-200">
            You lean {leaning} <ArrowRight className="h-3 w-3" />
          </Link>
        ) : (
          <span className="text-white/25">Keep a few to see your leaning</span>
        )}
      </div>
    </GlassPanel>
  );
}

function SeedBox() {
  const [word, setWord] = useState("");
  const [copied, setCopied] = useState("");
  const results = useMemo(
    () => (word.trim().length >= 2 ? generateFromSeed(word.trim(), { style: "aesthetic" }, 6, 1337) : []),
    [word]
  );

  async function copy(name) {
    try {
      await navigator.clipboard.writeText(name);
      setCopied(name);
      setTimeout(() => setCopied(""), 1200);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <GlassPanel className="flex flex-col gap-4 p-6">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-white/35">Start from a word</p>
        <p className="mt-1 text-sm text-white/50">
          Give it something that already means something to you and it builds around it.
        </p>
      </div>
      <Field
        value={word}
        onChange={(event) => setWord(event.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 14))}
        placeholder="ember, atlas, koi…"
        aria-label="Seed word"
      />
      <div className="flex flex-wrap gap-2">
        {results.length ? (
          results.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => copy(item.name)}
              className="group flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-sm text-white/80 transition-colors hover:border-violet-400/40 hover:text-white"
            >
              {item.name}
              {copied === item.name ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3 text-white/20 group-hover:text-white/50" />
              )}
            </button>
          ))
        ) : (
          <p className="text-xs text-white/25">Type at least two letters.</p>
        )}
      </div>
    </GlassPanel>
  );
}

export default function Home() {
  const { stats, statsLoaded, reduceMotion } = useVanta();
  const [sample, setSample] = useState([]);

  // Sample names are decoration for the hero, so they are deliberately left out
  // of the public counter — that figure should only reflect names people asked for.
  useEffect(() => {
    setSample(generate({ style: "aesthetic", minLength: 4, maxLength: 10 }, 4));
  }, []);

  const total = useCountUp(stats.total, statsLoaded && !reduceMotion);
  const topStyle = stats.styles?.[0]?.style;

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
    <div className="flex flex-col gap-20">
      <Seo path="/" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="flex flex-col items-center gap-6 pt-6 text-center">
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
        <p className="max-w-xl text-pretty text-sm leading-relaxed text-white/55 sm:text-base">
          Names are assembled from phonetic rules and a curated root vocabulary, then scored for
          rarity and readability. All of it runs on your device — nothing you generate is uploaded.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/generator"
            className="flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500"
          >
            <Sparkles className="h-4 w-4" /> Open the generator
          </Link>
          <Link
            to="/collections"
            className="rounded-full border border-white/12 px-5 py-2.5 text-sm text-white/70 transition-colors hover:border-white/25 hover:text-white"
          >
            Browse collections
          </Link>
        </div>

        {sample.length > 0 && (
          <div className="mt-4 grid w-full grid-cols-1 gap-3 text-left sm:grid-cols-2 lg:grid-cols-4">
            {sample.map((item, index) => (
              <ResultCard key={item.name} item={item} index={index} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="numbers">
        <h2 id="numbers" className="sr-only">Usage</h2>
        <GlassPanel className="grid grid-cols-1 divide-y divide-white/5 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Stat
            label="Names generated"
            value={formatCount(total)}
            hint={`Includes a fixed ${formatCount(stats.baseline)} opening baseline`}
          />
          <Stat label="Generated today" value={formatCount(stats.today)} hint="Resets at midnight UTC" />
          <Stat
            label="Most-used style this week"
            value={topStyle ? topStyle : "—"}
            hint={stats.configured ? "Aggregate across all visitors" : "Waiting on first writes"}
          />
        </GlassPanel>
        <p className="mt-3 text-center text-[11px] text-white/25">
          The counter records a number and a style name. No identifiers, no cookies, no IP logging.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <SeedBox />
        <TasteTest />
      </section>

      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">How a name gets built</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
            The generator does not pick a word and staple a number to it. Each candidate goes through
            three stages, and anything that fails a stage is thrown away rather than patched.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Assemble",
              body: "Roots are drawn from a vocabulary grouped by register — mineral, celestial, weather, technical. Blends only survive when the two roots share a seam or hand off vowel to consonant.",
            },
            {
              step: "02",
              title: "Filter",
              body: "Candidates are checked against phonotactic rules: no three-consonant pile-ups, no quadruple vowels, a vowel ratio between 22% and 68%, and no accidental English words.",
            },
            {
              step: "03",
              title: "Score",
              body: "Survivors get a rarity figure from length and letter frequency, and a flow figure from syllable alternation. Both are deterministic — the same name always scores the same.",
            },
          ].map((item) => (
            <GlassPanel key={item.step} className="flex flex-col gap-3 p-5">
              <span className="font-mono text-xs text-violet-300/60">{item.step}</span>
              <h3 className="text-base font-medium text-white">{item.title}</h3>
              <p className="text-xs leading-relaxed text-white/45">{item.body}</p>
            </GlassPanel>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Starting points</h2>
          <Link to="/presets" className="shrink-0 text-xs text-violet-300 hover:text-violet-200">
            All presets →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PRESETS.slice(0, 4).map((preset) => (
            <GlassPanel key={preset.name} className="flex flex-col gap-2 p-5">
              <h3 className="text-sm font-medium text-white">{preset.name}</h3>
              <p className="text-xs leading-relaxed text-white/45">{preset.desc}</p>
            </GlassPanel>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Questions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {FAQ.map((item) => (
            <div key={item.q} className="border-t border-white/8 pt-4">
              <h3 className="text-sm font-medium text-white/85">{item.q}</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/45">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <GlassPanel className="flex flex-col items-start gap-4 p-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-medium text-white">Vanta is free and has no accounts.</h2>
            <p className="mt-1 max-w-lg text-xs leading-relaxed text-white/45">
              If it saved you an afternoon of refreshing a sign-up form, a one-off contribution covers
              the hosting.
            </p>
          </div>
          <Link
            to="/donate"
            className="shrink-0 rounded-full border border-violet-400/40 bg-violet-500/10 px-5 py-2.5 text-sm text-violet-100 transition-colors hover:bg-violet-500/20"
          >
            Donate
          </Link>
        </GlassPanel>
      </section>
    </div>
  );
}
