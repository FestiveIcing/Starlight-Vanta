import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { RefreshCw, Search } from "lucide-react";
import Seo from "../components/Seo";
import GlassPanel from "../components/GlassPanel";
import Field from "../components/Field";
import ResultCard from "../components/ResultCard";
import RemixModal from "../components/RemixModal";
import { COLLECTIONS, generate } from "../lib/engine";
import { useVanta } from "../state/VantaContext";
import { cn } from "../lib/utils";

export default function Collections() {
  const { recordGenerated } = useVanta();
  const [active, setActive] = useState(COLLECTIONS[0].name);
  const [seed, setSeed] = useState(1);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("rarity");
  const [remixTarget, setRemixTarget] = useState(null);

  const items = useMemo(() => {
    const collection = COLLECTIONS.find((entry) => entry.name === active) || COLLECTIONS[0];
    return generate(collection.config, 18, seed * 7919);
  }, [active, seed]);

  // The first batch renders on load; only batches the visitor asked for count.
  const firstBatch = useRef(true);
  useEffect(() => {
    if (firstBatch.current) {
      firstBatch.current = false;
      return;
    }
    const collection = COLLECTIONS.find((entry) => entry.name === active) || COLLECTIONS[0];
    recordGenerated(items.length, collection.config.style);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const shown = useMemo(() => {
    const filtered = items.filter((item) => item.name.includes(query.toLowerCase()));
    const sorted = [...filtered];
    if (sort === "rarity") sorted.sort((a, b) => b.rarity - a.rarity);
    if (sort === "flow") sorted.sort((a, b) => b.flow - a.flow);
    if (sort === "length") sorted.sort((a, b) => a.name.length - b.name.length);
    if (sort === "az") sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [items, query, sort]);

  return (
    <div className="flex flex-col gap-7">
      <Seo path="/collections" />

      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Collections</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/50">
          Each collection is the generator locked to one set of constraints. Refresh for a new batch.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {COLLECTIONS.map((collection) => (
          <button
            key={collection.name}
            type="button"
            onClick={() => setActive(collection.name)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors duration-200",
              active === collection.name
                ? "border-violet-400/50 bg-violet-500/15 text-violet-100"
                : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:text-white/85"
            )}
          >
            {collection.name}
          </button>
        ))}
      </div>

      <GlassPanel className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <Field
          icon={Search}
          value={query}
          onChange={(event) => setQuery(event.target.value.toLowerCase())}
          placeholder="Filter this batch…"
          className="flex-1"
          aria-label="Filter results"
        />
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          aria-label="Sort results"
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 outline-none focus:border-violet-400/40"
        >
          <option value="rarity" className="bg-[#0c0c10]">Sort by rarity</option>
          <option value="flow" className="bg-[#0c0c10]">Sort by flow</option>
          <option value="length" className="bg-[#0c0c10]">Sort by length</option>
          <option value="az" className="bg-[#0c0c10]">Sort A–Z</option>
        </select>
        <button
          type="button"
          onClick={() => setSeed((value) => value + 1)}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/60 transition-colors hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" /> New batch
        </button>
      </GlassPanel>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((item, index) => (
          <ResultCard key={item.name} item={item} index={index} onRemix={setRemixTarget} />
        ))}
      </div>

      {shown.length === 0 && (
        <p className="py-16 text-center text-sm text-white/40">Nothing in this batch matches “{query}”.</p>
      )}

      <AnimatePresence>
        {remixTarget && <RemixModal target={remixTarget} onClose={() => setRemixTarget(null)} />}
      </AnimatePresence>
    </div>
  );
}
