import { useContext, useState } from "react";
import {
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaLock,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { AuthContext } from "../context/AuthContext";
import { loginUser } from "../services/authService";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = await loginUser(formData);

      login(data);

      toast.success("Login Successful");

      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Invalid credentials"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href =
      "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <>
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] px-4 text-white">

        {/* Background Glow */}
        <div className="absolute -left-32 top-0 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[150px]" />

        <div className="absolute -right-32 bottom-0 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[150px]" />

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-blue-950/30 backdrop-blur-xl">

          {/* Logo */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold shadow-lg shadow-blue-900/50">
              IND
            </div>

            <h1 className="text-4xl font-bold text-white">
              Welcome Back
            </h1>

            <p className="mt-2 text-slate-400">
              Sign in to access your portfolio dashboard
            </p>
          </div>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email Address
              </label>

              <div className="relative">
                <FaEnvelope
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  size={16}
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  disabled={submitting}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-4 pl-12 pr-4 text-white placeholder-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Password
              </label>

              <div className="relative">
                <FaLock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  size={16}
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  disabled={submitting}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-4 pl-12 pr-12 text-white placeholder-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? (
                    <FaEyeSlash size={18} />
                  ) : (
                    <FaEye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center rounded-xl bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center">
            <div className="flex-grow border-t border-slate-800" />

            <span className="mx-4 text-xs uppercase tracking-wider text-slate-500">
              OR
            </span>

            <div className="flex-grow border-t border-slate-800" />
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-950 py-4 font-semibold transition hover:bg-slate-800"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
            >
              <path
                fill="#EA4335"
                d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.072 14.96 0 12 0 7.354 0 3.307 2.67 1.242 6.577l4.024 3.188z"
              />
              <path
                fill="#4285F4"
                d="M23.755 12.23c0-.828-.078-1.62-.217-2.38H12v4.51h6.605a5.647 5.647 0 01-2.45 3.707l3.882 3.01c2.27-2.09 3.718-5.175 3.718-8.847z"
              />
              <path
                fill="#FBBC05"
                d="M5.266 14.235A7.042 7.042 0 014.909 12c0-.79.13-1.554.357-2.265L1.242 6.577A11.934 11.934 0 000 12c0 2.01.493 3.912 1.364 5.582l3.902-3.347z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.957-1.077 7.943-2.913l-3.882-3.01c-1.077.72-2.454 1.15-4.061 1.15-3.13 0-5.782-2.118-6.734-4.97L1.364 17.582C3.424 21.393 7.41 24 12 24z"
              />
            </svg>

            Continue with Google
          </button>

          {/* Register */}
          <p className="mt-8 text-center text-sm text-slate-400">
            Don't have an account?

            <Link
              to="/register"
              className="ml-2 font-semibold text-blue-400 hover:text-blue-300"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;