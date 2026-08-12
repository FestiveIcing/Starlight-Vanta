import { motion } from "framer-motion";
import { cn } from "./utils";

const NAV = [
  { id: "generator", label: "Generator" },
  { id: "presets", label: "Presets" },
  { id: "explore", label: "Explore" },
  { id: "favorites", label: "Favorites" },
  { id: "history", label: "History" },
  { id: "settings", label: "Settings" },
];

export default function Navbar({ view, setView }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4">
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex w-full max-w-5xl items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 backdrop-blur-xl"
      >
        <button onClick={() => setView("generator")} className="flex items-baseline gap-2">
          <span className="text-sm font-semibold tracking-tight text-white">Starlight Vanta</span>
          <span className="hidden text-[10px] text-white/30 sm:inline">by Starlight Solutions, Inc.</span>
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              className={cn(
                "relative rounded-full px-3 py-1.5 text-xs transition-colors duration-300",
                view === n.id ? "text-white" : "text-white/45 hover:text-white/80"
              )}
            >
              {view === n.id && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 -z-10 rounded-full border border-white/10 bg-white/[0.06]"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              {n.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setView("generator")}
          className="rounded-full bg-violet-600 px-4 py-1.5 text-xs font-medium text-white shadow-[0_0_22px_-6px_rgba(124,58,237,0.8)] transition-all duration-300 hover:bg-violet-500 hover:scale-[1.04] active:scale-95"
        >
          Generate
        </button>
      </motion.nav>

      {/* mobile nav */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-center gap-1 border-t border-white/10 bg-black/60 px-2 py-2 backdrop-blur-xl md:hidden">
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => setView(n.id)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] transition-colors",
              view === n.id ? "bg-white/10 text-white" : "text-white/40"
            )}
          >
            {n.label}
          </button>
        ))}
      </div>
    </header>
  );
}