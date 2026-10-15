import { useState } from "react";
import { login } from "../api";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);
      onLogin(result.email);
      window.location.assign("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
        Real-Time News Alerts
      </h1>
      <section className="bg-white shadow rounded-lg p-6 max-w-xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Login</h2>
        <form onSubmit={handleSubmit}>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
            required
          />

          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            minLength={8}
            maxLength={72}
            required
          />

          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          <div className="flex items-center gap-3">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
              type="submit"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            <a
              className="text-sm text-blue-600 hover:underline"
              href="/register"
            >
              Register
            </a>
          </div>
          <p className="mt-4">
            <a
              className="text-sm text-blue-600 hover:underline"
              href="/forgot-password"
            >
              Forgot password?
            </a>
          </p>
        </form>
      </section>
    </main>
  );
}
