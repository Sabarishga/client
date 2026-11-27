import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api";
import {
  buttonClass,
  checkPassword,
  Field,
  FormError,
  FormSuccess,
  linkButtonClass,
  PASSWORD_HINT,
} from "../components/AuthComponents";
import { useAuth } from "../context/AuthContext";

/** Logged-in users only: the API identifies them from their token. */
export default function ChangePasswordPage() {
  const { startSession } = useAuth();
  const [form, setForm] = useState({ currentPassword: "", password: "", confirmation: "" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (event) => setForm((f) => ({ ...f, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    const problems = {};
    if (!form.currentPassword) problems.currentPassword = "Enter your current password";
    const passwordProblem = checkPassword(form.password);
    if (passwordProblem) problems.password = passwordProblem;
    if (form.password !== form.confirmation) problems.confirmation = "Passwords do not match";
    setErrors(problems);
    if (Object.keys(problems).length) return;

    setLoading(true);
    try {
      // The server signs out other devices and returns a fresh token for this one.
      const session = await authApi.changePassword(form.currentPassword, form.password);
      startSession(session);
      setMessage("Password changed. Other devices have been logged out.");
      setForm({ currentPassword: "", password: "", confirmation: "" });
    } catch (err) {
      setError(err.message);
      setErrors(err.errors || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
      <h1 className="mb-5 font-serif text-2xl font-semibold tracking-tight">Change password</h1>
      <form onSubmit={handleSubmit} noValidate>
        <FormSuccess>{message}</FormSuccess>
        <FormError>{error}</FormError>
        <Field id="current-password" label="Current password" type="password" autoComplete="current-password" value={form.currentPassword} onChange={update("currentPassword")} error={errors.currentPassword} required />
        <Field id="password" label="New password" type="password" autoComplete="new-password" value={form.password} onChange={update("password")} error={errors.password} hint={PASSWORD_HINT} required />
        <Field id="confirmation" label="Confirm new password" type="password" autoComplete="new-password" value={form.confirmation} onChange={update("confirmation")} error={errors.confirmation} required />
        <div className="flex flex-wrap items-center gap-3">
          <button className={buttonClass} disabled={loading} type="submit">
            {loading ? "Saving..." : "Change password"}
          </button>
          <Link className={linkButtonClass} to="/feed">
            Back to feed
          </Link>
        </div>
      </form>
    </section>
  );
}
