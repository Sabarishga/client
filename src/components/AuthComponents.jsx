import { useEffect, useState } from "react";

export const fieldClass =
  "w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500";
export const labelClass = "block text-sm font-medium text-gray-700 mb-1";
export const buttonClass =
  "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50";
export const linkButtonClass =
  "text-sm text-blue-600 hover:underline disabled:opacity-50";

export function AuthCard({ title, children }) {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
        Real-Time News Alerts
      </h1>
      <section className="bg-white shadow rounded-lg p-6 max-w-xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
        {children}
      </section>
    </main>
  );
}

export function AuthForm({
  children,
  onSubmit,
  confirmPassword = false,
  showSucceeded = false,
}) {
  const queryParams = new URLSearchParams(window.location.search);
  const [email, setEmail] = useState(queryParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [token] = useState(queryParams.get("token") || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("token")) return;

    url.searchParams.delete("token");
    const nextUrl = url.search
      ? `${url.pathname}?${url.searchParams.toString()}`
      : url.pathname;
    window.history.replaceState({}, "", nextUrl);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSucceeded(false);

    if (confirmPassword && password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const result = await onSubmit({ email, password, token });
      setMessage(result.message);
      if (showSucceeded) setSucceeded(true);
      if (result.redirect) window.location.assign(result.redirect);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {children({
        email,
        setEmail,
        password,
        setPassword,
        confirmation,
        setConfirmation,
        loading,
        succeeded,
      })}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {message && <p className="text-sm text-blue-700 mb-4">{message}</p>}
    </form>
  );
}

export function EmailField({ email, setEmail, inputRef }) {
  return (
    <>
      <label className={labelClass} htmlFor="email">
        Email
      </label>
      <input
        id="email"
        ref={inputRef}
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className={fieldClass}
        placeholder="you@example.com"
        required
      />
    </>
  );
}

export function NameField({ name, setName }) {
  return (
    <>
      <label className={labelClass} htmlFor="name">
        Name
      </label>
      <input
        id="name"
        type="text"
        autoComplete="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className={fieldClass}
        minLength={3}
        maxLength={50}
        required
      />
    </>
  );
}

export function PasswordField({
  password,
  setPassword,
  autocomplete = "new-password",
}) {
  return (
    <>
      <label className={labelClass} htmlFor="password">
        Password
      </label>
      <input
        id="password"
        type="password"
        autoComplete={autocomplete}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className={fieldClass}
        minLength={8}
        maxLength={72}
        required
      />
    </>
  );
}

export function ConfirmPasswordField({ confirmation, setConfirmation }) {
  return (
    <>
      <label className={labelClass} htmlFor="confirm-password">
        Confirm Password
      </label>
      <input
        id="confirm-password"
        type="password"
        autoComplete="new-password"
        value={confirmation}
        onChange={(event) => setConfirmation(event.target.value)}
        className={fieldClass}
        required
      />
    </>
  );
}
