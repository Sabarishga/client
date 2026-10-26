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
    <main className="min-h-screen bg-page px-4 py-10 font-sans text-slate-900 antialiased">
      <h1 className="mb-8 flex items-center justify-center font-serif text-3xl font-semibold tracking-tight text-slate-900">
        Real-Time News Alerts
      </h1>
      <section className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <h2 className="mb-5 font-serif text-2xl font-semibold tracking-tight text-slate-900">
          Login
        </h2>
        <form onSubmit={handleSubmit}>
          <label
            className="mb-1.5 block text-[13px] font-semibold text-gray-700"
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
            className="mb-4 min-h-[44px] w-full rounded-[10px] border border-gray-300 bg-white px-3.5 text-[15px] text-slate-900 transition placeholder:text-gray-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
            placeholder="you@example.com"
            required
          />

          <label
            className="mb-1.5 block text-[13px] font-semibold text-gray-700"
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
            className="mb-4 min-h-[44px] w-full rounded-[10px] border border-gray-300 bg-white px-3.5 text-[15px] text-slate-900 transition placeholder:text-gray-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
            minLength={8}
            maxLength={72}
            required
          />

          {error && (
            <p role="alert" className="mb-4 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
          <div className="flex items-center gap-3">
            <button
              className="inline-flex min-h-[44px] items-center justify-center rounded-[10px] bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              disabled={loading}
              type="submit"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            <a
              className="text-sm font-medium text-brand transition hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              href="/register"
            >
              Register
            </a>
          </div>
          <p className="mt-4">
            <a
              className="text-sm font-medium text-brand transition hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
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
