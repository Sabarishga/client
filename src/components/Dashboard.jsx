import { useMemo, useState } from "react";
import { NEWS_CATEGORIES } from "../categories";

export default function Dashboard({
  email,
  categories,
  setCategories,
  frequency,
  setFrequency,
  notifications,
  subscribed,
  onRefresh,
  onSavePreferences,
  onUnsubscribe,
  loading,
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredNotifications = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    return notifications.filter((notification) => {
      const matchesCategory =
        categoryFilter === "all" ||
        notification.category?.toLowerCase() === categoryFilter;
      const searchableText =
        `${notification.title || ""} ${notification.description || ""}`.toLowerCase();
      return matchesCategory && searchableText.includes(searchTerm);
    });
  }, [categoryFilter, notifications, search]);

  const toggleCategory = (category) => {
    setCategories((selected) =>
      selected.includes(category)
        ? selected.filter((item) => item !== category)
        : [...selected, category],
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSavePreferences(email);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
      <aside className="flex max-h-[48vh] w-full flex-shrink-0 flex-col overflow-hidden border-b border-slate-200 bg-white md:h-full md:max-h-none md:w-96 md:border-b-0 md:border-r">
        <div className="flex-shrink-0 border-b border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900">
            Alert Preferences
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Customize your active profile delivery parameters.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-6 overflow-y-auto p-6"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="dashboard-email"
              className="text-xs font-semibold uppercase tracking-wide text-slate-700"
            >
              Target Email Address
            </label>
            <input
              type="email"
              id="dashboard-email"
              value={email}
              readOnly
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600"
            />
            <p className="text-xs text-slate-500">
              This is the email address for your account.
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="alert-frequency"
              className="text-xs font-semibold uppercase tracking-wide text-slate-700"
            >
              Frequency
            </label>
            <select
              id="alert-frequency"
              value={frequency}
              onChange={(event) => setFrequency(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="immediate">Real-Time Instant</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily Digest Summary</option>
            </select>
          </div>

          <fieldset className="space-y-2">
            <legend className="block text-xs font-semibold uppercase tracking-wide text-slate-700">
              Tracked Categories
            </legend>
            <div className="flex flex-wrap gap-2">
              {NEWS_CATEGORIES.map((category) => {
                const selected = categories.includes(category);
                return (
                  <button
                    type="button"
                    key={category}
                    onClick={() => toggleCategory(category)}
                    aria-pressed={selected}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
                      selected
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
            {categories.length === 0 && (
              <p className="text-xs text-rose-600">
                Select at least one category to save your configuration.
              </p>
            )}
          </fieldset>

          <div className="space-y-3 border-t border-slate-100 pt-4">
            <button
              type="submit"
              disabled={loading || categories.length === 0}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save Configuration
            </button>
            <button
              type="button"
              onClick={() => onUnsubscribe(email)}
              disabled={loading || !subscribed}
              className="w-full rounded-lg px-4 py-2 text-center text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Deactivate All Active Alerts
            </button>
            <p
              className={`text-xs font-medium ${
                subscribed ? "text-emerald-700" : "text-slate-500"
              }`}
            >
              {subscribed ? "Alerts are active" : "Alerts are deactivated"}
            </p>
          </div>
        </form>
      </aside>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex flex-shrink-0 flex-col justify-between gap-4 border-b border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
          <h2 className="text-lg font-bold text-slate-900">
            Received Alert Logs
          </h2>
          <div className="flex w-full max-w-xl flex-1 items-center gap-2 sm:justify-end">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search alert history"
              placeholder="Search logs by keyword..."
              className="w-full max-w-xs rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              aria-label="Filter alerts by category"
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              {NEWS_CATEGORIES.map((category) => (
                <option value={category} key={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-800 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
          {loading && notifications.length === 0 && (
            <p className="text-sm text-slate-500">Loading alert history...</p>
          )}
          {!loading && notifications.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <h3 className="text-sm font-semibold text-slate-800">
                No alerts received yet
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Received alerts will appear here.
              </p>
            </div>
          )}
          {notifications.length > 0 && filteredNotifications.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              No alerts match your search and category filter.
            </p>
          )}
          {filteredNotifications.map((notification) => (
            <article
              key={notification._id}
              className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {notification.category && (
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700">
                    {notification.category}
                  </span>
                )}
                {notification.sentAt && (
                  <time
                    dateTime={notification.sentAt}
                    className="font-medium text-slate-500"
                  >
                    {new Date(notification.sentAt).toLocaleString()}
                  </time>
                )}
              </div>
              <h3 className="text-base font-bold leading-snug text-slate-900">
                {notification.url ? (
                  <a
                    href={notification.url}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-indigo-600 hover:underline"
                  >
                    {notification.title}
                  </a>
                ) : (
                  notification.title
                )}
              </h3>
              {notification.description && (
                <p className="text-sm leading-relaxed text-slate-600">
                  {notification.description}
                </p>
              )}
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
