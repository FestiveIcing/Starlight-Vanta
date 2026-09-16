import { useCallback, useEffect, useRef, useState } from "react";
import { isBrowser } from "./utils";

const BASELINE = 5000;
const FLUSH_DELAY = 4000;

export const EMPTY_STATS = {
  configured: false,
  total: BASELINE,
  today: 0,
  week: 0,
  baseline: BASELINE,
  styles: [],
};

// Batched so a burst of regenerate clicks is one request. Nothing about the
// visitor travels with it — a number and the name of a style, and that is all.
export function useStats({ contribute = true } = {}) {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loaded, setLoaded] = useState(false);
  const pending = useRef({ count: 0, style: "unknown" });
  const timer = useRef(null);

  const flush = useCallback(async () => {
    const batch = pending.current;
    if (!batch.count) return;
    pending.current = { count: 0, style: batch.style };
    try {
      const res = await fetch("/api/stats", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(batch),
        keepalive: true,
      });
      if (res.ok) setStats(await res.json());
    } catch {
      /* the counter is decoration; a failed write never interrupts generating */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats")
      .then((res) => (res.ok ? res.json() : EMPTY_STATS))
      .then((data) => {
        if (!cancelled) {
          setStats(data);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isBrowser) return undefined;
    const onHide = () => flush();
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [flush]);

  const record = useCallback(
    (count, style) => {
      setStats((prev) => ({ ...prev, total: prev.total + count, today: prev.today + count }));
      if (!contribute || !isBrowser) return;
      pending.current = { count: pending.current.count + count, style };
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(flush, FLUSH_DELAY);
    },
    [contribute, flush]
  );

  return { stats, loaded, record };
}
