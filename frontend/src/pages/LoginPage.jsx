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
import logo from "../assets/logo.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setErrorMessage("");
    setFormData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    try {
      const data = await loginUser(formData);
      login(data);
      toast.success("Login Successful");
      navigate("/dashboard");
    } catch (error) {
      const status = error.response?.status;
      let msg = "Invalid email or password. Please check your credentials and try again.";

      if (status && status !== 401 && status !== 403 && error.response?.data?.message) {
        msg = error.response.data.message;
      }

      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href =
      "https://real-time-stock-portfolio.onrender.com/oauth2/authorization/google";
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0F1112] px-4 py-12 text-[#F1F3F5]">
      {/* Clean Graphite Login Card */}
      <div className="w-full max-w-md rounded-2xl border border-[#2A2E32] bg-[#181B1D] p-8 shadow-2xl">
        {/* Header & Logo */}
        <div className="mb-6 text-center">
          <img
            src={logo}
            alt="InvestIND"
            className="mx-auto mb-4 h-16 w-auto object-contain"
          />

          <h1 className="text-2xl font-bold tracking-tight text-[#F1F3F5]">
            Welcome Back
          </h1>

          <p className="mt-1.5 text-sm text-[#9AA1A9]">
            Sign in to access your portfolio dashboard
          </p>
        </div>

        {/* Error Message Banner */}
        {errorMessage && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-center text-sm font-medium text-red-300">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#9AA1A9]">
              Email Address
            </label>

            <div className="relative">
              <FaEnvelope
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6F7780]"
                size={14}
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
                className="w-full rounded-xl border border-[#2A2E32] bg-[#141719] py-3 pl-11 pr-4 text-sm text-[#F1F3F5] placeholder-[#6F7780] outline-none transition focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#9AA1A9]">
              Password
            </label>

            <div className="relative">
              <FaLock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6F7780]"
                size={14}
              />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                autoComplete="current-password"
                disabled={submitting}
                required
                className="w-full rounded-xl border border-[#2A2E32] bg-[#141719] py-3 pl-11 pr-11 text-sm text-[#F1F3F5] placeholder-[#6F7780] outline-none transition focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6F7780] hover:text-[#F1F3F5]"
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center rounded-xl bg-[#3B82F6] py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60 cursor-pointer shadow-sm"
          >
            {submitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5 flex items-center">
          <div className="flex-grow border-t border-[#2A2E32]" />
          <span className="mx-4 text-xs font-medium uppercase tracking-wider text-[#6F7780]">
            OR
          </span>
          <div className="flex-grow border-t border-[#2A2E32]" />
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#2A2E32] bg-[#141719] py-3 text-sm font-semibold text-[#F1F3F5] transition hover:bg-[#1D2023] cursor-pointer"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
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

        {/* Register link */}
        <p className="mt-6 text-center text-xs text-[#9AA1A9]">
          Don't have an account?
          <Link
            to="/register"
            className="ml-1.5 font-semibold text-[#3B82F6] hover:text-blue-400"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;