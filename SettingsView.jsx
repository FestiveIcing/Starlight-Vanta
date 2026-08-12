import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useVanta } from "./VantaContext";
import GlassPanel from "./GlassPanel";

function Row({ label, desc, children }) {
  return (
    <div className="flex flex-col gap-3 border-b border-white/5 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-white/80">{label}</p>
        <p className="text-xs text-white/40">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function Switch({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${checked ? "bg-violet-500/60" : "bg-white/10"}`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${checked ? "left-[22px]" : "left-0.5"}`}
      />
    </button>
  );
}

export default function SettingsView() {
  const { settings, updateSettings, clearFavorites, clearHistory, resetLocal } = useVanta();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Settings</h1>
        <p className="mt-2 text-sm text-white/50">Everything stays in your browser.</p>
      </div>

      <GlassPanel className="p-5">
        <Row label="Animation intensity" desc="Controls background motion and depth.">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={2}
              step={0.5}
              value={settings.animationIntensity}
              onChange={(e) => updateSettings({ animationIntensity: +e.target.value })}
              className="vanta-range w-32"
            />
            <span className="w-6 font-mono text-xs text-white/60">{settings.animationIntensity}</span>
          </div>
        </Row>
        <Row label="Reduce motion" desc="Disables tilt and heavy animation.">
          <Switch checked={settings.reduceMotion} onChange={(v) => updateSettings({ reduceMotion: v })} />
        </Row>
        <Row label="Background effects" desc="Ambient orbs, grid, and grain.">
          <Switch checked={settings.backgroundEffects} onChange={(v) => updateSettings({ backgroundEffects: v })} />
        </Row>
        <Row label="Sound effects" desc="Subtle click feedback via Web Audio.">
          <Switch checked={settings.soundEffects} onChange={(v) => updateSettings({ soundEffects: v })} />
        </Row>
      </GlassPanel>

      <GlassPanel className="p-5">
        <p className="mb-2 text-[11px] uppercase tracking-widest text-white/40">Local data</p>
        <Row label="Clear favorites" desc="Removes all saved usernames.">
          <button onClick={clearFavorites} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300">
            Clear
          </button>
        </Row>
        <Row label="Clear history" desc="Removes the generation log.">
          <button onClick={clearHistory} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300">
            Clear
          </button>
        </Row>
        <Row label="Reset all local data" desc="Restores default settings and clears everything.">
          <button
            onClick={resetLocal}
            className="flex items-center gap-1.5 rounded-lg border border-red-400/20 bg-red-500/5 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/15"
          >
            <AlertTriangle className="h-3.5 w-3.5" /> Reset
          </button>
        </Row>
      </GlassPanel>

      <p className="text-center text-[11px] text-white/30">
        Starlight Vanta — by Starlight Solutions, Inc. · Rare names. Local generation. Infinite possibilities.
      </p>
    </div>
  );
}