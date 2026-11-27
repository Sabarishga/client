import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { newsApi } from "../api";
import { isAbort } from "../api/client";
import ArticleCard from "../components/ArticleCard";
import { buttonClass, secondaryButtonClass } from "../components/AuthComponents";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  {
    title: "Pick your topics",
    text: "Business, sports, technology and more: choose only what you care about.",
  },
  {
    title: "Choose your pace",
    text: "Real-time, hourly or a daily round-up. Never the same story twice.",
  },
  {
    title: "Email or browser alerts",
    text: "Get headlines in your inbox, as desktop notifications, or both.",
  },
];

/** Public home page: explains the app and shows live headlines to visitors. */
export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [headlines, setHeadlines] = useState([]);
  const [state, setState] = useState("loading");

  useEffect(() => {
    const controller = new AbortController();
    newsApi
      .headlines(controller.signal)
      .then((data) => {
        setHeadlines(data.articles);
        setState("ready");
      })
      .catch((err) => !isAbort(err) && setState("error"));
    return () => controller.abort();
  }, []);

  return (
    <div className="min-h-screen bg-page font-sans text-slate-900 antialiased">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-280 flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-8">
          <span className="font-serif text-[22px] font-semibold tracking-tight">Real-Time News Alerts</span>
          {isAuthenticated && (
            <nav className="flex items-center gap-2">
              <Link to="/feed" className={buttonClass}>
                Go to my feed
              </Link>
            </nav>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-280 px-4 py-12 sm:px-8">
        <section className="max-w-2xl">
          <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            The news you care about, delivered the moment it breaks.
          </h1>
          <p className="mt-4 text-lg text-gray-700">
            Choose your topics once. We watch the headlines around the clock and send you
            alerts by email or browser notification, on your schedule.
          </p>
          {!isAuthenticated && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/register" className={buttonClass}>
                Create your free account
              </Link>
              <Link to="/login" className={secondaryButtonClass}>
                I already have an account
              </Link>
            </div>
          )}
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-3" aria-label="Features">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="font-semibold text-slate-900">{feature.title}</h2>
              <p className="mt-1 text-sm text-gray-600">{feature.text}</p>
            </div>
          ))}
        </section>

        <section className="mt-12" aria-labelledby="headlines-title">
          <h2 id="headlines-title" className="font-serif text-[28px] font-semibold tracking-tight">
            Top headlines right now
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {state === "loading" &&
              [0, 1, 2].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl border border-gray-200 bg-white" />
              ))}
            {state === "error" && (
              <p className="text-sm text-gray-600 sm:col-span-3">
                Headlines are unavailable at the moment. Sign in to see your personal feed.
              </p>
            )}
            {state === "ready" &&
              headlines.map((article) => (
                <ArticleCard key={article.url} article={article} compact />
              ))}
          </div>
        </section>
      </main>
    </div>
  );
}
