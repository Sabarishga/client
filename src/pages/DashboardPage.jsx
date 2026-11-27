import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { notificationsApi } from "../api";
import { isAbort } from "../api/client";
import { ArticleImage } from "../components/ArticleCard";
import { NEWS_CATEGORIES, categoryStyle } from "../categories";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const PAGE_SIZE = 10;

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

const safeHref = (url) => (/^https?:\/\//i.test(url || "") ? url : undefined);

const CHANNEL_LABEL = { email: "Email", browser: "Browser" };

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

/** Alert history. Filters, sort and page live in the URL, so refresh and Back keep them. */
export default function DashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const selected = (params.get("category") || "").split(",").filter((c) => NEWS_CATEGORIES.includes(c));
  const sort = params.get("sort") === "oldest" ? "oldest" : "newest";
  const page = Math.max(1, Number.parseInt(params.get("page"), 10) || 1);
  const selectedKey = selected.join(",");

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const updateParams = useCallback(
    (changes) => {
      const next = new URLSearchParams(params);
      Object.entries(changes).forEach(([key, value]) => {
        if (value === undefined || value === "" || value === null) next.delete(key);
        else next.set(key, value);
      });
      setParams(next);
    },
    [params, setParams],
  );

  useEffect(() => {
    const controller = new AbortController();
    notificationsApi
      .summary(controller.signal)
      .then(setSummary)
      .catch(() => {});
    return () => controller.abort();
  }, [reloadKey]);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    setError("");
    notificationsApi
      .list({ categories: selectedKey ? selectedKey.split(",") : [], sort, page, limit: PAGE_SIZE }, controller.signal)
      .then((data) => {
        setItems(data.notifications);
        setPagination(data.pagination);
        setStatus("ready");
      })
      .catch((err) => {
        if (isAbort(err)) return;
        setError(err.message);
        setStatus("error");
      });
    return () => controller.abort();
  }, [selectedKey, sort, page, reloadKey]);

  const toggleCategory = (category) => {
    const next = selected.includes(category)
      ? selected.filter((c) => c !== category)
      : [...selected, category];
    updateParams({ category: next.join(","), page: undefined });
  };

  const clearHistory = async () => {
    try {
      const result = await notificationsApi.clear();
      toast.success(result.message);
      setConfirmClear(false);
      updateParams({ page: undefined, category: undefined });
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const counts = Object.fromEntries((summary?.categories || []).map((c) => [c.category, c.count]));
  const prefs = user.preferences;
  const filtering = selected.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[32px] font-semibold tracking-tight">Notification History</h1>
          <p className="text-sm text-gray-600">Every story we have sent you, newest first.</p>
        </div>
        <Link
          to="/feed"
          className="min-h-11 rounded-[10px] border border-brand bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:border-brand-dark hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Back to News Feed
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Stories sent" value={summary ? summary.total : "…"} />
        <StatCard label="Last alert" value={summary?.lastSentAt ? formatDateTime(summary.lastSentAt) : "None yet"} />
        <StatCard
          label="Alerts"
          value={
            prefs.subscribed
              ? `On · ${[prefs.channels.email && "Email", prefs.channels.browser && "Browser"].filter(Boolean).join(" + ")}`
              : "Off"
          }
        />
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <button
            type="button"
            onClick={() => updateParams({ category: undefined, page: undefined })}
            aria-pressed={!filtering}
            className={`min-h-10 rounded-full border px-3.5 text-sm font-medium transition ${
              !filtering ? "border-brand bg-brand text-white" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            All{summary ? ` (${summary.total})` : ""}
          </button>
          {NEWS_CATEGORIES.map((category) => (
            <button
              type="button"
              key={category}
              onClick={() => toggleCategory(category)}
              aria-pressed={selected.includes(category)}
              className={`min-h-10 rounded-full border px-3.5 text-sm font-medium capitalize transition ${
                selected.includes(category)
                  ? "border-brand bg-brand text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {category}
              {summary ? ` (${counts[category] || 0})` : ""}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-600" aria-live="polite">
            {status === "loading"
              ? "Loading..."
              : `${pagination.total} ${pagination.total === 1 ? "story" : "stories"}${filtering ? " in the selected categories" : ""}`}
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="history-sort" className="text-[13px] font-semibold text-gray-700">
              Sort
            </label>
            <select
              id="history-sort"
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value === "oldest" ? "oldest" : undefined, page: undefined })}
              className="min-h-10 rounded-[10px] border border-gray-300 bg-white px-3 text-sm"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {status === "loading" &&
          [0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl border border-gray-200 bg-white" />)}

        {status === "error" && (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">
            <p className="font-semibold">Your history could not be loaded.</p>
            <p className="mt-1">{error}</p>
            <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="mt-3 font-semibold underline">
              Try again
            </button>
          </div>
        )}

        {status === "ready" && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-[15px] text-gray-600">
            {filtering ? (
              "No stories match the selected categories."
            ) : prefs.subscribed ? (
              <>
                No alerts yet. Your first one should arrive within a few minutes, or use{" "}
                <Link to="/feed" className="font-semibold text-brand underline">
                  Send me a test alert now
                </Link>{" "}
                on the feed page.
              </>
            ) : (
              <>
                Alerts are off.{" "}
                <Link to="/feed" className="font-semibold text-brand underline">
                  Choose your topics and save
                </Link>{" "}
                to start receiving them.
              </>
            )}
          </div>
        )}

        {status === "ready" &&
          items.map((item) => (
            <article key={item._id} className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-3 sm:gap-4 sm:p-4">
              <ArticleImage src={item.imageUrl} category={item.category} className="h-18 w-24 rounded-[10px]" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-[13px] text-gray-600">
                  {item.category && (
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${categoryStyle(item.category)}`}>
                      {item.category}
                    </span>
                  )}
                  <span>
                    Sent <time dateTime={item.sentAt} className="font-medium text-slate-700">{formatDateTime(item.sentAt)}</time>
                  </span>
                  {item.channels?.length > 0 && (
                    <span className="text-xs text-gray-500">via {item.channels.map((c) => CHANNEL_LABEL[c] || c).join(" + ")}</span>
                  )}
                </div>
                <h3 className="font-serif text-[19px] font-semibold leading-tight tracking-tight text-slate-900">
                  {safeHref(item.url) ? (
                    <a href={safeHref(item.url)} target="_blank" rel="noreferrer" className="hover:text-brand hover:underline">
                      {item.title}
                    </a>
                  ) : (
                    item.title
                  )}
                </h3>
                {item.description && <p className="line-clamp-2 text-sm text-gray-700">{item.description}</p>}
              </div>
            </article>
          ))}
      </div>

      {status === "ready" && pagination.totalPages > 1 && (
        <nav aria-label="History pages" className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => updateParams({ page: page - 1 > 1 ? page - 1 : undefined })}
            disabled={page <= 1}
            className="min-h-11 rounded-[10px] border border-gray-300 bg-white px-4 text-sm font-semibold disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            onClick={() => updateParams({ page: page + 1 })}
            disabled={page >= pagination.totalPages}
            className="min-h-11 rounded-[10px] border border-gray-300 bg-white px-4 text-sm font-semibold disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      )}

      {summary?.total > 0 && (
        <div className="border-t border-gray-200 pt-4 text-right">
          {confirmClear ? (
            <span className="inline-flex flex-wrap items-center gap-3 text-sm">
              <span className="text-gray-700">Delete your whole alert history?</span>
              <button type="button" onClick={clearHistory} className="rounded-lg bg-red-700 px-3 py-2 font-semibold text-white hover:bg-red-800">
                Yes, delete
              </button>
              <button type="button" onClick={() => setConfirmClear(false)} className="font-semibold text-gray-700 underline">
                Cancel
              </button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirmClear(true)} className="text-sm font-semibold text-red-700 underline">
              Clear history
            </button>
          )}
        </div>
      )}
    </div>
  );
}
