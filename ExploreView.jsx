import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { generateUsernames, EXPLORE_PRESETS } from "./usernameEngine";
import GlassPanel from "./GlassPanel";
import VantaInput from "./VantaInput";
import ResultCard from "./ResultCard";

const CATEGORIES = Object.keys(EXPLORE_PRESETS);

function gen(category) {
  const preset = EXPLORE_PRESETS[category];
  return generateUsernames(preset, 18);
}

export default function ExploreView({ onRemix }) {
  const [category, setCategory] = useState("Rare");
  const [seed, setSeed] = useState(0);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("score");

  const items = useMemo(() => gen(category), [category, seed]);

  const filtered = useMemo(() => {
    let list = items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()));
    if (sort === "score") list = [...list].sort((a, b) => b.score - a.score);
    if (sort === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "len") list = [...list].sort((a, b) => a.name.length - b.name.length);
    return list;
  }, [items, query, sort]);

  useEffect(() => {
    setQuery("");
  }, [category]);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Explore</h1>
        <p className="mt-2 text-sm text-white/50">Browse curated username concepts by category.</p>
      </div>

      <GlassPanel className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <VantaInput
          icon={Search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search results…"
          className="flex-1"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 outline-none focus:border-violet-400/40"
        >
          <option value="score" className="bg-[#0c0c10]">Sort: Rarity</option>
          <option value="az" className="bg-[#0c0c10]">Sort: A–Z</option>
          <option value="len" className="bg-[#0c0c10]">Sort: Length</option>
        </select>
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </GlassPanel>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-300 ${
              category === c
                ? "border-violet-400/40 bg-violet-500/15 text-violet-100 shadow-[0_0_18px_-4px_rgba(139,92,246,0.6)]"
                : "border-white/10 bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white/80"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item, i) => (
          <ResultCard key={item.name + i} item={item} index={i} onRemix={onRemix} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="py-16 text-center text-sm text-white/40">No names match “{query}”.</p>
      )}
    </div>
  );
}