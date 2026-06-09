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
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="mt-1 text-sm text-slate-500">Start tracking your investments.</p>

        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <div className="mt-6 space-y-4">
          <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600" />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600" />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600" />
        </div>

        <button className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">
          Register
        </button>

        <p className="mt-4 text-center text-sm text-slate-600">
          Already registered? <Link to="/login" className="font-semibold text-blue-600">Login</Link>
        </p>
      </form>
    </div>
  );
}