import { useCallback, useEffect, useRef, useState } from "react";
import { newsApi } from "../api";
import { isAbort } from "../api/client";

export const AUTO_REFRESH_MS = 5 * 60 * 1000;

/**
 * Loads the news for some categories and keeps it fresh on its own:
 * it reloads every 5 minutes while the tab is visible, and right away when
 * the user comes back to a tab whose data is older than that.
 * Stories that appear during an automatic refresh are marked as new.
 */
export default function useNewsFeed(categories) {
  const key = categories.join(",");
  const [articles, setArticles] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [error, setError] = useState("");
  const [stale, setStale] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [newUrls, setNewUrls] = useState(() => new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [refreshNote, setRefreshNote] = useState("");
  const seenUrls = useRef(new Set());
  const controller = useRef(null);
  const lastLoad = useRef(0);

  const load = useCallback(
    async ({ background = false } = {}) => {
      if (!key) return;
      controller.current?.abort();
      controller.current = new AbortController();
      if (!background) setStatus((s) => (s === "ready" ? "ready" : "loading"));
      setError("");

      try {
        const data = await newsApi.feed(key.split(","), controller.current.signal);
        const fresh = data.articles.filter((a) => !seenUrls.current.has(a.url));
        if (seenUrls.current.size && fresh.length) {
          setNewUrls(new Set(fresh.map((a) => a.url)));
        } else if (!background) {
          setNewUrls(new Set());
        }
        data.articles.forEach((a) => seenUrls.current.add(a.url));
        setArticles(data.articles);
        setStale(Boolean(data.stale));
        setUpdatedAt(new Date());
        setStatus("ready");
        lastLoad.current = Date.now();
        return { fresh: fresh.length };
      } catch (err) {
        if (isAbort(err)) return { aborted: true };
        setError(err.message);
        setStatus((s) => (s === "ready" && background ? "ready" : "error"));
        return { failed: true };
      }
    },
    [key],
  );

  // Manual refresh: shows a spinner and says whether anything new arrived.
  const noteTimer = useRef(null);
  const refresh = useCallback(async () => {
    window.clearTimeout(noteTimer.current);
    setRefreshNote("");
    setRefreshing(true);
    const result = await load();
    setRefreshing(false);
    if (!result || result.aborted || result.failed) return;
    setRefreshNote(
      result.fresh
        ? `${result.fresh} new ${result.fresh === 1 ? "story" : "stories"}`
        : "You're up to date. No new stories yet.",
    );
    noteTimer.current = window.setTimeout(() => setRefreshNote(""), 4000);
  }, [load]);

  useEffect(() => () => window.clearTimeout(noteTimer.current), []);

  // First load whenever the categories change.
  useEffect(() => {
    seenUrls.current = new Set();
    setNewUrls(new Set());
    setArticles([]);
    if (!key) {
      setStatus("idle");
      return undefined;
    }
    setStatus("loading");
    load();
    return () => controller.current?.abort();
  }, [key, load]);

  // Automatic refresh.
  useEffect(() => {
    if (!key) return undefined;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") load({ background: true });
    }, AUTO_REFRESH_MS);
    const onVisible = () => {
      if (
        document.visibilityState === "visible" &&
        Date.now() - lastLoad.current > AUTO_REFRESH_MS
      ) {
        load({ background: true });
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [key, load]);

  return {
    articles,
    status,
    error,
    stale,
    updatedAt,
    newUrls,
    refreshing,
    refreshNote,
    refresh,
    dismissNew: () => setNewUrls(new Set()),
  };
}
