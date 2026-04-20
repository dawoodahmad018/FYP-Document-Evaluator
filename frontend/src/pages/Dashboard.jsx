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

  const averageScore = reports.length > 0 
    ? (reports.reduce((acc, r) => acc + Number(r.overall_score || 0), 0) / reports.length).toFixed(1)
    : "0.0";

  const downloadPDF = async (reportId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/reports/${reportId}/pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("PDF load failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      toast.error("Could not download PDF");
    }
  };

  return (
    <div className="neon-page min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        <div className="card p-8 mb-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border-b-4 border-indigo-500">
          <div className="orbit absolute -top-12 -left-12 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="orbit absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-sun/20 blur-2xl" />
          
          <div className="relative z-10">
            <h1 className="font-display text-4xl neon-title mb-2">Welcome back, {user?.username}</h1>
            <p className="text-white/70 text-lg">Manage your FYP document evaluations and track your progress.</p>
          </div>
          
          <div className="relative z-10 flex gap-4 bg-black/30 p-4 rounded-2xl border border-white/10">
            <div className="text-center px-4 border-r border-white/10">
              <p className="text-white/50 text-sm font-semibold uppercase tracking-wider mb-1">Documents</p>
              <p className="text-3xl font-bold text-white">{reports.length}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-white/50 text-sm font-semibold uppercase tracking-wider mb-1">Avg Score</p>
              <p className="text-3xl font-bold text-sun">{averageScore}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-white">Your Submissions</h2>
          <Link to="/upload" className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-300 px-6 py-2.5 rounded-full font-bold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Upload New Document
          </Link>
        </div>

        <div className="overflow-auto rounded-2xl border border-white/10 bg-black/20 backdrop-blur-sm shadow-xl">
          <table className="w-full min-w-[860px] text-sm text-white/90">
            <thead className="text-white border-b border-white/20 bg-white/5">
              <tr>
                <th className="p-5 text-left font-semibold tracking-wide">Filename</th>
                <th className="p-5 text-left font-semibold tracking-wide">Doc Type</th>
                <th className="p-5 text-left font-semibold tracking-wide">Date</th>
                <th className="p-5 text-left font-semibold tracking-wide">Overall Score</th>
                <th className="p-5 text-left font-semibold tracking-wide">Status</th>
                <th className="p-5 text-left font-semibold tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-white/50 animate-pulse">Loading documents...</td></tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-white/50">
                    <div className="flex flex-col items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg">No documents evaluated yet.</p>
                      <Link to="/upload" className="text-indigo-400 mt-2 hover:underline">Upload your first document now</Link>
                    </div>
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-5 font-medium text-indigo-300">{r.filename}</td>
                    <td className="p-5"><span className="bg-white/10 text-white/80 border border-white/20 px-2.5 py-1 rounded-md text-xs">{r.doc_type}</span></td>
                    <td className="p-5 text-white/60">{new Date(r.created_at).toLocaleString(undefined, {dateStyle: 'medium', timeStyle: 'short'})}</td>
                    <td className="p-5 font-extrabold text-sun text-lg">{Number(r.overall_score || 0).toFixed(1)}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${r.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : r.status === 'failed' ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-5 flex gap-3">
                      <Link to={`/report/${r.id}`} className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/40 px-4 py-1.5 rounded-lg transition-colors font-medium">View Report</Link>
                      {r.pdf_available ? (
                        <button onClick={() => downloadPDF(r.id)} className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/40 px-4 py-1.5 rounded-lg transition-colors font-medium">Download PDF</button>
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
