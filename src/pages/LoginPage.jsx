import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AuthCard,
  buttonClass,
  Field,
  FormError,
  FormSuccess,
  linkButtonClass,
} from "../components/AuthComponents";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function LoginPage() {
  const { login, sessionMessage, clearSessionMessage } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const notice = location.state?.notice || sessionMessage;

  useEffect(() => () => clearSessionMessage(), [clearSessionMessage]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      const target = location.state?.from?.pathname || "/feed";
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.errors || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Log in" subtitle="Get back to your personalised news feed.">
      <form onSubmit={handleSubmit} noValidate>
        {notice && !error && <FormSuccess>{notice}</FormSuccess>}
        <FormError>{error}</FormError>
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          required
        />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          required
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button className={buttonClass} disabled={loading} type="submit">
            {loading ? "Logging in..." : "Log in"}
          </button>
          <Link className={linkButtonClass} to="/forgot-password">
            Forgot password?
          </Link>
        </div>
        <p className="mt-6 text-sm text-gray-600">
          New here?{" "}
          <Link className={linkButtonClass} to="/register">
            Create an account
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
