import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmation: "" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (event) => setForm((f) => ({ ...f, [field]: event.target.value }));

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 3) next.name = "Name must be at least 3 characters";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email address";
    const passwordProblem = checkPassword(form.password);
    if (passwordProblem) next.password = passwordProblem;
    if (form.password !== form.confirmation) next.confirmation = "Passwords do not match";
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const problems = validate();
    setErrors(problems);
    if (Object.keys(problems).length) return;

    setLoading(true);
    try {
      const user = await register(form.name.trim(), form.email.trim(), form.password);
      toast.success(`Account created. Welcome, ${user.name}! Choose your topics to start getting alerts.`);
      navigate("/feed", { replace: true });
    } catch (err) {
      setError(err.message);
      setErrors(err.errors || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Create your account" subtitle="Free, and takes less than a minute.">
      <form onSubmit={handleSubmit} noValidate>
        <FormError>{error}</FormError>
        <Field id="name" label="Name" autoComplete="name" value={form.name} onChange={update("name")} error={errors.name} maxLength={50} required />
        <Field id="email" label="Email" type="email" autoComplete="email" value={form.email} onChange={update("email")} error={errors.email} required />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={update("password")}
          error={errors.password}
          hint={PASSWORD_HINT}
          required
        />
        <Field
          id="confirmation"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={form.confirmation}
          onChange={update("confirmation")}
          error={errors.confirmation}
          required
        />
        <button className={`${buttonClass} w-full`} disabled={loading} type="submit">
          {loading ? "Creating account..." : "Create account"}
        </button>
        <p className="mt-6 text-sm text-gray-600">
          Already registered?{" "}
          <Link className={linkButtonClass} to="/login">
            Log in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
