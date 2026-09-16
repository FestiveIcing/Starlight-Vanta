import { useCallback, useEffect, useState } from "react";
import { isBrowser } from "./utils";

function read(key, fallback) {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function useLocalState(key, initial) {
  const [value, setValue] = useState(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(read(key, initial));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback(
    (updater) => {
      setValue((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        if (isBrowser) {
          try {
            window.localStorage.setItem(key, JSON.stringify(next));
          } catch {
            /* storage unavailable — the session still works, it just won't persist */
          }
        }
        return next;
      });
    },
    [key]
  );

  return [value, set, hydrated];
}
