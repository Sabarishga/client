import { resetPassword } from "../api";
import {
  AuthCard,
  AuthForm,
  buttonClass,
  ConfirmPasswordField,
  EmailField,
  PasswordField,
} from "./AuthComponents";

export default function ResetPasswordPage() {
  return (
    <AuthCard title="Reset Password">
      <AuthForm
        confirmPassword
        showSucceeded
        onSubmit={async ({ email, password, token }) => {
          const result = await resetPassword(email, token, password);
          return { message: result.message };
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
          succeeded,
        }) => (
          <>
            <EmailField email={email} setEmail={setEmail} />
            <PasswordField password={password} setPassword={setPassword} />
            <ConfirmPasswordField
              confirmation={confirmation}
              setConfirmation={setConfirmation}
            />
            <div className="flex items-center gap-3">
              <button className={buttonClass} disabled={loading} type="submit">
                {loading ? "Resetting..." : "Reset Password"}
              </button>
              {succeeded && (
                <a className={buttonClass} href="/login">
                  Back to Login
                </a>
              )}
            </div>
          </>
        )}
      </AuthForm>
    </AuthCard>
  );
}
