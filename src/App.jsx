import { useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";
import ChangePasswordPage from "./components/ChangePasswordPage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import {
  subscribe,
  unsubscribe,
  getNotifications,
  logout,
} from "./api";

function App() {
  const pathname = window.location.pathname;
  const [email, setEmail] = useState(
    () => window.localStorage.getItem("newsAlertEmail") || "",
  );
  const [categories, setCategories] = useState([]);
  const [frequency, setFrequency] = useState("daily");
  const [notifications, setNotifications] = useState([]);
  const [newsCategories, setNewsCategories] = useState([]);
  const [newsRefreshKey, setNewsRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!email || pathname !== "/") return undefined;

    let active = true;
    getNotifications(email)
      .then((data) => {
        if (active) setNotifications(data);
      })
      .catch((err) => {
        if (active) {
          setMessage(err.message);
        }
      });

    return () => {
      active = false;
    };
  }, [email, pathname]);

  const handleLogin = (userEmail) => {
    window.localStorage.setItem("newsAlertEmail", userEmail);
    setEmail(userEmail);
  };

  const handleLogout = async () => {
    try {
      await logout(email);
    } catch (err) {
      setMessage("Could not log out. Check your connection and try again.");
      return;
    }

    window.localStorage.removeItem("newsAlertEmail");
    setEmail("");
    setNotifications([]);
    window.location.assign("/login");
  };

  const handleSubscribe = async (targetEmail) => {
    if (categories.length === 0) {
      setMessage("Select at least one category before subscribing.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      await subscribe(targetEmail, categories, frequency);
      setEmail(targetEmail);
      setNewsCategories([...categories]);
      setMessage(
        "Subscribed! You will receive alerts based on your preferences.",
      );
      const data = await getNotifications(targetEmail);
      setNotifications(data);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (targetEmail) => {
    setLoading(true);
    setMessage("");
    try {
      await unsubscribe(targetEmail);
      setNewsCategories([]);
      setNotifications([]);
      setMessage("You have been unsubscribed.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!email) return;
    setLoading(true);
    setNewsRefreshKey((current) => current + 1);
    try {
      const data = await getNotifications(email);
      setNotifications(data);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (pathname === "/login") {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (pathname === "/register") return <RegisterPage />;
  if (pathname === "/change-password") return <ChangePasswordPage />;
  if (pathname === "/forgot-password") return <ForgotPasswordPage />;
  if (pathname === "/reset-password") return <ResetPasswordPage />;

  if (!email) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const isSuccessMessage =
    message.startsWith("Subscribed!") ||
    message.startsWith("You have been unsubscribed.");

  return (
    <div className="flex min-h-screen flex-col bg-page font-sans text-slate-900 antialiased lg:h-screen lg:overflow-hidden">
      <header className="shrink-0 border-b border-gray-200 bg-white">
        <div className="mx-auto flex min-h-16 w-full max-w-280 flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <div className="flex items-center">
            <h1 className="font-serif text-[22px] font-semibold tracking-tight text-slate-900">
              Real-Time News Alerts
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-60 truncate text-sm text-gray-600 sm:inline">
              {email}
            </span>
            <button
              onClick={handleLogout}
              className="min-h-11 rounded-[10px] border border-gray-300 bg-white px-4 text-sm font-medium text-slate-800 transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-280 flex-1 flex-col gap-6 px-4 py-8 sm:px-8 lg:min-h-0">
        {message && (
          <div
            role={isSuccessMessage ? "status" : "alert"}
            className={`flex shrink-0 items-start rounded-xl border p-4 ${
              isSuccessMessage
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-rose-200 bg-rose-50 text-rose-900"
            }`}
          >
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        <Dashboard
          email={email}
          categories={categories}
          setCategories={setCategories}
          frequency={frequency}
          setFrequency={setFrequency}
          newsCategories={newsCategories}
          newsRefreshKey={newsRefreshKey}
          onRefresh={handleRefresh}
          onSubscribe={handleSubscribe}
          onUnsubscribe={handleUnsubscribe}
          loading={loading}
        />
      </main>
    </div>
  );
}

export default App;
