import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, X } from "lucide-react";
import { remix } from "../lib/engine";
import ResultCard from "./ResultCard";

export default function RemixModal({ target, onClose }) {
  const [seed, setSeed] = useState(0);
  const variations = useMemo(() => remix(target.name, 9, seed || undefined), [target.name, seed]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Variations of ${target.name}`}
    >
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0d] p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/35">Variations of</p>
            <p className="font-mono text-xl text-white">{target.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSeed(Math.floor(Math.random() * 1e9))}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 transition-colors hover:text-white"
            >
              <RefreshCw className="h-3 w-3" /> Again
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/60 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {variations.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {variations.map((item, index) => (
              <ResultCard key={item.name} item={item} index={index} />
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-white/40">
            Nothing readable came out of that one. Try a longer name.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
