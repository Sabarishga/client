import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  getDashboardNotifications,
  getDashboardSummary,
  getNotifications,
} from "../api";
import { NEWS_CATEGORIES, categoryStyle } from "../categories";

const PAGE_SIZE = 10;

const formatSentAt = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const safeHref = (url) => (/^https?:\/\//i.test(url || "") ? url : undefined);

export default function NotificationHistoryDrawer({ email, onClose }) {
  const closeButton = useRef(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [summary, setSummary] = useState(null);
  // When the dashboard endpoint can't be reached, the history is loaded from the
  // original /notifications/:email route instead and filtered in the browser.
  const [fallbackItems, setFallbackItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Close on Escape, lock background scrolling and focus the close button.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    closeButton.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Per-category counts for the filter chips.
  useEffect(() => {
    let active = true;
    getDashboardSummary(email)
      .then((data) => {
        if (active) setSummary(data);
      })
      .catch(() => {
        // Counts are optional; the list below reports real errors.
      });
    return () => {
      active = false;
    };
  }, [email]);

  // History list, re-fetched whenever a filter, the sort order or the page changes.
  useEffect(() => {
    if (fallbackItems) {
      setLoading(false);
      setError("");
      return undefined;
    }

    let active = true;
    setLoading(true);
    setError("");

    getDashboardNotifications(email, {
      categories: selectedCategories,
      sort,
      page,
      limit: PAGE_SIZE,
    })
      .then((data) => {
        if (!active) return;
        setNotifications(data.notifications);
        setPagination(data.pagination);
      })
      .catch((err) =>
        getNotifications(email)
          .then((items) => {
            if (active) setFallbackItems(Array.isArray(items) ? items : []);
          })
          .catch(() => {
            if (!active) return;
            setNotifications([]);
            setError(err.message);
          }),
      )
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [email, selectedCategories, sort, page, fallbackItems]);

  const toggleCategory = (category) => {
    setPage(1);
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  };

  const clearFilters = () => {
    setPage(1);
    setSelectedCategories([]);
  };

  const handleSortChange = (event) => {
    setPage(1);
    setSort(event.target.value);
  };

  const filtering = selectedCategories.length > 0;

  // What the panel displays: server results, or the browser-filtered fallback.
  let shownNotifications = notifications;
  let shownPagination = pagination;
  let chipTotal = summary?.total ?? 0;
  let chipCounts = Object.fromEntries(
    (summary?.categories || []).map((item) => [item.category, item.count]),
  );
  let countsReady = Boolean(summary);

  if (fallbackItems) {
    const filtered = fallbackItems.filter(
      (item) => !filtering || selectedCategories.includes(item.category),
    );
    const ordered = [...filtered].sort(
      (first, second) => new Date(second.sentAt) - new Date(first.sentAt),
    );
    if (sort === "oldest") ordered.reverse();

    const totalPages = Math.ceil(ordered.length / PAGE_SIZE);
    shownNotifications = ordered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    shownPagination = {
      page,
      limit: PAGE_SIZE,
      total: ordered.length,
      totalPages,
    };
    chipTotal = fallbackItems.length;
    chipCounts = {};
    fallbackItems.forEach((item) => {
      if (item.category) {
        chipCounts[item.category] = (chipCounts[item.category] || 0) + 1;
      }
    });
    countsReady = true;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-30 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-title"
    >
      <button
        type="button"
        aria-label="Close dashboard"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-slate-900/45"
      />

      <aside className="relative flex h-full w-full max-w-xl flex-col bg-page font-sans text-slate-900 shadow-[-12px_0_32px_rgba(15,23,42,0.18)]">
        <div className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-gray-200 bg-white px-5 py-5 sm:px-6">
          <div className="min-w-0 flex-1 basis-56">
            <h2
              id="history-title"
              className="font-serif text-2xl font-semibold tracking-tight text-slate-900 sm:text-[26px]"
            >
              Notification History
            </h2>
            <p className="mt-1 truncate text-sm text-gray-600">
              News alerts emailed to {email}
            </p>
          </div>
          <button
            ref={closeButton}
            type="button"
            onClick={onClose}
            className="min-h-11 shrink-0 whitespace-nowrap rounded-[10px] border border-gray-300 bg-white px-4 text-sm font-medium text-slate-800 transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Back to News Feed
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 px-5 pt-5 sm:px-6">
          {/* Filters stay in place; only the list below scrolls. */}
          <div className="shrink-0 space-y-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
            <div className="space-y-2">
              <span className="text-[13px] font-semibold text-gray-700">
                Filter by Category
              </span>
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Filter by category"
              >
                <button
                  type="button"
                  onClick={clearFilters}
                  aria-pressed={!filtering}
                  className={`min-h-11 rounded-full border px-3.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    !filtering
                      ? "border-brand bg-brand text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  General{countsReady ? ` (${chipTotal})` : ""}
                </button>
                {NEWS_CATEGORIES.filter((category) => category !== "general").map((category) => {
                  const selected = selectedCategories.includes(category);
                  return (
                    <button
                      type="button"
                      key={category}
                      onClick={() => toggleCategory(category)}
                      aria-pressed={selected}
                      className={`min-h-11 rounded-full border px-3.5 text-sm font-medium capitalize transition focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-brand ${
                        selected
                          ? "border-brand bg-brand text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {category}
                      {countsReady ? ` (${chipCounts[category] || 0})` : ""}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-gray-600" aria-live="polite">
                {loading
                  ? "Loading..."
                  : `${shownPagination.total} ${
                      shownPagination.total === 1 ? "article" : "articles"
                    } emailed${filtering ? " in selected categories" : ""}`}
              </p>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="history-sort"
                  className="text-[13px] font-semibold text-gray-700"
                >
                  Sort
                </label>
                <select
                  id="history-sort"
                  value={sort}
                  onChange={handleSortChange}
                  className="min-h-11 rounded-[10px] border border-gray-300 bg-white px-3 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
            </div>
            {fallbackItems && (
              <p className="text-xs text-gray-600">
                Showing your most recent {fallbackItems.length} emailed
                articles.
              </p>
            )}
          </div>

          {/* Only this list scrolls */}
          <div
            role="region"
            aria-label="Notification history"
            tabIndex={0}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pb-5 pr-1 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {loading && (
              <p className="text-sm text-gray-600">Loading history...</p>
            )}
            {!loading && error && (
              <p role="alert" className="text-sm font-medium text-red-700">
                {error}
              </p>
            )}
            {!loading && !error && shownNotifications.length === 0 && (
              <p className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-8 text-center text-[15px] text-gray-600">
                {filtering
                  ? "No emailed articles match the selected categories."
                  : "No email notifications have been recorded for this email address yet."}
              </p>
            )}
            {!loading &&
              !error &&
              shownNotifications.map((item) => (
                <article
                  key={item._id}
                  className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-3 sm:gap-4 sm:p-4"
                >
                  {/* Small thumbnail: the article image when the API provides one, otherwise a tinted placeholder */}
                  <div
                    className={`flex h-18 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[10px] ${categoryStyle(
                      item.category,
                    )}`}
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <svg
                        className="h-6.5 w-6.5"
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
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-[13px] text-gray-600">
                      {item.category && (
                        <>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${categoryStyle(
                              item.category,
                            )}`}
                          >
                            {item.category}
                          </span>
                          <span aria-hidden="true">·</span>
                        </>
                      )}
                      <span>Sent</span>
                      <time
                        className="font-medium text-slate-700"
                        dateTime={item.sentAt}
                      >
                        {formatSentAt(item.sentAt)}
                      </time>
                    </div>
                    <h3 className="font-serif text-[19px] font-semibold leading-tight tracking-tight text-slate-900">
                      {safeHref(item.url) ? (
                        <a
                          href={safeHref(item.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-brand hover:underline focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-brand"
                        >
                          {item.title}
                        </a>
                      ) : (
                        item.title
                      )}
                    </h3>
                    {item.description && (
                      <p className="line-clamp-2 text-sm leading-normal text-gray-700">
                        {item.description}
                      </p>
                    )}
                  </div>
                </article>
              ))}
          </div>
        </div>

        {!error && shownPagination.totalPages > 1 && (
          <nav
            aria-label="History pages"
            className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-200 bg-white px-5 py-4 sm:px-6"
          >
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={loading || page <= 1}
              className="min-h-11 rounded-[10px] border border-gray-300 bg-white px-4.5 text-sm font-semibold text-slate-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {shownPagination.page} of {shownPagination.totalPages}
            </span>
            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.min(shownPagination.totalPages, current + 1),
                )
              }
              disabled={loading || page >= shownPagination.totalPages}
              className="min-h-11 rounded-[10px] border border-gray-300 bg-white px-4.5 text-sm font-semibold text-slate-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Next
            </button>
          </nav>
        )}
      </aside>
    </div>,
    document.body,
  );
}
