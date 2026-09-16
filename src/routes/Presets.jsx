import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Seo from "../components/Seo";
import GlassPanel from "../components/GlassPanel";
import { PRESETS, STRUCTURE_LABELS } from "../lib/engine";
import { useVanta } from "../state/VantaContext";

export default function Presets() {
  const { setConfig } = useVanta();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-7">
      <Seo path="/presets" />

      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Presets</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/50">
          Each one loads a full set of generator options. Adjust anything after it lands.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => {
              setConfig(preset.config);
              navigate("/generator");
            }}
            className="group text-left"
          >
            <GlassPanel className="flex h-full flex-col gap-3 p-5 transition-colors duration-300 hover:border-white/20">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-medium text-white">{preset.name}</h2>
                <ArrowRight className="h-4 w-4 shrink-0 text-white/25 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-violet-300" />
              </div>
              <p className="text-xs leading-relaxed text-white/45">{preset.desc}</p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/40">
                  {preset.config.style}
                </span>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/40">
                  {preset.config.minLength}–{preset.config.maxLength} chars
                </span>
                {preset.config.structures.slice(0, 2).map((structure) => (
                  <span key={structure} className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/40">
                    {STRUCTURE_LABELS[structure]}
                  </span>
                ))}
              </div>
            </GlassPanel>
          </button>
        ))}
      </div>
    </div>
  );
}
