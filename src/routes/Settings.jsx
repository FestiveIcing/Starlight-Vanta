import { useEffect, useState } from "react";
import Seo from "../components/Seo";
import { useVanta } from "../state/VantaContext";
import { cn, formatCount, isBrowser } from "../lib/utils";

const KEYS = [
  { key: "vanta.favorites", label: "Bookmarked names" },
  { key: "vanta.history", label: "Generation history" },
  { key: "vanta.config", label: "Generator options" },
  { key: "vanta.settings", label: "These settings" },
  { key: "vanta.taste", label: "Keep-or-pass results" },
];

function Segmented({ value, options, onChange, label }) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-[6px] px-3 py-1.5 text-xs transition-colors duration-200",
            value === option.value ? "bg-white/[0.09] text-white" : "text-white/40 hover:text-white/75"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Setting({ label, description, children }) {
  return (
    <div className="grid gap-3 border-b border-white/[0.06] py-5 last:border-0 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-8">
      <div>
        <p className="text-sm text-white/85">{label}</p>
        <p className="mt-1 max-w-md text-xs leading-relaxed text-white/40">{description}</p>
      </div>
      <div className="sm:pt-0.5">{children}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="grid gap-x-10 gap-y-2 lg:grid-cols-[200px_1fr]">
      <h2 className="pt-5 text-[11px] uppercase tracking-widest text-white/35">{title}</h2>
      <div className="lg:border-l lg:border-white/[0.06] lg:pl-10">{children}</div>
    </section>
  );
}

export default function Settings() {
  const { settings, updateSettings, resetSettings, eraseEverything, favorites, history } = useVanta();
  const [usage, setUsage] = useState([]);

  useEffect(() => {
    if (!isBrowser) return;
    setUsage(
      KEYS.map((entry) => {
        let bytes = 0;
        try {
          bytes = new Blob([window.localStorage.getItem(entry.key) || ""]).size;
        } catch {
          bytes = 0;
        }
        return { ...entry, bytes };
      })
    );
  }, [favorites, history, settings]);

  const stored = usage.reduce((total, entry) => total + entry.bytes, 0);

  return (
    <div className="flex flex-col gap-10">
      <Seo path="/settings" />

      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Settings</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/50">
          Every option here is written to this browser and read back on your next visit. There is no
          account, so there is nothing to sign into and nothing to sync.
        </p>
      </header>

      <Section title="Presentation">
        <Setting
          label="Motion"
          description="Full keeps the drifting background and card transitions. Off freezes both and is picked up automatically if your system asks for reduced motion."
        >
          <Segmented
            label="Motion"
            value={settings.motion}
            onChange={(motion) => updateSettings({ motion })}
            options={[
              { value: "full", label: "Full" },
              { value: "off", label: "Off" },
            ]}
          />
        </Setting>

        <Setting
          label="Background"
          description="The grid, the drifting colour fields and the film grain behind the page."
        >
          <Segmented
            label="Background"
            value={settings.backgroundEffects ? "on" : "off"}
            onChange={(value) => updateSettings({ backgroundEffects: value === "on" })}
            options={[
              { value: "on", label: "Visible" },
              { value: "off", label: "Flat black" },
            ]}
          />
        </Setting>

        <Setting
          label="Click sound"
          description="A 120-millisecond sine tone synthesised in the page when you copy or generate. No audio files are loaded."
        >
          <Segmented
            label="Click sound"
            value={settings.soundEffects ? "on" : "off"}
            onChange={(value) => updateSettings({ soundEffects: value === "on" })}
            options={[
              { value: "off", label: "Silent" },
              { value: "on", label: "On" },
            ]}
          />
        </Setting>
      </Section>

      <Section title="History">
        <Setting
          label="Keep a local history"
          description="Records the first six names of each run so you can find one you scrolled past. Turning this off stops new entries; it does not delete what is already there."
        >
          <Segmented
            label="Keep a local history"
            value={settings.keepHistory ? "on" : "off"}
            onChange={(value) => updateSettings({ keepHistory: value === "on" })}
            options={[
              { value: "on", label: "Keep" },
              { value: "off", label: "Don't keep" },
            ]}
          />
        </Setting>

        <Setting label="How many to hold" description="Older entries drop off the end once the limit is reached.">
          <Segmented
            label="History limit"
            value={String(settings.historyLimit)}
            onChange={(value) => updateSettings({ historyLimit: Number(value) })}
            options={[
              { value: "60", label: "60" },
              { value: "120", label: "120" },
              { value: "300", label: "300" },
            ]}
          />
        </Setting>
      </Section>

      <Section title="Public counter">
        <Setting
          label="Count my runs in the site total"
          description="Sends one number and the name of the register you used, batched every few seconds. No cookie, no identifier, no IP address is stored against it. Switching this off leaves the counter on the home page reading the shared total without adding to it."
        >
          <Segmented
            label="Contribute to the counter"
            value={settings.contributeStats ? "on" : "off"}
            onChange={(value) => updateSettings({ contributeStats: value === "on" })}
            options={[
              { value: "on", label: "Count them" },
              { value: "off", label: "Don't" },
            ]}
          />
        </Setting>
      </Section>

      <Section title="Stored data">
        <div className="py-5">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-white/30">
                <th scope="col" className="pb-2 font-normal">Key</th>
                <th scope="col" className="pb-2 font-normal">Holds</th>
                <th scope="col" className="pb-2 text-right font-normal">Size</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {usage.map((entry) => (
                <tr key={entry.key} className="border-t border-white/[0.06]">
                  <td className="py-2 text-white/60">{entry.key}</td>
                  <td className="py-2 font-sans text-white/40">{entry.label}</td>
                  <td className="py-2 text-right tabular-nums text-white/40">{formatCount(entry.bytes)} B</td>
                </tr>
              ))}
              <tr className="border-t border-white/[0.06]">
                <td className="py-2 text-white/40">total</td>
                <td />
                <td className="py-2 text-right tabular-nums text-white/60">{formatCount(stored)} B</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetSettings}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60 transition-colors hover:text-white"
            >
              Restore default settings
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isBrowser || window.confirm("Erase saved names, history, options and settings from this browser?")) {
                  eraseEverything();
                }
              }}
              className="rounded-lg border border-red-400/20 bg-red-500/[0.06] px-3 py-2 text-xs text-red-300/90 transition-colors hover:bg-red-500/15"
            >
              Erase everything in this browser
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}
