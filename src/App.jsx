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
  clearNotifications,
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

  const handleLogout = () => {
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
      await clearNotifications(targetEmail);
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
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Real-Time News Alerts
          </h1>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        {message && (
          <div
            role={isSuccessMessage ? "status" : "alert"}
            className={`flex items-start rounded-xl border p-4 shadow-sm ${
              isSuccessMessage
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        <Dashboard
          email={email}
          setEmail={setEmail}
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
