import { useMemo, useState } from "react";
import { Heart, Search } from "lucide-react";
import { useVanta } from "./VantaContext";
import EmptyState from "./EmptyState";
import VantaInput from "./VantaInput";
import ResultCard from "./ResultCard";

export default function FavoritesView({ setView, onRemix }) {
  const { favorites } = useVanta();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");

  const filtered = useMemo(() => {
    let list = favorites.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));
    if (sort === "recent") list = [...list].sort((a, b) => (b.ts || 0) - (a.ts || 0));
    if (sort === "score") list = [...list].sort((a, b) => (b.score || 0) - (a.score || 0));
    if (sort === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [favorites, query, sort]);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Favorites</h1>
        <p className="mt-2 text-sm text-white/50">Saved locally in your browser — no account required.</p>
      </div>

      {favorites.length === 0 ? (
        <EmptyState
          title="Nothing saved yet."
          desc="Generate something worth keeping, then tap the heart to save it here."
          actionLabel="Explore usernames"
          onAction={() => setView("explore")}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <VantaInput
              icon={Search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search favorites…"
              className="flex-1"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 outline-none focus:border-violet-400/40"
            >
              <option value="recent" className="bg-[#0c0c10]">Sort: Recent</option>
              <option value="score" className="bg-[#0c0c10]">Sort: Rarity</option>
              <option value="az" className="bg-[#0c0c10]">Sort: A–Z</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item, i) => (
              <ResultCard key={item.name + i} item={item} index={i} onRemix={onRemix} />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="py-16 text-center text-sm text-white/40">No favorites match “{query}”.</p>
          )}
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-white/30">
            <Heart className="h-3 w-3" /> {favorites.length} saved locally
          </p>
        </>
      )}
    </div>
  );
}