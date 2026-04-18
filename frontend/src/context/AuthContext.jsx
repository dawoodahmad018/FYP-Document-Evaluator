import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data.data.user);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    fetchProfile();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    localStorage.setItem("token", data.data.access_token);
    await fetchProfile();
    toast.success("Logged in successfully");
    return data;
  };

  const register = async (username, email, password) => {
    const { data } = await api.post("/api/auth/register", { username, email, password });
    toast.success("Registration successful. Please login.");
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.info("Logged out");
  };

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: !!user, login, register, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
