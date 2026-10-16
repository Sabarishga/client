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
  getPreferences,
  getNotifications,
} from "./api";

function App() {
  const pathname = window.location.pathname;
  const [email, setEmail] = useState(
    () => window.localStorage.getItem("newsAlertEmail") || "",
  );
  const [categories, setCategories] = useState([]);
  const [frequency, setFrequency] = useState("daily");
  const [notifications, setNotifications] = useState([]);
  const [subscribed, setSubscribed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!email || pathname !== "/") return undefined;

    let active = true;
    setLoading(true);
    Promise.allSettled([getPreferences(email), getNotifications(email)])
      .then(([preferencesResult, notificationsResult]) => {
        if (!active) return;

        const errors = [];
        if (preferencesResult.status === "fulfilled") {
          const preferences = preferencesResult.value;
          setCategories(preferences.categories || []);
          setFrequency(preferences.frequency || "daily");
          setSubscribed(Boolean(preferences.subscribed));
        } else {
          errors.push(
            preferencesResult.reason instanceof Error
              ? preferencesResult.reason.message
              : "Unable to load alert preferences.",
          );
        }

        if (notificationsResult.status === "fulfilled") {
          setNotifications(notificationsResult.value);
        } else {
          errors.push(
            notificationsResult.reason instanceof Error
              ? notificationsResult.reason.message
              : "Unable to load alert history.",
          );
        }

        if (errors.length) setMessage(errors.join(" "));
      })
      .finally(() => {
        if (active) setLoading(false);
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
    setCategories([]);
    setFrequency("daily");
    setSubscribed(false);
    window.location.assign("/login");
  };

  const handleSavePreferences = async (targetEmail) => {
    if (categories.length === 0) {
      setMessage("Select at least one category before subscribing.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      await subscribe(targetEmail, categories, frequency);
      setSubscribed(true);
      setMessage("Settings saved. Your news alerts are active.");
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
      setSubscribed(false);
      setMessage("Alerts have been deactivated.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!email) return;
    setLoading(true);
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
    message.startsWith("Settings saved.") ||
    message.startsWith("Alerts have been deactivated.");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 text-slate-800 antialiased">
      <header className="z-10 flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          AlertPulse Dashboard
        </h1>
        <div className="flex items-center gap-4">
          {message && (
            <p
              role={isSuccessMessage ? "status" : "alert"}
              className={`rounded-lg border px-4 py-2 text-sm shadow-sm ${
                isSuccessMessage
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              {message}
            </p>
          )}
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <Dashboard
          email={email}
          categories={categories}
          setCategories={setCategories}
          frequency={frequency}
          setFrequency={setFrequency}
          notifications={notifications}
          subscribed={subscribed}
          onRefresh={handleRefresh}
          onSavePreferences={handleSavePreferences}
          onUnsubscribe={handleUnsubscribe}
          loading={loading}
        />
      </main>
    </div>
  );
}

export default App;
