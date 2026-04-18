import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/api/reports/");
        setReports(data.data.reports || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="neon-page min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl neon-title">Welcome, {user?.username}</h1>
            <p className="text-soft">Track all uploaded FYP documents and their evaluations.</p>
          </div>
          <Link to="/upload" className="neon-btn alt px-4 py-2 rounded-lg text-white font-semibold">Upload New Document</Link>
        </div>

        <div className="card overflow-auto">
          <table className="neon-table w-full min-w-[860px] text-sm text-white/90">
            <thead className="text-white">
              <tr>
                <th className="p-3 text-left">Filename</th>
                <th className="p-3 text-left">Doc Type</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Overall Score</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-4 text-soft">Loading...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan="6" className="p-4 text-soft">No reports found yet.</td></tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.id}>
                    <td className="p-3">{r.filename}</td>
                    <td className="p-3">{r.doc_type}</td>
                    <td className="p-3">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="p-3 font-bold">{Number(r.overall_score || 0).toFixed(1)}</td>
                    <td className="p-3 capitalize">{r.status}</td>
                    <td className="p-3 flex gap-2">
                      <Link to={`/report/${r.id}`} className="neon-btn px-3 py-1 rounded text-white">View Report</Link>
                      {r.pdf_available ? (
                        <a href={`http://localhost:8000/api/reports/${r.id}/pdf`} className="neon-btn alt px-3 py-1 rounded text-white">Download PDF</a>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
