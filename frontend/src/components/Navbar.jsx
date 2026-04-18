import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-black/20 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="font-display text-xl neon-title font-bold tracking-wide">
          FYP Document Evaluator
        </Link>
        <nav className="flex items-center gap-3">
          <span className="hidden md:block text-sm text-soft">{user?.username}</span>
          {user?.role === "admin" ? (
            <Link to="/admin" className="neon-btn px-3 py-2 rounded-lg text-white text-sm font-semibold">
              Admin Panel
            </Link>
          ) : null}
          <Link to="/upload" className="neon-btn alt px-3 py-2 rounded-lg text-white text-sm font-semibold">
            Upload
          </Link>
          <button onClick={onLogout} className="px-3 py-2 rounded-lg border border-white/20 text-white/90 text-sm hover:bg-white/10 transition">
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
