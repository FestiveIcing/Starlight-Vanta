import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PRESETS } from "./usernameEngine";
import GlassPanel from "./GlassPanel";

export default function PresetsView({ setView, setConfig }) {
  function apply(preset) {
    setConfig(preset.config);
    setView("generator");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Presets</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-white/50">
          One-tap starting points. Pick a vibe, then fine-tune in the generator.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PRESETS.map((p, i) => (
          <motion.button
            key={p.name}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.35 }}
            onClick={() => apply(p)}
            className="group text-left"
          >
            <GlassPanel className="flex h-full flex-col gap-2 p-5 transition-colors duration-300 hover:border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-white">{p.name}</h3>
                <ArrowRight className="h-4 w-4 text-white/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-violet-300" />
              </div>
              <p className="text-xs text-white/45">{p.desc}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50">{p.config.style}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50">{p.config.structure}</span>
                {p.config.modifiers.map((m) => (
                  <span key={m} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50">{m}</span>
                ))}
              </div>
            </GlassPanel>
          </motion.button>
        ))}
      </div>
    </div>
  );
}