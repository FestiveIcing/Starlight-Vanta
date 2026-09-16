import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Check, Copy } from "lucide-react";
import Seo from "../components/Seo";
import { generateFromSeed, generate } from "../lib/engine";

export default function NotFound() {
  const { pathname } = useLocation();
  const [copied, setCopied] = useState("");

  const requested = decodeURIComponent(pathname).replace(/^\/+/, "").slice(0, 40);
  const seed = requested.replace(/[^a-zA-Z]/g, "");

  // A wrong URL is still a string somebody typed, which is the exact raw
  // material this site works with.
  const salvage = useMemo(
    () =>
      seed.length >= 2
        ? generateFromSeed(seed, { style: "aesthetic" }, 4, 404)
        : generate({ style: "rare", minLength: 4, maxLength: 8 }, 4, 404),
    [seed]
  );

  async function copy(name) {
    try {
      await navigator.clipboard.writeText(name);
      setCopied(name);
      setTimeout(() => setCopied(""), 1400);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10 py-10">
      <Seo path="/404" />

      <div className="flex flex-col gap-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-white/30">
          HTTP 404 · no route matched
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          There is nothing at{" "}
          <span className="break-all font-mono text-violet-300">/{requested || ""}</span>
        </h1>
        <p className="max-w-lg text-sm leading-relaxed text-white/50">
          {seed.length >= 2
            ? "It is not a page. It is a string somebody typed, which is the only thing this site needs to work with — so here is what the generator made of it."
            : "No page lives here. Have four names instead, on the way past."}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {salvage.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => copy(item.name)}
            className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 font-mono text-sm text-white/80 transition-colors hover:border-violet-400/40 hover:text-white"
          >
            {item.name}
            <span className="text-[10px] tabular-nums text-white/25">{item.rarity}</span>
            {copied === item.name ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <Copy className="h-3 w-3 text-white/20 group-hover:text-white/50" />
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/[0.08] pt-6 text-sm">
        <Link to="/" className="text-white/70 transition-colors hover:text-white">Home</Link>
        <Link to="/generator" className="text-white/40 transition-colors hover:text-white">Generator</Link>
        <Link to="/collections" className="text-white/40 transition-colors hover:text-white">Collections</Link>
        <Link to="/presets" className="text-white/40 transition-colors hover:text-white">Presets</Link>
        <Link to="/builder" className="text-white/40 transition-colors hover:text-white">Builder</Link>
      </div>
    </div>
  );
}
