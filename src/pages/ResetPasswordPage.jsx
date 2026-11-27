import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../api";
import {
  AuthCard,
  buttonClass,
  checkPassword,
  Field,
  FormError,
  linkButtonClass,
  PASSWORD_HINT,
} from "../components/AuthComponents";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function ResetPasswordPage() {
  const [params, setParams] = useSearchParams();
  const { startSession } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  // Read the token once, then remove it from the address bar and history.
  const [token] = useState(() => params.get("token") || "");
  const [email, setEmail] = useState(() => params.get("email") || "");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.has("token")) {
      const next = new URLSearchParams(params);
      next.delete("token");
      setParams(next, { replace: true });
    }
  }, [params, setParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const problems = {};
    const passwordProblem = checkPassword(password);
    if (passwordProblem) problems.password = passwordProblem;
    if (password !== confirmation) problems.confirmation = "Passwords do not match";
    setErrors(problems);
    if (Object.keys(problems).length) return;

    setLoading(true);
    try {
      const session = await authApi.resetPassword(email, token, password);
      startSession(session);
      toast.success("Your password has been reset. You are now logged in.");
      navigate("/feed", { replace: true });
    } catch (err) {
      setError(err.message);
      setErrors(err.errors || {});
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthCard title="Reset link missing">
        <p className="text-sm text-gray-700">
          This page needs the link from your password reset email. If it has expired, request a new one.
        </p>
        <Link to="/forgot-password" className={`${buttonClass} mt-5`}>
          Request a new link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password">
      <form onSubmit={handleSubmit} noValidate>
        <FormError>{error}</FormError>
        <Field id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required />
        <Field
          id="password"
          label="New password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          hint={PASSWORD_HINT}
          required
        />
        <Field
          id="confirmation"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          error={errors.confirmation}
          required
        />
        <div className="flex flex-wrap items-center gap-3">
          <button className={buttonClass} disabled={loading} type="submit">
            {loading ? "Saving..." : "Reset password"}
          </button>
          <Link className={linkButtonClass} to="/forgot-password">
            Request a new link
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
