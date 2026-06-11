import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../services/authService";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

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
        error.response?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] px-4 text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#0f172a] p-8 shadow-2xl"
      >
        <h1 className="text-4xl font-bold text-white">
          Create account
        </h1>

        <p className="mt-2 text-slate-400">
          Start tracking your investments.
        </p>

        {successMessage && (
          <div className="mt-4 rounded-lg bg-green-100 p-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <input
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Register
        </button>

        <p className="mt-4 text-center text-sm text-slate-400">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-500 hover:text-blue-400"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}