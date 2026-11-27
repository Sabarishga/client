import { Link } from "react-router-dom";
import { AuthCard, buttonClass } from "../components/AuthComponents";

export default function NotFoundPage() {
  return (
    <AuthCard title="Page not found">
      <p className="text-sm text-gray-700">The page you were looking for does not exist.</p>
      <Link to="/" className={`${buttonClass} mt-5`}>
        Go to the home page
      </Link>
    </AuthCard>
  );
}
