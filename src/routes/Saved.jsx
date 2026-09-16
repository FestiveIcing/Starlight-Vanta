import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Search, Trash2 } from "lucide-react";
import Seo from "../components/Seo";
import Field from "../components/Field";
import ResultCard from "../components/ResultCard";
import EmptyState from "../components/EmptyState";
import RemixModal from "../components/RemixModal";
import { useVanta } from "../state/VantaContext";
import { cn } from "../lib/utils";

function ago(timestamp) {
  if (!timestamp) return "";
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function Saved() {
  const { favorites, history, clearFavorites, clearHistory, removeHistory } = useVanta();
  const [tab, setTab] = useState("favorites");
  const [query, setQuery] = useState("");
  const [remixTarget, setRemixTarget] = useState(null);

  const source = tab === "favorites" ? favorites : history;
  const shown = useMemo(
    () => source.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())),
    [source, query]
  );

  return (
    <div className="flex flex-col gap-7">
      <Seo path="/saved" />

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Saved</h1>
          <p className="mt-2 text-sm text-white/50">
            Stored in this browser. Clearing site data clears this list, and nothing syncs anywhere.
          </p>
        </div>
        <button
          type="button"
          onClick={tab === "favorites" ? clearFavorites : clearHistory}
          className="flex items-center gap-1.5 self-start rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/55 transition-colors hover:border-red-400/30 hover:text-red-300"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear {tab}
        </button>
      </header>

      <div className="flex items-center gap-2">
        {["favorites", "history"].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs capitalize transition-colors",
              tab === value
                ? "border-violet-400/50 bg-violet-500/15 text-violet-100"
                : "border-white/10 text-white/45 hover:text-white"
            )}
          >
            {value} ({value === "favorites" ? favorites.length : history.length})
          </button>
        ))}
      </div>

      {source.length === 0 ? (
        <EmptyState
          title={tab === "favorites" ? "Nothing bookmarked yet." : "No history yet."}
          desc={
            tab === "favorites"
              ? "Bookmark a name anywhere on the site and it lands here."
              : "The last few names from each generator run are kept here so you can find one again."
          }
          actionLabel="Open the generator"
          to="/generator"
        />
      ) : (
        <>
          <Field
            icon={Search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${tab}…`}
            aria-label={`Search ${tab}`}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((item, index) => (
              <div key={`${item.name}-${item.at || item.savedAt || index}`} className="flex flex-col gap-1">
                <ResultCard item={item} index={index} onRemix={setRemixTarget} />
                {tab === "history" && (
                  <div className="flex items-center justify-between px-1 text-[10px] text-white/25">
                    <span>{ago(item.at)}</span>
                    <button type="button" onClick={() => removeHistory(item.name)} className="hover:text-red-300">
                      remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {shown.length === 0 && (
            <p className="py-16 text-center text-sm text-white/40">Nothing matches “{query}”.</p>
          )}
        </>
      )}

      <AnimatePresence>
        {remixTarget && <RemixModal target={remixTarget} onClose={() => setRemixTarget(null)} />}
      </AnimatePresence>
    </div>
  );
}
