import { useEffect, useState } from "react";
import SubscribeForm from "./components/SubscribeForm";
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

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <header className="max-w-xl mx-auto flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Real-Time News Alerts
        </h1>
        <button
          onClick={handleLogout}
          className="text-sm text-blue-600 hover:underline"
        >
          Log out
        </button>
      </header>

      {message && (
        <p className="max-w-xl mx-auto text-center text-sm text-blue-700 mb-4">
          {message}
        </p>
      )}

      <SubscribeForm
        email={email}
        setEmail={setEmail}
      />

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
    </div>
  );
}

export default App;
