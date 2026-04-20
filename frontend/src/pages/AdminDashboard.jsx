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

  const deleteDocument = async (id) => {
    if (!window.confirm("Delete this document? All associated reports will also be deleted.")) return;
    try {
      await api.delete(`/api/admin/document/${id}`);
      toast.success("Document deleted successfully");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete document");
    }
  };

  const deleteReport = async (id) => {
    if (!window.confirm("Delete this report?")) return;
    try {
      await api.delete(`/api/admin/report/${id}`);
      toast.success("Report deleted successfully");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete report");
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
            <div className="overflow-auto rounded-xl border border-white/10 bg-black/20">
              <table className="w-full min-w-[760px] text-sm text-white/90">
                <thead className="text-white border-b border-white/20 bg-indigo/30"><tr><th className="p-4 text-left font-semibold">Name</th><th className="p-4 text-left font-semibold">Email</th><th className="p-4 text-left font-semibold">Role</th><th className="p-4 text-left font-semibold">Joined Date</th><th className="p-4 text-left font-semibold">Action</th></tr></thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">{u.username}</td>
                      <td className="p-4">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${u.role === 'admin' ? 'bg-sun/20 text-sun border border-sun/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>{u.role}</span>
                      </td>
                      <td className="p-4 text-white/60">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="p-4"><button onClick={() => deleteUser(u.id)} className="bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/40 px-3 py-1 rounded-lg transition-colors">Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {activeTab === "Documents" ? (
            <div className="overflow-auto rounded-xl border border-white/10 bg-black/20">
              <table className="w-full min-w-[920px] text-sm text-white/90">
                <thead className="text-white border-b border-white/20 bg-indigo/30"><tr><th className="p-4 text-left font-semibold">User</th><th className="p-4 text-left font-semibold">Filename</th><th className="p-4 text-left font-semibold">Type</th><th className="p-4 text-left font-semibold">Date</th><th className="p-4 text-left font-semibold">Score</th><th className="p-4 text-left font-semibold">Action</th></tr></thead>
                <tbody className="divide-y divide-white/10">
                  {documents.map((d) => (
                    <tr key={d.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">{d.user} <span className="block text-xs text-white/50">{d.user_email}</span></td>
                      <td className="p-4 font-medium text-indigo-300">{d.filename}</td>
                      <td className="p-4"><span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-1 rounded-md text-xs">{d.doc_type}</span></td>
                      <td className="p-4 text-white/60">{new Date(d.uploaded_at).toLocaleString()}</td>
                      <td className="p-4"><span className="text-sun font-bold">{Number(d.overall_score || 0).toFixed(1)}</span>/10</td>
                      <td className="p-4"><button onClick={() => deleteDocument(d.id)} className="bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/40 px-3 py-1 rounded-lg transition-colors">Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {activeTab === "All Reports" ? (
            <div className="overflow-auto rounded-xl border border-white/10 bg-black/20">
              <table className="w-full min-w-[900px] text-sm text-white/90">
                <thead className="text-white border-b border-white/20 bg-indigo/30"><tr><th className="p-4 text-left font-semibold">User</th><th className="p-4 text-left font-semibold">Doc</th><th className="p-4 text-left font-semibold">Score</th><th className="p-4 text-left font-semibold">Date</th><th className="p-4 text-left font-semibold">Actions</th></tr></thead>
                <tbody className="divide-y divide-white/10">
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">{r.user} <span className="block text-xs text-white/50">{r.email}</span></td>
                      <td className="p-4 font-medium text-indigo-300">{r.filename} <span className="block text-xs border border-gray-500/30 px-1 mt-1 rounded w-max text-gray-400">{r.doc_type}</span></td>
                      <td className="p-4"><span className="text-sun font-bold text-lg">{Number(r.overall_score || 0).toFixed(1)}</span></td>
                      <td className="p-4 text-white/60">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="p-4 flex flex-wrap gap-2">
                        <Link to={`/report/${r.id}`} className="bg-indigo/40 text-indigo-200 border border-indigo/50 hover:bg-indigo/60 px-3 py-1 flex items-center justify-center rounded-lg transition-colors">View</Link>
                        <button onClick={() => deleteReport(r.id)} className="bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/40 px-3 py-1 rounded-lg transition-colors">Del</button>
                      </td>
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
