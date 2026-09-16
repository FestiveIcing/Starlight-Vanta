import { useState } from "react";
import { Check, Copy, Bookmark } from "lucide-react";
import Seo from "../components/Seo";
import GlassPanel from "../components/GlassPanel";
import Field from "../components/Field";
import { buildCustom, TONES, TONE_LABELS } from "../lib/engine";
import { useVanta } from "../state/VantaContext";
import { cn } from "../lib/utils";

const HEADS = ["", "cel", "lue", "nol", "ver", "aer", "ilo"];
const TAILS = ["", "ix", "yn", "ora", "eon", "ara", "is"];

export default function Builder() {
  const { toggleFavorite, isFavorite } = useVanta();
  const [head, setHead] = useState("");
  const [core, setCore] = useState("vanta");
  const [tail, setTail] = useState("");
  const [tone, setTone] = useState("lowercase");
  const [copied, setCopied] = useState(false);

  const result = buildCustom({ head, core, tail, tone });

  async function copy() {
    if (!result.valid) return;
    try {
      await navigator.clipboard.writeText(result.name);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <Seo path="/builder" />

      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Builder</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/50">
          Three parts, joined the same way the generator joins them — shared letters collapse at the seam.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <GlassPanel className="flex flex-col gap-6 p-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="head" className="text-[11px] uppercase tracking-widest text-white/40">Head</label>
            <Field id="head" value={head} onChange={(e) => setHead(e.target.value.replace(/[^a-z]/gi, "").slice(0, 8))} placeholder="optional" />
            <div className="flex flex-wrap gap-1.5">
              {HEADS.map((option) => (
                <button
                  key={option || "none"}
                  type="button"
                  onClick={() => setHead(option)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                    head === option ? "border-violet-400/50 bg-violet-500/15 text-violet-100" : "border-white/10 text-white/45 hover:text-white"
                  )}
                >
                  {option || "none"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="core" className="text-[11px] uppercase tracking-widest text-white/40">Core</label>
            <Field id="core" value={core} onChange={(e) => setCore(e.target.value.replace(/[^a-z0-9]/gi, "").slice(0, 16))} placeholder="a word of your own" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="tail" className="text-[11px] uppercase tracking-widest text-white/40">Ending</label>
            <Field id="tail" value={tail} onChange={(e) => setTail(e.target.value.replace(/[^a-z0-9]/gi, "").slice(0, 8))} placeholder="optional" />
            <div className="flex flex-wrap gap-1.5">
              {TAILS.map((option) => (
                <button
                  key={option || "none"}
                  type="button"
                  onClick={() => setTail(option)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                    tail === option ? "border-violet-400/50 bg-violet-500/15 text-violet-100" : "border-white/10 text-white/45 hover:text-white"
                  )}
                >
                  {option || "none"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[11px] uppercase tracking-widest text-white/40">Casing</p>
            <div className="flex flex-wrap gap-1.5">
              {TONES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTone(option)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                    tone === option ? "border-violet-400/50 bg-violet-500/15 text-violet-100" : "border-white/10 text-white/45 hover:text-white"
                  )}
                >
                  {TONE_LABELS[option]}
                </button>
              ))}
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="flex h-fit flex-col gap-5 p-6">
          <p className="text-[11px] uppercase tracking-widest text-violet-300/60">Result</p>
          <p className="break-all font-mono text-2xl text-white">{result.name || "—"}</p>

          {result.valid ? (
            <>
              <p className="text-xs text-white/40">{result.name.length} characters · {result.note}</p>
              <div className="flex flex-col gap-2">
                {[["Rarity", result.rarity], ["Flow", result.flow]].map(([label, value]) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="w-12 text-[10px] uppercase tracking-wider text-white/30">{label}</span>
                    <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                      <div className="h-full rounded-full bg-violet-400/80" style={{ width: `${Math.max(4, value)}%` }} />
                    </div>
                    <span className="w-6 text-right text-[10px] tabular-nums text-white/40">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copy}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2 text-xs text-white/70 transition-colors hover:text-white"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite({ name: result.name, style: "custom", rarity: result.rarity, flow: result.flow, structure: "custom", note: result.note })}
                  aria-label="Save this name"
                  className={cn(
                    "rounded-lg border border-white/10 bg-white/5 p-2 transition-colors hover:text-white",
                    isFavorite(result.name) ? "text-violet-300" : "text-white/60"
                  )}
                >
                  <Bookmark className={cn("h-3.5 w-3.5", isFavorite(result.name) && "fill-current")} />
                </button>
              </div>
            </>
          ) : (
            <p className="text-xs text-white/30">
              Needs at least two characters and must start with a letter.
            </p>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
