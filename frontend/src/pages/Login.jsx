import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await login(email, password);
      if (response.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="neon-page min-h-screen grid place-items-center px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-md p-8 stagger-in relative overflow-hidden">
        <div className="orbit absolute -top-10 -right-8 h-24 w-24 rounded-full bg-periwinkle/40 blur-2xl" />
        <h1 className="font-display text-3xl neon-title mb-2">Welcome Back</h1>
        <p className="text-sm text-soft mb-6">Continue to your FYP evaluation workspace.</p>
        <label className="block text-sm text-soft mb-1">Email</label>
        <input className="neon-input mb-4" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label className="block text-sm text-soft mb-1">Password</label>
        <input className="neon-input mb-6" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button disabled={submitting} className="neon-btn alt w-full py-3 rounded-lg text-white font-semibold">
          {submitting ? "Signing in..." : "Login"}
        </button>
        <p className="text-sm mt-4 text-center text-soft">
          No account? <Link className="text-sun font-semibold" to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
