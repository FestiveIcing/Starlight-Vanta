import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { Check, Copy, Heart, RefreshCw } from "lucide-react";
import { cn } from "./utils";
import { useVanta } from "./VantaContext";
import { playClick } from "./sound";

export default function ResultCard({ item, onRemix, index = 0 }) {
  const { isFavorite, toggleFavorite, settings } = useVanta();
  const fav = isFavorite(item.name);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);

  const reduce = settings.reduceMotion;
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 140, damping: 12, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 140, damping: 12, mass: 0.6 });
  const rotateX = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 180, damping: 12, mass: 0.6 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-7, 7]), { stiffness: 180, damping: 12, mass: 0.6 });
  const glowX = useTransform(sx, (v) => `${(v * 100).toFixed(1)}%`);
  const glowY = useTransform(sy, (v) => `${(v * 100).toFixed(1)}%`);
  const glowBg = useMotionTemplate`radial-gradient(260px circle at ${glowX} ${glowY}, rgba(139,92,246,0.18), transparent 60%)`;

  function handleMove(e) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  }
  function reset() {
    mx.set(0.5);
    my.set(0.5);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(item.name);
    } catch {
      /* clipboard blocked */
    }
    setCopied(true);
    playClick(settings.soundEffects);
    setTimeout(() => setCopied(false), 1400);
  }

  function handleFav() {
    toggleFavorite({ name: item.name, style: item.style, score: item.score });
    playClick(settings.soundEffects);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.035, duration: 0.4, ease: "easeOut" }}
      className="group relative"
      style={{ perspective: 1000 }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl transition-colors duration-300 group-hover:border-white/20"
      >
        {!reduce && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: glowBg }}
          />
        )}
        <div className="relative flex items-baseline justify-between gap-2">
          <span className={cn("truncate font-mono text-lg tracking-tight text-white transition-colors", copied && "text-emerald-300")}>
            {item.name}
          </span>
          <span className="shrink-0 text-[10px] uppercase tracking-widest text-violet-300/60">{item.style}</span>
        </div>
        <div className="relative flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-300"
              initial={{ width: 0 }}
              animate={{ width: `${item.score}%` }}
              transition={{ delay: 0.2 + index * 0.035, duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <span className="text-[10px] tabular-nums text-white/40">Vanta {item.score}</span>
        </div>
        <div className="relative flex items-center gap-2">
          <button
            onClick={copy}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white active:scale-95"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={handleFav}
            className={cn("rounded-lg border border-white/10 bg-white/5 p-1.5 transition-colors hover:bg-white/10 active:scale-95", fav && "text-fuchsia-400")}
            title="Favorite"
          >
            <Heart className={cn("h-3.5 w-3.5", fav && "fill-current")} />
          </button>
          <button
            onClick={() => onRemix?.({ name: item.name, style: item.style, score: item.score })}
            className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white active:scale-95"
            title="Remix"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}