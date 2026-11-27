import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api";
import {
  AuthCard,
  buttonClass,
  Field,
  FormError,
  FormSuccess,
  linkButtonClass,
} from "../components/AuthComponents";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setFieldError("");
    setLoading(true);
    try {
      const result = await authApi.forgotPassword(email);
      setMessage(result.message);
    } catch (err) {
      setError(err.message);
      setFieldError(err.errors?.email || "");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we will send you a link to choose a new one. The link works for 1 hour."
    >
      <form onSubmit={handleSubmit} noValidate>
        <FormSuccess>{message}</FormSuccess>
        <FormError>{error}</FormError>
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldError}
          required
        />
        <div className="flex flex-wrap items-center gap-3">
          <button className={buttonClass} disabled={loading} type="submit">
            {loading ? "Sending..." : "Send reset link"}
          </button>
          <Link className={linkButtonClass} to="/login">
            Back to login
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
