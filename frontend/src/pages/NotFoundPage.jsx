import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-5xl font-bold text-slate-950">404</h1>
        <p className="mt-3 text-lg font-semibold text-slate-800">
          Page not found
        </p>
        <p className="mt-2 text-sm text-slate-500">
          The page you opened does not exist.
        </p>

        <Link to="/dashboard" className="mt-6 inline-block">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}