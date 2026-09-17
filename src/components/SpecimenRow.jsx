import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "../lib/utils";

export default function SpecimenRow({ name, rarity, note }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(name);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={`Copy ${name}`}
      className="group flex w-full items-baseline gap-4 border-b border-white/[0.07] py-3 text-left transition-colors hover:border-white/20"
    >
      <span
        className={cn(
          "font-mono text-lg tracking-tight transition-colors sm:text-xl",
          copied ? "text-emerald-300" : "text-white/90 group-hover:text-white"
        )}
      >
        {name}
      </span>

      {note && (
        <span className="hidden flex-1 truncate text-xs text-white/25 sm:block">{note}</span>
      )}

      <span className="ml-auto flex items-center gap-3">
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-white/0 transition-colors group-hover:text-white/40" />
        )}
        <span className="w-7 text-right font-mono text-xs tabular-nums text-white/30">{rarity}</span>
      </span>
    </button>
  );
}
