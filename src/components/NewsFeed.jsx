import { useState } from "react";
import useNewsFeed, { AUTO_REFRESH_MS } from "../hooks/useNewsFeed";
import ArticleCard from "./ArticleCard";

const formatTime = (date) =>
  date?.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

export default function NewsFeed({ categories }) {
  const feed = useNewsFeed(categories);
  const [filter, setFilter] = useState("all");

  const activeFilter = filter === "all" || categories.includes(filter) ? filter : "all";
  const shown =
    activeFilter === "all"
      ? feed.articles
      : feed.articles.filter((a) => a.category === activeFilter);

  const loading = feed.status === "loading";
  const busy = loading || feed.refreshing;

  return (
    <section aria-labelledby="feed-title" className="flex min-w-0 flex-1 flex-col gap-4 lg:min-h-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="feed-title" className="font-serif text-[32px] font-semibold tracking-tight text-slate-900">
            News Feed
          </h2>
          <p className="text-xs text-gray-600" aria-live="polite">
            {feed.updatedAt
              ? `Updated ${formatTime(feed.updatedAt)} · refreshes automatically every ${AUTO_REFRESH_MS / 60000} minutes`
              : "Loading the latest stories..."}
            {feed.refreshNote && (
              <span className="ml-1 font-semibold text-slate-800">· {feed.refreshNote}</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={feed.refresh}
          disabled={busy}
          className="flex min-h-11 items-center gap-2 rounded-[10px] border border-gray-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-gray-50 disabled:opacity-50"
        >
          <svg
            className={`h-4 w-4 ${busy ? "animate-spin" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
          Refresh
        </button>
      </div>

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Show stories from">
          {["all", ...categories].map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setFilter(category)}
              aria-pressed={activeFilter === category}
              className={`min-h-9 rounded-full border px-3 text-sm font-medium capitalize transition ${
                activeFilter === category
                  ? "border-brand bg-brand text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {category === "all" ? "All topics" : category}
            </button>
          ))}
        </div>
      )}

      {feed.newUrls.size > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-brand/30 bg-brand-soft px-4 py-3 text-sm font-medium text-brand-ink" role="status">
          <span>
            {feed.newUrls.size} new {feed.newUrls.size === 1 ? "story" : "stories"} since you opened the page.
          </span>
          <button type="button" onClick={feed.dismissNew} className="font-semibold underline">
            Mark as seen
          </button>
        </div>
      )}

      {feed.stale && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          The news service is not responding right now, so you are seeing the latest stories we already have.
        </p>
      )}
      {feed.error && feed.status === "ready" && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Could not refresh: {feed.error}
        </p>
      )}

      <div
        className="space-y-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain lg:pr-2"
        aria-busy={busy}
        tabIndex={0}
        aria-label="Stories"
      >
        {loading &&
          [0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl border border-gray-200 bg-white" />
          ))}
        {feed.status === "error" && (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-900">
            <p className="font-semibold">The news could not be loaded.</p>
            <p className="mt-1">{feed.error}</p>
            <button type="button" onClick={feed.refresh} className="mt-3 font-semibold underline">
              Try again
            </button>
          </div>
        )}
        {feed.status === "ready" && shown.length === 0 && (
          <p className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-[15px] text-gray-600">
            No stories right now. New ones will appear here automatically.
          </p>
        )}
        {feed.status === "ready" &&
          shown.map((article) => (
            <ArticleCard
              key={article._id || article.url}
              article={article}
              isNew={feed.newUrls.has(article.url)}
            />
          ))}
      </div>
    </section>
  );
}
