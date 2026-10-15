import { useEffect, useState } from "react";
import { getNews } from "../api";
import { NEWS_CATEGORIES } from "../categories";

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
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Alert frequency: <span className="capitalize">{frequency}</span>
      </p>

      <div className="flex flex-wrap gap-2 mb-4" aria-label="News categories">
        {NEWS_CATEGORIES.map((newsCategory) => (
          <button
            type="button"
            key={newsCategory}
            onClick={() => toggleCategory(newsCategory)}
            aria-pressed={categories.includes(newsCategory)}
            className={`px-3 py-1 rounded-full text-sm border capitalize ${
              categories.includes(newsCategory)
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700 border-gray-300"
            }`}
          >
            {newsCategory}
          </button>
        ))}
      </div>

      <label
        htmlFor="alert-frequency"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Alert Frequency
      </label>
      <select
        id="alert-frequency"
        value={frequency}
        onChange={(event) => setFrequency(event.target.value)}
        className="w-full sm:w-auto border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="immediate">Immediate</option>
        <option value="hourly">Hourly</option>
        <option value="daily">Daily</option>
      </select>

      <div className="flex gap-3 mb-4">
        <button
          type="button"
          onClick={() => onSubscribe(email)}
          disabled={actionLoading || !email || categories.length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Save / Subscribe
        </button>
        <button
          type="button"
          onClick={() => onUnsubscribe(email)}
          disabled={actionLoading || !email}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Unsubscribe
        </button>
      </div>

      {newsCategories.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-lg font-semibold text-gray-900">News Feed</h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setFeedCleared(false);
                  onRefresh();
                }}
                disabled={actionLoading || loading}
                className="text-sm text-blue-600 hover:underline disabled:opacity-50"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={() => {
                  setArticles([]);
                  setFeedCleared(true);
                }}
                disabled={loading || feedCleared}
                className="text-sm text-red-600 hover:underline disabled:opacity-40 disabled:no-underline"
              >
                Clear
              </button>
            </div>
          </div>

          {!feedCleared && loading && (
            <p className="text-sm text-gray-500">Loading news...</p>
          )}
          {!feedCleared && error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {!feedCleared && !loading && !error && articles.length === 0 && (
            <p className="text-sm text-gray-500">No news found.</p>
          )}
          {!feedCleared && !loading && !error && articles.length > 0 && (
            <ul className="divide-y divide-gray-200">
              {articles.map((article) => (
                <li key={article._id || article.url} className="py-3">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-blue-700 hover:underline"
                  >
                    {article.title}
                  </a>
                  {article.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {article.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {article.source?.name || "Unknown source"}
                    {article.publishedAt &&
                      ` · ${new Date(article.publishedAt).toLocaleString()}`}
                    {article.category && ` · ${article.category}`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
