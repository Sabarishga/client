import { Link } from "react-router-dom";

export const fieldClass =
  "min-h-[44px] w-full rounded-[10px] border bg-white px-3.5 text-[15px] text-slate-900 transition placeholder:text-gray-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40";
export const labelClass = "mb-1.5 block text-[13px] font-semibold text-gray-700";
export const buttonClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-[10px] bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
export const secondaryButtonClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-[10px] border border-gray-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
export const linkButtonClass =
  "text-sm font-medium text-brand transition hover:underline disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export function AuthCard({ title, subtitle, children }) {
  return (
    <main className="min-h-screen bg-page px-4 py-10 font-sans text-slate-900 antialiased">
      <Link
        to="/"
        className="mb-8 flex items-center justify-center font-serif text-3xl font-semibold tracking-tight text-slate-900"
      >
        Real-Time News Alerts
      </Link>
      <section className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
        <div className="mt-5">{children}</div>
      </section>
    </main>
  );
}

export function Field({ id, label, error, hint, ...inputProps }) {
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ");
  return (
    <div className="mb-4">
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`${fieldClass} ${error ? "border-red-500" : "border-gray-300"}`}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
        {...inputProps}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-gray-600">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormError({ children }) {
  if (!children) return null;
  return (
    <p role="alert" className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800">
      {children}
    </p>
  );
}

export function FormSuccess({ children }) {
  if (!children) return null;
  return (
    <p role="status" className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
      {children}
    </p>
  );
}

export const PASSWORD_HINT = "At least 8 characters, with a letter and a number.";

export const checkPassword = (password) => {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (new TextEncoder().encode(password).length > 72) return "Password must be at most 72 bytes long";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "Password must contain at least one letter and one number";
  }
  return "";
};
