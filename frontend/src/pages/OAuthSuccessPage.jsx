import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getCurrentUser } from "../services/authService";

export default function OAuthSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    async function completeLogin() {
      const token = searchParams.get("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        localStorage.setItem("token", token);

        const user = await getCurrentUser();

        login({
          token,
          refreshToken: "",
          userId: user.id,
          portfolioId: "",
          name: user.name,
          email: user.email,
          role: user.role,
        });

        navigate("/dashboard", {
          replace: true,
        });
      } catch (error) {
        console.error(
          "OAuth login failed",
          error
        );

        navigate("/login", {
          replace: true,
        });
      }
    }

    completeLogin();
  }, []);

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-950">
          Signing you in...
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Please wait while we complete Google login.
        </p>
      </div>
    </div>
  );
}