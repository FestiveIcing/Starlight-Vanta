import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2, RotateCcw } from "lucide-react";
import { generateUsernames, STYLES, STRUCTURES, MODIFIERS, PRESETS } from "./usernameEngine";
import { useVanta } from "./VantaContext";
import { playClick } from "./sound";
import GlassPanel from "./GlassPanel";
import { Toggle } from "./toggle";
import ResultCard from "./ResultCard";

const CHAR_OPTS = [
  { key: "letters", label: "Letters" },
  { key: "numbers", label: "Numbers" },
  { key: "underscores", label: "Underscores" },
  { key: "periods", label: "Periods" },
  { key: "mixedCase", label: "Mixed case" },
  { key: "repeatedChars", label: "Repeats" },
  { key: "minimalSymbols", label: "Minimal symbols" },
];

function Shimmer() {
  return (
    <div className="h-36 animate-pulse rounded-2xl border border-white/5 bg-white/[0.02]">
      <div className="h-full w-full animate-pulse rounded-2xl bg-gradient-to-b from-violet-500/5 to-transparent" />
    </div>
  );
}

function Section({ title, desc, children }) {
  return (
    <div>
      <div className="mb-2">
        <p className="text-[11px] uppercase tracking-widest text-white/40">{title}</p>
        {desc && <p className="text-[10px] text-white/25">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

export default function GeneratorView({ onRemix, config, setConfig }) {
  const { addHistory, settings } = useVanta();
  const [results, setResults] = useState([]);
  const [generating, setGenerating] = useState(false);

  const set = (patch) => setConfig((p) => ({ ...p, ...patch }));
  const setChars = (patch) => setConfig((p) => ({ ...p, chars: { ...p.chars, ...patch } }));
  const toggleModifier = (m) =>
    setConfig((p) => ({
      ...p,
      modifiers: p.modifiers.includes(m) ? p.modifiers.filter((x) => x !== m) : [...p.modifiers, m],
    }));

  async function generate() {
    if (generating) return;
    setGenerating(true);
    playClick(settings.soundEffects);
    await new Promise((r) => setTimeout(r, settings.reduceMotion ? 120 : 480));
    const min = Math.max(2, config.length - 4);
    const list = generateUsernames({ ...config, length: [min, config.length] }, 12);
    setResults(list);
    if (list.length) addHistory(list.slice(0, 6));
    setGenerating(false);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-violet-200/80 backdrop-blur"
        >
          <Sparkles className="h-3 w-3" /> Starlight Vanta
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          Find a name{" "}
          <span className="bg-gradient-to-r from-violet-400 to-fuchsia-300 bg-clip-text text-transparent">worth keeping.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="max-w-xl text-sm text-white/50 sm:text-base"
        >
          Generate rare, aesthetic, and completely customizable usernames — locally, in your browser.
        </motion.p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <GlassPanel className="flex flex-col gap-6 p-5">
          <Section title="Quick presets" desc="Tap a vibe to load full settings.">
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <Toggle key={p.name} onClick={() => setConfig(p.config)}>
                  {p.name}
                </Toggle>
              ))}
            </div>
          </Section>

          <Section title="Style" desc="Overall feel of the names.">
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <Toggle key={s} active={config.style === s} onClick={() => set({ style: s })}>
                  {s}
                </Toggle>
              ))}
            </div>
          </Section>

          <Section title="Max length" desc="Upper character limit.">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={4}
                max={20}
                value={config.length}
                onChange={(e) => set({ length: +e.target.value })}
                className="vanta-range w-full"
              />
              <span className="w-6 font-mono text-xs text-white/70">{config.length}</span>
            </div>
          </Section>

          <Section title="Characters" desc="Which characters are allowed.">
            <div className="flex flex-wrap gap-2">
              {CHAR_OPTS.map((c) => (
                <Toggle key={c.key} active={config.chars[c.key]} onClick={() => setChars({ [c.key]: !config.chars[c.key] })}>
                  {c.label}
                </Toggle>
              ))}
            </div>
          </Section>

          <Section title="Structure" desc="How the name is assembled.">
            <div className="flex flex-wrap gap-2">
              {STRUCTURES.map((s) => (
                <Toggle key={s} active={config.structure === s} onClick={() => set({ structure: s })}>
                  {s}
                </Toggle>
              ))}
            </div>
          </Section>

          <Section title="Modifiers" desc="Transformations applied to results.">
            <div className="flex flex-wrap gap-2">
              {MODIFIERS.map((m) => (
                <Toggle key={m} active={config.modifiers.includes(m)} onClick={() => toggleModifier(m)}>
                  {m}
                </Toggle>
              ))}
            </div>
          </Section>

          <button
            onClick={generate}
            disabled={generating}
            className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_30px_-8px_rgba(124,58,237,0.9)] transition-all duration-300 hover:bg-violet-500 hover:scale-[1.02] active:scale-95 disabled:opacity-70"
          >
            <Wand2 className="h-4 w-4" />
            {generating ? "Generating…" : "Generate"}
          </button>
        </GlassPanel>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-white/70">
              {generating ? "Resolving names…" : results.length ? `${results.length} results` : "Results"}
            </h2>
            <button
              onClick={generate}
              disabled={generating}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <RotateCcw className="h-3 w-3" /> Regenerate
            </button>
          </div>

          {generating ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <Shimmer key={i} />
              ))}
            </div>
          ) : results.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((item, i) => (
                <ResultCard key={item.name + i} item={item} index={i} onRemix={onRemix} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-24 text-center">
              <Wand2 className="h-8 w-8 text-violet-300/50" />
              <p className="text-sm text-white/50">Configure your style and press Generate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}