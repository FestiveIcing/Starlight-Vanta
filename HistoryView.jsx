import { useMemo, useState } from "react";
import { Clock, Search, Trash2 } from "lucide-react";
import { useVanta } from "./VantaContext";
import EmptyState from "./EmptyState";
import VantaInput from "./VantaInput";
import ResultCard from "./ResultCard";

function timeAgo(ts) {
  if (!ts) return "";
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function HistoryView({ setView, onRemix }) {
  const { history, clearHistory, removeHistory } = useVanta();
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => history.filter((h) => h.name.toLowerCase().includes(query.toLowerCase())),
    [history, query]
  );

  if (history.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">History</h1>
          <p className="mt-2 text-sm text-white/50">A local log of your activity.</p>
        </div>
        <EmptyState
          title="No history yet."
          desc="Items appear here so you can revisit, copy, or remix them later."
          actionLabel="Open generator"
          onAction={() => setView("generator")}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">History</h1>
          <p className="mt-2 text-sm text-white/50">A local log of your activity.</p>
        </div>
        <button
          onClick={clearHistory}
          className="flex items-center gap-1.5 self-start rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60 transition-colors hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear history
        </button>
      </div>

      <VantaInput
        icon={Search}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search history…"
        className="w-full"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item, i) => (
          <div key={item.name + i + (item.ts || 0)} className="relative">
            <ResultCard item={item} index={i} onRemix={onRemix} />
            <div className="mt-1 flex items-center justify-between px-1 text-[10px] text-white/30">
              <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {timeAgo(item.ts)}</span>
              <button onClick={() => removeHistory(item.name)} className="hover:text-red-300">remove</button>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="py-16 text-center text-sm text-white/40">No history matches “{query}”.</p>
      )}
    </div>
  );
}