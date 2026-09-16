import { createContext, useCallback, useContext, useMemo } from "react";
import { useLocalState } from "../lib/storage";
import { useStats } from "../lib/stats";
import { DEFAULT_CONFIG } from "../lib/engine";

const VantaContext = createContext(null);

export const useVanta = () => useContext(VantaContext);

export const DEFAULT_SETTINGS = {
  motion: "full",
  backgroundEffects: true,
  soundEffects: false,
  contributeStats: true,
  keepHistory: true,
  historyLimit: 120,
};

export function VantaProvider({ children }) {
  const [favorites, setFavorites] = useLocalState("vanta.favorites", []);
  const [history, setHistory] = useLocalState("vanta.history", []);
  const [settings, setSettings] = useLocalState("vanta.settings", DEFAULT_SETTINGS);
  const [config, setConfig] = useLocalState("vanta.config", DEFAULT_CONFIG);

  const { stats, loaded: statsLoaded, record } = useStats({ contribute: settings.contributeStats });

  const isFavorite = useCallback((name) => favorites.some((f) => f.name === name), [favorites]);

  const toggleFavorite = useCallback(
    (item) => {
      setFavorites((prev) =>
        prev.some((f) => f.name === item.name)
          ? prev.filter((f) => f.name !== item.name)
          : [{ ...item, savedAt: Date.now() }, ...prev]
      );
    },
    [setFavorites]
  );

  const addHistory = useCallback(
    (items) => {
      if (!settings.keepHistory || !items.length) return;
      const stamped = items.map(({ name, style, rarity, flow, structure }) => ({
        name, style, rarity, flow, structure, at: Date.now(),
      }));
      setHistory((prev) => [...stamped, ...prev].slice(0, settings.historyLimit));
    },
    [setHistory, settings.keepHistory, settings.historyLimit]
  );

  const value = useMemo(
    () => ({
      favorites,
      isFavorite,
      toggleFavorite,
      clearFavorites: () => setFavorites([]),
      history,
      addHistory,
      removeHistory: (name) => setHistory((prev) => prev.filter((h) => h.name !== name)),
      clearHistory: () => setHistory([]),
      settings,
      updateSettings: (patch) => setSettings((prev) => ({ ...prev, ...patch })),
      resetSettings: () => setSettings(DEFAULT_SETTINGS),
      config,
      setConfig,
      resetConfig: () => setConfig(DEFAULT_CONFIG),
      reduceMotion: settings.motion === "off",
      stats,
      statsLoaded,
      recordGenerated: record,
      eraseEverything: () => {
        setFavorites([]);
        setHistory([]);
        setSettings(DEFAULT_SETTINGS);
        setConfig(DEFAULT_CONFIG);
      },
    }),
    [favorites, history, settings, config, stats, statsLoaded, isFavorite, toggleFavorite, addHistory, record, setFavorites, setHistory, setSettings, setConfig]
  );

  return <VantaContext.Provider value={value}>{children}</VantaContext.Provider>;
}
