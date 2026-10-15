import { useState } from "react";
import { changePassword } from "../api";
import {
  AuthCard,
  buttonClass,
  ConfirmPasswordField,
  EmailField,
  fieldClass,
  labelClass,
  PasswordField,
} from "./AuthComponents";

export default function ChangePasswordPage() {
  const query = new URLSearchParams(window.location.search);
  const [email, setEmail] = useState(
    query.get("email") || window.localStorage.getItem("newsAlertEmail") || "",
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword(email, currentPassword, password);
      setMessage(result.message);
      setCurrentPassword("");
      setPassword("");
      setConfirmation("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Change Password">
      <form onSubmit={handleSubmit}>
        <EmailField email={email} setEmail={setEmail} />
        <label className={labelClass} htmlFor="current-password">
          Current Password
        </label>
        <input
          id="current-password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          className={fieldClass}
          required
        />
        <PasswordField password={password} setPassword={setPassword} />
        <ConfirmPasswordField
          confirmation={confirmation}
          setConfirmation={setConfirmation}
        />
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        {message && <p className="text-sm text-blue-700 mb-4">{message}</p>}
        <div className="flex items-center gap-3">
          <button className={buttonClass} disabled={loading} type="submit">
            {loading ? "Changing..." : "Change password"}
          </button>
          <a className="text-sm text-blue-600 hover:underline" href="/login">
            Back to Login
          </a>
        </div>
      </form>
    </AuthCard>
  );
}
