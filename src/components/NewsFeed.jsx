import { useEffect, useState } from "react";
import { getNews } from "../api";
import { NEWS_CATEGORIES } from "../categories";
import SubscribeForm from "./SubscribeForm";

export default function NewsFeed({
  categories,
  setCategories,
  frequency,
  setFrequency,
  newsCategories,
  newsRefreshKey,
  onRefresh,
  email,
  setEmail,
  onSubscribe,
  onUnsubscribe,
  actionLoading,
}) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedCleared, setFeedCleared] = useState(false);

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
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-base font-bold text-slate-900">
            Manage Your News Alerts
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Customize your delivery schedule and target feed topics.
          </p>
        </div>

        <div className="space-y-6 p-6">
          <SubscribeForm email={email} setEmail={setEmail} />

          <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-3">
            <div className="space-y-1.5 md:col-span-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Alert Frequency
              </span>
              <div className="flex flex-wrap gap-2" aria-label="Alert frequency">
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
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                        selected
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Subscribed Topics
              </span>
              <div className="flex flex-wrap gap-2" aria-label="News categories">
                {NEWS_CATEGORIES.map((newsCategory) => {
                  const selected = categories.includes(newsCategory);
                  return (
                    <button
                      type="button"
                      key={newsCategory}
                      onClick={() => toggleCategory(newsCategory)}
                      aria-pressed={selected}
                      className={`flex items-center rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
                        selected
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {newsCategory}
                      {selected && (
                        <span aria-hidden="true" className="ml-1.5">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-4 sm:flex-row">
            <button
              type="button"
              onClick={() => onSubscribe(email)}
              disabled={actionLoading || !email || categories.length === 0}
              className="w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Save Preferences
            </button>
            <button
              type="button"
              onClick={() => onUnsubscribe(email)}
              disabled={actionLoading || !email}
              className="w-full rounded-lg px-4 py-2 text-center text-sm font-medium text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Unsubscribe from all alerts
            </button>
          </div>
        </div>
      </section>

      {newsCategories.length > 0 && (
        <section className="mx-auto flex h-[70vh] min-h-[320px] max-h-[48rem] w-full max-w-2xl flex-col overflow-hidden bg-slate-50">
          <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 p-4">
            <h2 className="text-lg font-bold text-slate-900">
              News Feed
            </h2>
            <div className="flex items-center space-x-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setFeedCleared(false);
                  onRefresh();
                }}
                disabled={actionLoading || loading}
                className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
              >
                Refresh
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => {
                  setArticles([]);
                  setFeedCleared(true);
                }}
                disabled={loading || feedCleared}
                className="text-rose-600 hover:text-rose-800 disabled:opacity-40"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            {!feedCleared && loading && (
              <p className="text-sm text-slate-500">Loading news...</p>
            )}
            {!feedCleared && error && (
              <p role="alert" className="text-sm text-rose-600">
                {error}
              </p>
            )}
            {!feedCleared && !loading && !error && articles.length === 0 && (
              <p className="text-sm text-slate-500">No news found.</p>
            )}
            {!feedCleared && !loading && !error && articles.length > 0 && (
              <div className="space-y-4">
                {articles.map((article) => (
                  <article
                    key={article._id || article.url}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col-reverse gap-5 sm:flex-row">
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="rounded-md bg-slate-100 px-2.5 py-1 font-bold uppercase text-slate-800">
                            {article.source?.name || "Unknown source"}
                          </span>
                          {article.publishedAt && (
                            <>
                              <span className="text-slate-300">•</span>
                              <time
                                className="text-slate-500"
                                dateTime={article.publishedAt}
                              >
                                {new Date(
                                  article.publishedAt,
                                ).toLocaleDateString()}
                              </time>
                            </>
                          )}
                          {article.category && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700">
                                {article.category}
                              </span>
                            </>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-indigo-600 hover:underline"
                          >
                            {article.title}
                          </a>
                        </h3>
                        {article.description && (
                          <p className="line-clamp-2 text-sm text-slate-600">
                            {article.description}
                          </p>
                        )}
                      </div>
                      <div className="h-24 w-full shrink-0 rounded-lg bg-slate-100 sm:w-32">
                        {article.imageUrl && (
                          <img
                            src={article.imageUrl}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover object-center"
                          />
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
    </div>
  );
}
