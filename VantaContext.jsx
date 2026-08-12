import { createContext, useContext, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

const VantaContext = createContext(null);
export const useVanta = () => useContext(VantaContext);

const DEFAULT_SETTINGS = {
  animationIntensity: 1,
  reduceMotion: false,
  backgroundEffects: true,
  soundEffects: false,
};

const PREFERS_REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function VantaProvider({ children }) {
  const [favorites, setFavorites] = useLocalStorage("vanta.favorites", []);
  const [history, setHistory] = useLocalStorage("vanta.history", []);
  const [settings, setSettings] = useLocalStorage("vanta.settings", {
    ...DEFAULT_SETTINGS,
    reduceMotion: PREFERS_REDUCED,
  });

  const addFavorite = useCallback((item) => {
    setFavorites((prev) =>
      prev.some((f) => f.name === item.name)
        ? prev
        : [{ ...item, ts: Date.now(), favorite: true }, ...prev]
    );
  }, [setFavorites]);

  const removeFavorite = useCallback((name) => {
    setFavorites((prev) => prev.filter((f) => f.name !== name));
  }, [setFavorites]);

  const isFavorite = useCallback(
    (name) => favorites.some((f) => f.name === name),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (item) => {
      if (favorites.some((f) => f.name === item.name)) {
        setFavorites((prev) => prev.filter((f) => f.name !== item.name));
      } else {
        setFavorites((prev) => [{ ...item, ts: Date.now(), favorite: true }, ...prev]);
      }
    },
    [favorites, setFavorites]
  );

  const addHistory = useCallback((items) => {
    const stamped = items.map(({ name, style, score, structure }) => ({
      name, style, score, structure, ts: Date.now(),
    }));
    setHistory((prev) => [...stamped, ...prev].slice(0, 200));
  }, [setHistory]);

  const removeHistory = useCallback((name) => {
    setHistory((prev) => prev.filter((h) => h.name !== name));
  }, [setHistory]);

  const clearHistory = useCallback(() => setHistory([]), [setHistory]);
  const clearFavorites = useCallback(() => setFavorites([]), [setFavorites]);

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, [setSettings]);

  const resetLocal = useCallback(() => {
    setFavorites([]);
    setHistory([]);
    setSettings({ ...DEFAULT_SETTINGS, reduceMotion: PREFERS_REDUCED });
  }, [setFavorites, setHistory, setSettings]);

  return (
    <VantaContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
        history,
        addHistory,
        removeHistory,
        clearHistory,
        settings,
        updateSettings,
        clearFavorites,
        resetLocal,
      }}
    >
      {children}
    </VantaContext.Provider>
  );
}