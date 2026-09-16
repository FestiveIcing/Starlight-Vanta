import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { RotateCcw, Wand2 } from "lucide-react";
import Seo from "../components/Seo";
import GlassPanel from "../components/GlassPanel";
import ResultCard from "../components/ResultCard";
import RemixModal from "../components/RemixModal";
import { cn } from "../lib/utils";
import { playClick } from "../lib/sound";
import { useVanta } from "../state/VantaContext";
import {
  DEFAULT_CONFIG,
  generate,
  normalizeConfig,
  STRUCTURES,
  STRUCTURE_LABELS,
  STYLES,
  TONES,
  TONE_LABELS,
} from "../lib/engine";

function Chip({ active, children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs transition-colors duration-200",
        active
          ? "border-violet-400/50 bg-violet-500/15 text-violet-100"
          : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:text-white/85"
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function Group({ title, hint, children }) {
  return (
    <section className="flex flex-col gap-2">
      <div>
        <h2 className="text-[11px] uppercase tracking-widest text-white/40">{title}</h2>
        {hint && <p className="text-[11px] text-white/25">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Skeleton() {
  return <div className="h-[132px] animate-pulse rounded-2xl border border-white/5 bg-white/[0.02]" />;
}

export default function Generator() {
  const { config, setConfig, resetConfig, addHistory, recordGenerated, settings, reduceMotion } = useVanta();
  const [params, setParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [remixTarget, setRemixTarget] = useState(null);

  const patch = (next) => setConfig((prev) => normalizeConfig({ ...prev, ...next }));

  const run = useCallback(
    async (override) => {
      const active = normalizeConfig(override || config);
      setBusy(true);
      playClick(settings.soundEffects);
      if (!reduceMotion) await new Promise((resolve) => setTimeout(resolve, 260));
      const batch = generate(active, 12);
      setResults(batch);
      addHistory(batch.slice(0, 6));
      recordGenerated(batch.length, active.style);
      setBusy(false);
    },
    [config, settings.soundEffects, reduceMotion, addHistory, recordGenerated]
  );

  // A style handed over from the landing page's keep-or-pass panel.
  useEffect(() => {
    const incoming = params.get("style");
    if (incoming && STYLES.includes(incoming)) {
      const next = normalizeConfig({ ...config, style: incoming });
      setConfig(next);
      setParams({}, { replace: true });
      run(next);
    } else if (!results.length) {
      run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleStructure(structure) {
    const current = config.structures || [];
    const next = current.includes(structure)
      ? current.filter((item) => item !== structure)
      : [...current, structure];
    patch({ structures: next.length ? next : current });
  }

  return (
    <div className="flex flex-col gap-8">
      <Seo path="/generator" />

      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Generator</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/50">
          Twelve candidates per run, each one filtered for readability before it reaches the grid.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <GlassPanel className="flex h-fit flex-col gap-6 p-5">
          <Group title="Register" hint="Which vocabulary the roots come from.">
            <div className="flex flex-wrap gap-2">
              {STYLES.map((style) => (
                <Chip key={style} active={config.style === style} onClick={() => patch({ style })}>
                  {style}
                </Chip>
              ))}
            </div>
          </Group>

          <Group title="Length" hint="Names outside this range are discarded, never trimmed.">
            <div className="flex items-center gap-4">
              <label className="flex flex-1 items-center gap-2 text-xs text-white/40">
                min
                <input
                  type="range"
                  min={2}
                  max={config.maxLength}
                  value={config.minLength}
                  onChange={(event) => patch({ minLength: +event.target.value })}
                  className="vanta-range w-full"
                />
                <span className="w-5 text-right font-mono text-white/70">{config.minLength}</span>
              </label>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex flex-1 items-center gap-2 text-xs text-white/40">
                max
                <input
                  type="range"
                  min={3}
                  max={20}
                  value={config.maxLength}
                  onChange={(event) => patch({ maxLength: +event.target.value })}
                  className="vanta-range w-full"
                />
                <span className="w-5 text-right font-mono text-white/70">{config.maxLength}</span>
              </label>
            </div>
          </Group>

          <Group title="Construction" hint="How the parts are put together.">
            <div className="flex flex-wrap gap-2">
              {STRUCTURES.filter((s) => s !== "numbered").map((structure) => (
                <Chip
                  key={structure}
                  active={config.structures.includes(structure)}
                  onClick={() => toggleStructure(structure)}
                >
                  {STRUCTURE_LABELS[structure]}
                </Chip>
              ))}
            </div>
          </Group>

          <Group title="Casing">
            <div className="flex flex-wrap gap-2">
              {TONES.map((tone) => (
                <Chip key={tone} active={config.tone === tone} onClick={() => patch({ tone })}>
                  {TONE_LABELS[tone]}
                </Chip>
              ))}
            </div>
          </Group>

          <Group title="Allowed characters">
            <div className="flex flex-wrap gap-2">
              <Chip active={config.allowDigits} onClick={() => patch({ allowDigits: !config.allowDigits })}>
                digits
              </Chip>
              <Chip
                active={config.allowSeparators}
                onClick={() => patch({ allowSeparators: !config.allowSeparators })}
              >
                underscore
              </Chip>
            </div>
          </Group>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => run()}
              disabled={busy}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-500 disabled:opacity-60"
            >
              <Wand2 className="h-4 w-4" />
              {busy ? "Generating…" : "Generate"}
            </button>
            <button
              type="button"
              onClick={() => {
                resetConfig();
                run(DEFAULT_CONFIG);
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-3 text-white/50 transition-colors hover:text-white"
              aria-label="Reset options"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </GlassPanel>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/55">
              {busy ? "Filtering candidates…" : `${results.length} names`}
            </p>
            <button
              type="button"
              onClick={() => run()}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 transition-colors hover:text-white disabled:opacity-50"
            >
              <RotateCcw className="h-3 w-3" /> Again
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {busy
              ? Array.from({ length: 12 }).map((_, index) => <Skeleton key={index} />)
              : results.map((item, index) => (
                  <ResultCard key={item.name} item={item} index={index} onRemix={setRemixTarget} />
                ))}
          </div>

          {!busy && results.length === 0 && (
            <p className="py-20 text-center text-sm text-white/40">
              Nothing survived those constraints. Widen the length range or add another construction.
            </p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {remixTarget && <RemixModal target={remixTarget} onClose={() => setRemixTarget(null)} />}
      </AnimatePresence>
    </div>
  );
}
