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
    <NewsFeed
      email={email}
      categories={categories}
      setCategories={setCategories}
      frequency={frequency}
      setFrequency={setFrequency}
      newsCategories={newsCategories}
      newsRefreshKey={newsRefreshKey}
      onRefresh={onRefresh}
      onSubscribe={onSubscribe}
      onUnsubscribe={onUnsubscribe}
      actionLoading={loading}
    />
  );
}
