import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await register(username, email, password);
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="neon-page min-h-screen grid place-items-center px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-lg p-8 stagger-in relative overflow-hidden">
        <div className="orbit absolute -bottom-10 -left-8 h-24 w-24 rounded-full bg-sun/30 blur-2xl" />
        <h1 className="font-display text-3xl neon-title mb-2">Create Account</h1>
        <p className="text-sm text-soft mb-6">Set up your student profile to start evaluations.</p>
        <label className="block text-sm text-soft mb-1">Name</label>
        <input className="neon-input mb-4" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <label className="block text-sm text-soft mb-1">Email</label>
        <input className="neon-input mb-4" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label className="block text-sm text-soft mb-1">Password</label>
        <input className="neon-input mb-4" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <label className="block text-sm text-soft mb-1">Confirm Password</label>
        <input className="neon-input mb-6" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        <button disabled={submitting} className="neon-btn w-full py-3 rounded-lg text-white font-semibold">
          {submitting ? "Creating account..." : "Register"}
        </button>
        <p className="text-sm mt-4 text-center text-soft">
          Already have an account? <Link className="text-sun font-semibold" to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
