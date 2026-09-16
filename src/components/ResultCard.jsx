import { useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Bookmark, Check, Copy, Shuffle } from "lucide-react";
import { cn } from "../lib/utils";
import { useVanta } from "../state/VantaContext";
import { playClick } from "../lib/sound";

function Meter({ label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 shrink-0 text-[10px] uppercase tracking-wider text-white/30">{label}</span>
      <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/[0.07]">
        <div className="h-full rounded-full bg-violet-400/80" style={{ width: `${Math.max(4, value)}%` }} />
      </div>
      <span className="w-6 text-right text-[10px] tabular-nums text-white/40">{value}</span>
    </div>
  );
}

export default function ResultCard({ item, onRemix, index = 0 }) {
  const { isFavorite, toggleFavorite, settings, reduceMotion } = useVanta();
  const [copied, setCopied] = useState(false);
  const surface = useRef(null);
  const saved = isFavorite(item.name);

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [7, -7]), { stiffness: 180, damping: 14, mass: 0.6 });
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-7, 7]), { stiffness: 180, damping: 14, mass: 0.6 });
  const glareX = useTransform(useSpring(pointerX, { stiffness: 140, damping: 16 }), (v) => `${(v * 100).toFixed(1)}%`);
  const glareY = useTransform(useSpring(pointerY, { stiffness: 140, damping: 16 }), (v) => `${(v * 100).toFixed(1)}%`);
  const glare = useMotionTemplate`radial-gradient(240px circle at ${glareX} ${glareY}, rgba(139,92,246,0.20), transparent 62%)`;

  function track(event) {
    if (reduceMotion || !surface.current) return;
    const bounds = surface.current.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width);
    pointerY.set((event.clientY - bounds.top) / bounds.height);
  }

  function release() {
    pointerX.set(0.5);
    pointerY.set(0.5);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(item.name);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
    playClick(settings.soundEffects);
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.025, 0.3), duration: 0.32, ease: "easeOut" }}
      className="group relative"
      style={{ perspective: 1000 }}
    >
      <motion.article
        ref={surface}
        onMouseMove={track}
        onMouseLeave={release}
        style={reduceMotion ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl transition-colors duration-300 group-hover:border-white/20"
      >
        {!reduceMotion && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: glare }}
          />
        )}

        <div className="relative" style={reduceMotion ? undefined : { transform: "translateZ(22px)" }}>
          <p className={cn("truncate font-mono text-lg tracking-tight text-white", copied && "text-emerald-300")}>
            {item.name}
          </p>
          <p className="mt-0.5 text-[11px] text-white/35">
            {item.name.length} characters · {item.note}
          </p>
        </div>

        <div className="relative flex flex-col gap-1.5" style={reduceMotion ? undefined : { transform: "translateZ(12px)" }}>
          <Meter label="Rare" value={item.rarity} />
          <Meter label="Flow" value={item.flow} />
        </div>

        <div className="relative flex items-center gap-2" style={reduceMotion ? undefined : { transform: "translateZ(18px)" }}>
          <button
            type="button"
            onClick={copy}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white active:scale-95"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={() => {
              toggleFavorite(item);
              playClick(settings.soundEffects);
            }}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${item.name} from saved` : `Save ${item.name}`}
            className={cn(
              "rounded-lg border border-white/10 bg-white/5 p-1.5 transition-colors hover:bg-white/10 active:scale-95",
              saved ? "text-violet-300" : "text-white/60"
            )}
          >
            <Bookmark className={cn("h-3.5 w-3.5", saved && "fill-current")} />
          </button>
          {onRemix && (
            <button
              type="button"
              onClick={() => onRemix(item)}
              aria-label={`Build variations of ${item.name}`}
              className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white active:scale-95"
            >
              <Shuffle className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </motion.article>
    </motion.div>
  );
}
