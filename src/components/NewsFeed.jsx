import { useCallback, useEffect, useState } from "react";
import { getNews } from "../api";
import { NEWS_CATEGORIES, categoryStyle } from "../categories";
import NotificationHistoryDrawer from "./NotificationHistoryDrawer";

export default function NewsFeed({
  categories,
  setCategories,
  frequency,
  setFrequency,
  newsCategories,
  newsRefreshKey,
  onRefresh,
  email,
  onSubscribe,
  onUnsubscribe,
  actionLoading,
}) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedCleared, setFeedCleared] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const closeHistory = useCallback(() => setHistoryOpen(false), []);

  useEffect(() => {
    if (newsCategories.length === 0 || feedCleared) {
      setArticles([]);
      setError("");
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);
    setError("");

    Promise.all(newsCategories.map((category) => getNews(category)))
      .then((results) => {
        const uniqueArticles = new Map();
        results.flat().forEach((article) => {
          const key = article._id || article.url;
          if (key) uniqueArticles.set(key, article);
        });
        return [...uniqueArticles.values()].sort(
          (first, second) =>
            new Date(second.publishedAt || 0) -
            new Date(first.publishedAt || 0),
        );
      })
      .then((data) => {
        if (active) setArticles(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [newsCategories, newsRefreshKey, feedCleared]);

  const toggleCategory = (category) => {
    if (categories.includes(category)) {
      setCategories((selected) =>
        selected.filter((item) => item !== category),
      );
    } else {
      setCategories((selected) => [...selected, category]);
      setFeedCleared(false);
    }
  };

  return (
    <div
      className={`flex flex-col gap-8 lg:min-h-0 lg:flex-1 ${
        newsCategories.length > 0 ? "lg:flex-row-reverse lg:items-stretch" : ""
      }`}
    >
      {/* YOUR ALERTS: settings panel. Sits to the right of the feed on large screens. */}
      <section
        className={`flex min-w-0 flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6 ${
          newsCategories.length > 0
            ? "lg:max-h-full lg:w-85 lg:flex-none lg:self-start lg:overflow-y-auto"
            : "mx-auto w-full max-w-md"
        }`}
      >
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Manage Your News Alerts
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            disabled={!email.trim()}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-gray-300 bg-violet-50 px-4 text-sm font-semibold text-brand-ink transition hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            Dashboard
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <span
            id="alert-frequency-label"
            className="text-[13px] font-semibold text-gray-700"
          >
            Alert Frequency
          </span>
          <div
            className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1"
            role="group"
            aria-label="Alert frequency"
          >
            {[
              { value: "immediate", label: "Real-Time" },
              { value: "hourly", label: "Hourly" },
              { value: "daily", label: "Daily" },
            ].map((option) => {
              const selected = frequency === option.value;
              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setFrequency(option.value)}
                  aria-pressed={selected}
                  className={`min-h-11 rounded-[9px] px-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    selected
                      ? "bg-white text-brand-ink shadow-sm ring-1 ring-brand"
                      : "text-gray-700 hover:bg-white/70"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-gray-700">
            Subscribed Topics
          </span>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="News categories"
          >
            {NEWS_CATEGORIES.map((newsCategory) => {
              const selected = categories.includes(newsCategory);
              return (
                <button
                  type="button"
                  key={newsCategory}
                  onClick={() => toggleCategory(newsCategory)}
                  aria-pressed={selected}
                  className={`flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium capitalize transition focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    selected
                      ? "border-brand bg-brand-soft text-brand-ink"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={selected ? 3 : 2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {selected ? (
                      <path d="M20 6 9 17l-5-5" />
                    ) : (
                      <path d="M12 5v14M5 12h14" />
                    )}
                  </svg>
                  {newsCategory}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => onSubscribe(email)}
            disabled={actionLoading || !email || categories.length === 0}
            className="min-h-[52px] w-full rounded-xl bg-brand px-5 text-base font-semibold text-white transition enabled:hover:bg-brand-dark enabled:active:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Save Preferences
          </button>
          <div className="border-t border-gray-200 pt-3">
            <button
              type="button"
              onClick={() => onUnsubscribe(email)}
              disabled={actionLoading || !email}
              className="min-h-[44px] w-full text-center text-sm font-semibold text-red-700 underline transition hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
            >
              Opt-out from Alerts
            </button>
          </div>
        </div>
      </section>

      {/* NEWS FEED: only the list inside scrolls on large screens. */}
      {newsCategories.length > 0 && (
        <section className="flex h-[70vh] min-h-80 w-full min-w-0 flex-col gap-4 lg:h-auto lg:min-h-0 lg:flex-1">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-[32px] font-semibold tracking-tight text-slate-900">
              News Feed
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFeedCleared(false);
                  onRefresh();
                }}
                disabled={actionLoading || loading}
                aria-label="Refresh feed"
                title="Refresh"
                className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-gray-300 bg-white text-slate-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <svg
                  className={`h-[18px] w-[18px] ${
                    loading ? "animate-spin" : ""
                  }`}
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
              </button>
              <button
                type="button"
                onClick={() => {
                  setArticles([]);
                  setFeedCleared(true);
                }}
                disabled={loading || feedCleared}
                className="flex min-h-[44px] items-center gap-2 rounded-[10px] bg-red-700 px-4 text-sm font-semibold text-white transition enabled:hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M6 6l1 14h10l1-14" />
                  <path d="M10 11v5M14 11v5" />
                </svg>
                Clear
              </button>
            </div>
          </div>

          <div
            role="region"
            aria-label="News stories"
            tabIndex={0}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pb-1 pr-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {feedCleared && (
              <p className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-[15px] text-gray-600">
                Your feed is clear. Press Refresh to load the latest stories.
              </p>
            )}
            {!feedCleared && loading && (
              <p className="text-sm text-gray-600">Loading news...</p>
            )}
            {!feedCleared && error && (
              <p role="alert" className="text-sm font-medium text-red-700">
                {error}
              </p>
            )}
            {!feedCleared && !loading && !error && articles.length === 0 && (
              <p className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-[15px] text-gray-600">
                No news found.
              </p>
            )}
            {!feedCleared && !loading && !error && articles.length > 0 && (
              <div className="space-y-4">
                {articles.map((article) => (
                  <article
                    key={article._id || article.url}
                    className="rounded-2xl border border-gray-200 bg-white p-5"
                  >
                    <div className="flex flex-col-reverse gap-4 sm:flex-row-reverse sm:items-start sm:gap-5">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-[13px] text-gray-600">
                          <span className="font-semibold text-slate-800">
                            {article.source?.name || "Unknown source"}
                          </span>
                          {article.publishedAt && (
                            <>
                              <span aria-hidden="true">·</span>
                              <time dateTime={article.publishedAt}>
                                {new Date(
                                  article.publishedAt,
                                ).toLocaleDateString()}
                              </time>
                            </>
                          )}
                          {article.category && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${categoryStyle(
                                  article.category,
                                )}`}
                              >
                                {article.category}
                              </span>
                            </>
                          )}
                        </div>
                        <h3 className="font-serif text-[21px] font-semibold leading-tight tracking-tight text-slate-900">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-brand hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                          >
                            {article.title}
                          </a>
                        </h3>
                        {article.description && (
                          <p className="line-clamp-2 text-[15px] leading-normal text-gray-700">
                            {article.description}
                          </p>
                        )}
                      </div>
                      <div
                        className={`flex h-36 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl sm:h-24 sm:w-32 ${categoryStyle(
                          article.category,
                        )}`}
                      >
                        {article.imageUrl ? (
                          <img
                            src={article.imageUrl}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover object-center"
                          />
                        ) : (
                          <svg
                            className="h-8 w-8"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <rect x="3" y="4" width="18" height="16" rx="2" />
                            <circle cx="9" cy="10" r="1.6" />
                            <path d="m21 16-5-5-8 8" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {historyOpen && (
        <NotificationHistoryDrawer
          email={email.trim()}
          onClose={closeHistory}
        />
      )}
    </div>
  );
}
