import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "../lib/utils";

export default function NameChip({ name, rarity, size = "md" }) {
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
      className={cn(
        "group inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] font-mono text-white/80 transition-colors hover:border-violet-400/40 hover:bg-white/[0.06] hover:text-white",
        size === "lg" ? "px-4 py-2.5 text-base" : "px-3 py-1.5 text-sm"
      )}
    >
      <span className={copied ? "text-emerald-300" : undefined}>{name}</span>
      {typeof rarity === "number" && (
        <span className="text-[10px] tabular-nums text-white/25">{rarity}</span>
      )}
      {copied ? (
        <Check className="h-3 w-3 text-emerald-400" />
      ) : (
        <Copy className="h-3 w-3 text-white/15 transition-colors group-hover:text-white/50" />
      )}
    </button>
  );
}
