import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../services/authService";
import logo from "../assets/logo.png";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setSubmitting(true);

    try {
      await registerUser(form);
      setSuccessMessage("Registration successful! Please login.");
      setForm({
        name: "",
        email: "",
        password: "",
      });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0F1112] px-4 py-12 text-[#F1F3F5]">
      <div className="w-full max-w-md rounded-2xl border border-[#2A2E32] bg-[#181B1D] p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <img
            src={logo}
            alt="InvestIND"
            className="mx-auto mb-4 h-16 w-auto object-contain"
          />

          <h1 className="text-2xl font-bold tracking-tight text-[#F1F3F5]">
            Create Account
          </h1>

          <p className="mt-1.5 text-sm text-[#9AA1A9]">
            Start tracking and analyzing your portfolio
          </p>
        </div>

        {successMessage && (
          <div className="mb-4 rounded-xl border border-[#00C896]/30 bg-[#00C896]/10 p-3 text-center text-sm font-semibold text-[#00C896]">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-center text-sm font-medium text-red-300">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#9AA1A9]">
              Full Name
            </label>
            <input
              name="name"
              placeholder="e.g. Rahul Sharma"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-[#2A2E32] bg-[#141719] px-4 py-3 text-sm text-[#F1F3F5] placeholder-[#6F7780] outline-none transition focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#9AA1A9]">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              placeholder="e.g. rahul@example.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-[#2A2E32] bg-[#141719] px-4 py-3 text-sm text-[#F1F3F5] placeholder-[#6F7780] outline-none transition focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#9AA1A9]">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-[#2A2E32] bg-[#141719] px-4 py-3 text-sm text-[#F1F3F5] placeholder-[#6F7780] outline-none transition focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex w-full items-center justify-center rounded-xl bg-[#3B82F6] py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60 cursor-pointer shadow-sm"
          >
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#9AA1A9]">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#3B82F6] hover:text-blue-400"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}