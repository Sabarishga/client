import { useState } from "react";
import { register } from "../api";
import {
  AuthCard,
  AuthForm,
  buttonClass,
  ConfirmPasswordField,
  EmailField,
  linkButtonClass,
  NameField,
  PasswordField,
} from "./AuthComponents";

export default function RegisterPage() {
  const [name, setName] = useState("");

  return (
    <AuthCard title="Register">
      <AuthForm
        confirmPassword
        onSubmit={async ({ email, password }) => {
          await register(name, email, password);
          return {
            message: "Registration successful. You can now log in.",
            redirect: "/login",
          };
        }}
      >
        {({
          email,
          setEmail,
          password,
          setPassword,
          confirmation,
          setConfirmation,
          loading,
        }) => (
          <>
            <NameField name={name} setName={setName} />
            <EmailField email={email} setEmail={setEmail} />
            <PasswordField password={password} setPassword={setPassword} />
            <ConfirmPasswordField
              confirmation={confirmation}
              setConfirmation={setConfirmation}
            />
            <div className="flex items-center gap-3">
              <button className={buttonClass} disabled={loading} type="submit">
                {loading ? "Registering..." : "Register"}
              </button>
              <a className={linkButtonClass} href="/login">
                Login
              </a>
            </div>
          </>
        )}
      </AuthForm>
    </AuthCard>
  );
}
