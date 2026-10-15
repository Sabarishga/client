import NewsFeed from "./NewsFeed";

export default function Dashboard({
  email,
  categories,
  setCategories,
  frequency,
  setFrequency,
  newsCategories,
  newsRefreshKey,
  onRefresh,
  onSubscribe,
  onUnsubscribe,
  loading,
}) {
  return (
    <div className="max-w-xl mx-auto mt-6 space-y-6">
      <section className="bg-white shadow rounded-lg p-6">
        <NewsFeed
          categories={categories}
          setCategories={setCategories}
          frequency={frequency}
          setFrequency={setFrequency}
          newsCategories={newsCategories}
          newsRefreshKey={newsRefreshKey}
          onRefresh={onRefresh}
          email={email}
          onSubscribe={onSubscribe}
          onUnsubscribe={onUnsubscribe}
          actionLoading={loading}
        />
      </section>
    </div>
  );
}
