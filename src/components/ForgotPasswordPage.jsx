import { useRef, useState } from "react";
import { requestPasswordReset } from "../api";
import {
  AuthCard,
  buttonClass,
  EmailField,
  linkButtonClass,
} from "./AuthComponents";

export default function ForgotPasswordPage() {
  const emailInput = useRef(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const sendResetLink = async () => {
    if (!emailInput.current.reportValidity()) return;

    setLoading(true);
    setMessage("");
    setError("");
    try {
      const result = await requestPasswordReset(email);
      setMessage(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Forgot Password">
      <p className="mb-5 text-sm leading-normal text-gray-600">
        To change your password, continue to the change password page. You can
        also request a reset link if you don’t remember your current password.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const query = new URLSearchParams({ email });
          window.location.assign(`/change-password?${query.toString()}`);
        }}
      >
        <EmailField email={email} setEmail={setEmail} inputRef={emailInput} />
        <div className="flex items-center gap-3">
          <button className={buttonClass} type="submit">
            Change password
          </button>
          <a className={linkButtonClass} href="/login">
            Back to Login
          </a>
        </div>
      </form>
      <button
        className={`${linkButtonClass} mt-4`}
        disabled={loading}
        onClick={sendResetLink}
        type="button"
      >
        {loading ? "Sending..." : "Send a reset link instead"}
      </button>
      {message && (
        <p role="status" className="mt-4 text-sm font-medium text-brand-ink">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </AuthCard>
  );
}
