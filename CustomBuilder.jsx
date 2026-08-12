import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Heart, Wand2 } from "lucide-react";
import { buildCustomUsername, BUILDER_TRANSFORMS } from "./usernameEngine";
import { useVanta } from "./VantaContext";
import { playClick } from "./sound";
import GlassPanel from "./GlassPanel";
import VantaInput from "./VantaInput";
import { Toggle } from "./toggle";

const PREFIXES = ["x", "v", "void", "neo", "i", "the", "lil", "real", "ax", "no"];
const SUFFIXES = ["x", "7", "404", "vx", "io", "99", "_", "zx", "v2", "xd"];

export default function CustomBuilder({ onRemix }) {
  const { toggleFavorite, isFavorite, settings } = useVanta();
  const [prefix, setPrefix] = useState("");
  const [core, setCore] = useState("vanta");
  const [suffix, setSuffix] = useState("");
  const [transforms, setTransforms] = useState(["lowercase"]);
  const [copied, setCopied] = useState(false);

  const preview = buildCustomUsername(prefix, core, suffix, transforms);
  const score = preview ? Math.min(99, 50 + preview.length * 2 + new Set(preview.toLowerCase()).size * 3) : 0;
  const valid = preview.length >= 2 && preview.length <= 24;

  function toggleTransform(t) {
    setTransforms((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));
  }

  async function copy() {
    if (!valid) return;
    try {
      await navigator.clipboard.writeText(preview);
    } catch {}
    setCopied(true);
    playClick(settings.soundEffects);
    setTimeout(() => setCopied(false), 1400);
  }

  function favorite() {
    if (!valid) return;
    toggleFavorite({ name: preview, style: "custom", score });
    playClick(settings.soundEffects);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Custom Builder</h1>
        <p className="mt-2 text-sm text-white/50">Construct a username piece by piece — preview updates live.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <GlassPanel className="flex flex-col gap-6 p-5">
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-widest text-white/40">Prefix</p>
            <VantaInput
              value={prefix}
              onChange={(e) => setPrefix(e.target.value.slice(0, 8))}
              placeholder="optional"
              className="w-full"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PREFIXES.map((p) => (
                <Toggle key={p} active={prefix === p} onClick={() => setPrefix(prefix === p ? "" : p)}>
                  {p}
                </Toggle>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] uppercase tracking-widest text-white/40">Core</p>
            <VantaInput
              value={core}
              onChange={(e) => setCore(e.target.value.slice(0, 16))}
              placeholder="enter a word"
              className="w-full"
            />
          </div>

          <div>
            <p className="mb-2 text-[11px] uppercase tracking-widest text-white/40">Suffix</p>
            <VantaInput
              value={suffix}
              onChange={(e) => setSuffix(e.target.value.slice(0, 8))}
              placeholder="optional"
              className="w-full"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SUFFIXES.map((s) => (
                <Toggle key={s} active={suffix === s} onClick={() => setSuffix(suffix === s ? "" : s)}>
                  {s}
                </Toggle>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] uppercase tracking-widest text-white/40">Transformations</p>
            <div className="flex flex-wrap gap-2">
              {BUILDER_TRANSFORMS.map((t) => (
                <Toggle key={t} active={transforms.includes(t)} onClick={() => toggleTransform(t)}>
                  {t}
                </Toggle>
              ))}
            </div>
          </div>
        </GlassPanel>

        <div className="flex flex-col gap-4">
          <GlassPanel className="flex flex-col items-center gap-4 p-8">
            <p className="text-[11px] uppercase tracking-widest text-violet-300/70">Live preview</p>
            <motion.div
              key={preview}
              initial={{ opacity: 0.5, filter: "blur(6px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.25 }}
              className="break-all text-center font-mono text-2xl tracking-tight text-white"
            >
              {preview || "—"}
              {preview && <span className="typewriter-caret" />}
            </motion.div>
            {valid && (
              <div className="flex w-full items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-300" animate={{ width: `${score}%` }} transition={{ duration: 0.4 }} />
                </div>
                <span className="text-[10px] tabular-nums text-white/40">Vanta {score}</span>
              </div>
            )}
            <div className="flex w-full gap-2">
              <button onClick={copy} disabled={!valid} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2 text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button onClick={favorite} disabled={!valid} className={`rounded-lg border border-white/10 bg-white/5 p-2 transition-colors hover:bg-white/10 disabled:opacity-40 ${isFavorite(preview) ? "text-fuchsia-400" : "text-white/70"}`}>
                <Heart className={`h-3.5 w-3.5 ${isFavorite(preview) ? "fill-current" : ""}`} />
              </button>
              <button onClick={() => valid && onRemix?.({ name: preview, style: "custom", score })} disabled={!valid} className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40">
                <Wand2 className="h-3.5 w-3.5" />
              </button>
            </div>
            {!valid && <p className="text-center text-[11px] text-white/30">Enter 2–24 valid characters.</p>}
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}