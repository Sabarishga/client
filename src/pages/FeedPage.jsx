import AlertSettings from "../components/AlertSettings";
import NewsFeed from "../components/NewsFeed";
import { useAuth } from "../context/AuthContext";

export default function FeedPage() {
  const { user } = useAuth();
  // The feed always shows the topics that are saved on the server.
  const categories = user.preferences.categories;

  return (
    // On large screens the page fits the window (minus the 65px header and the
    // main padding) so only the story list scrolls, not the whole page.
    <div className="flex flex-col gap-8 lg:h-[calc(100dvh-8rem-1px)] lg:flex-row-reverse">
      <div className="lg:min-h-0 lg:w-85 lg:flex-none lg:overflow-y-auto">
        <AlertSettings />
      </div>
      <NewsFeed categories={categories} />
    </div>
  );
}
