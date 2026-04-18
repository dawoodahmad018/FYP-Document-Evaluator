import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../api/axios";
import Navbar from "../components/Navbar";

const tabs = ["Users", "Documents", "All Reports"];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("Users");
  const [stats, setStats] = useState({ total_users: 0, total_docs: 0, avg_overall_score: 0, total_reports: 0 });
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [reports, setReports] = useState([]);

  const load = async () => {
    try {
      const [statsRes, usersRes, docsRes, reportsRes] = await Promise.all([
        api.get("/api/admin/stats"),
        api.get("/api/admin/users"),
        api.get("/api/admin/documents"),
        api.get("/api/admin/reports"),
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data.users || []);
      setDocuments(docsRes.data.data.documents || []);
      setReports(reportsRes.data.data.reports || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load admin dashboard");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/api/admin/user/${id}`);
      toast.success("User deleted");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="neon-page min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <h1 className="font-display text-3xl neon-title">Admin Dashboard</h1>

        <section className="grid md:grid-cols-4 gap-4">
          <div className="metric-card"><p className="text-sm text-soft">Total Users</p><p className="text-3xl font-bold text-white">{stats.total_users}</p></div>
          <div className="metric-card"><p className="text-sm text-soft">Total Documents</p><p className="text-3xl font-bold text-white">{stats.total_docs}</p></div>
          <div className="metric-card"><p className="text-sm text-soft">Avg Score</p><p className="text-3xl font-bold text-white">{Number(stats.avg_overall_score || 0).toFixed(2)}</p></div>
          <div className="metric-card"><p className="text-sm text-soft">Total Reports</p><p className="text-3xl font-bold text-white">{stats.total_reports}</p></div>
        </section>

        <section className="card p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {tabs.map((t) => (
              <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg border transition ${activeTab === t ? "bg-indigo/70 text-white border-indigo/70" : "bg-white/5 text-white/80 border-white/20 hover:bg-white/10"}`}>
                {t}
              </button>
            ))}
          </div>

          {activeTab === "Users" ? (
            <div className="overflow-auto">
              <table className="neon-table w-full min-w-[760px] text-sm text-white/90">
                <thead className="text-white"><tr><th className="p-3 text-left">Name</th><th className="p-3 text-left">Email</th><th className="p-3 text-left">Role</th><th className="p-3 text-left">Joined Date</th><th className="p-3 text-left">Action</th></tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="p-3">{u.username}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">{u.role}</td>
                      <td className="p-3">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="p-3"><button onClick={() => deleteUser(u.id)} className="neon-btn alt px-3 py-1 rounded text-white">Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {activeTab === "Documents" ? (
            <div className="overflow-auto">
              <table className="neon-table w-full min-w-[920px] text-sm text-white/90">
                <thead className="text-white"><tr><th className="p-3 text-left">User</th><th className="p-3 text-left">Filename</th><th className="p-3 text-left">Type</th><th className="p-3 text-left">Date</th><th className="p-3 text-left">Score</th></tr></thead>
                <tbody>
                  {documents.map((d) => (
                    <tr key={d.id}>
                      <td className="p-3">{d.user}</td>
                      <td className="p-3">{d.filename}</td>
                      <td className="p-3">{d.doc_type}</td>
                      <td className="p-3">{new Date(d.uploaded_at).toLocaleString()}</td>
                      <td className="p-3">{Number(d.overall_score || 0).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {activeTab === "All Reports" ? (
            <div className="overflow-auto">
              <table className="neon-table w-full min-w-[900px] text-sm text-white/90">
                <thead className="text-white"><tr><th className="p-3 text-left">User</th><th className="p-3 text-left">Doc</th><th className="p-3 text-left">Score</th><th className="p-3 text-left">Date</th><th className="p-3 text-left">View</th></tr></thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id}>
                      <td className="p-3">{r.user}</td>
                      <td className="p-3">{r.filename}</td>
                      <td className="p-3">{Number(r.overall_score || 0).toFixed(1)}</td>
                      <td className="p-3">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="p-3"><Link to={`/report/${r.id}`} className="neon-btn px-3 py-1 rounded text-white">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
