import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { VantaProvider, useVanta } from "./VantaContext";
import Background from "./Background";
import Navbar from "./Navbar";
import GeneratorView from "./GeneratorView";
import ExploreView from "./ExploreView";
import FavoritesView from "./FavoritesView";
import HistoryView from "./HistoryView";
import SettingsView from "./SettingsView";
import CustomBuilder from "./CustomBuilder";
import PresetsView from "./PresetsView";
import RemixModal from "./RemixModal";
import { DEFAULT_CONFIG } from "./usernameEngine";

const VIEWS = {
  generator: GeneratorView,
  presets: PresetsView,
  explore: ExploreView,
  favorites: FavoritesView,
  history: HistoryView,
  settings: SettingsView,
  builder: CustomBuilder,
};

function Shell() {
  const { settings } = useVanta();
  const [view, setView] = useState("generator");
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [remixTarget, setRemixTarget] = useState(null);
  const ViewComp = VIEWS[view] || GeneratorView;

  return (
    <div className="relative min-h-screen">
      <Background
        effects={settings.backgroundEffects}
        intensity={settings.reduceMotion ? 0 : settings.animationIntensity}
      />
      <Navbar view={view} setView={setView} />
      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-28 pt-28 sm:px-6 lg:px-8 md:pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <ViewComp setView={setView} onRemix={setRemixTarget} config={config} setConfig={setConfig} />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-[11px] text-white/25">
        Starlight Vanta — a product by Starlight Solutions, Inc.
      </footer>

      <AnimatePresence>
        {remixTarget && <RemixModal target={remixTarget} onClose={() => setRemixTarget(null)} />}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  return (
    <VantaProvider>
      <Shell />
    </VantaProvider>
  );
}