import { useEffect, useState } from "react";

export const fieldClass =
  "mb-4 min-h-[44px] w-full rounded-[10px] border border-gray-300 bg-white px-3.5 text-[15px] text-slate-900 transition placeholder:text-gray-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40";
export const labelClass = "mb-1.5 block text-[13px] font-semibold text-gray-700";
export const buttonClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-[10px] bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
export const linkButtonClass =
  "text-sm font-medium text-brand transition hover:underline disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export function AuthCard({ title, children }) {
  return (
    <main className="min-h-screen bg-page px-4 py-10 font-sans text-slate-900 antialiased">
      <h1 className="mb-8 flex items-center justify-center font-serif text-3xl font-semibold tracking-tight text-slate-900">
        Real-Time News Alerts
      </h1>
      <section className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <h2 className="mb-5 font-serif text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
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
      {error && (
        <p role="alert" className="mb-4 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mb-4 text-sm font-medium text-brand-ink">
          {message}
        </p>
      )}
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
