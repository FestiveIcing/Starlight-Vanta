import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { generateRemixes } from "./usernameEngine";
import { useVanta } from "./VantaContext";
import { playClick } from "./sound";
import ResultCard from "./ResultCard";

export default function RemixModal({ target, onClose }) {
  const { settings } = useVanta();
  const [seed, setSeed] = useState(0);
  const variations = useMemo(
    () => generateRemixes(target.name, 9),
    [target.name, seed]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0c0c10]/90 p-6 backdrop-blur-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-violet-300/70">Remixing</p>
            <p className="font-mono text-lg text-white">{target.name}</p>
          </div>
          <button onClick={onClose} className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {variations.map((v, i) => (
            <ResultCard key={v.name + i} item={v} index={i} onRemix={() => { setSeed((s) => s + 1); playClick(settings.soundEffects); }} />
          ))}
        </div>
        <p className="mt-4 text-center text-[11px] text-white/30">Variations generated locally from the source name.</p>
      </motion.div>
    </motion.div>
  );
}