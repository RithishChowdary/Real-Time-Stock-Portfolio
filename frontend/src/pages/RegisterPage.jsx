import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { useAuth } from "../hooks/useAuth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const data = await registerUser(form);
      login(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] px-4 text-white">
          <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#0f172a] p-8 shadow-2xl"
    >
       <h1 className="text-4xl font-bold text-white">Create account</h1>
        <p className="mt-2 text-slate-400">Start tracking your investments.</p>

        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <div className="mt-6 space-y-4">
          <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500" />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500" />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500" />
        </div>

        <button className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">
          Register
        </button>

        <p className="mt-4 text-center text-sm text-slate-400">
          Already registered? <Link to="/login" className="font-semibold text-blue-600">Login</Link>
        </p>
      </form>
    </div>
  );
}