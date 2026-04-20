import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../api/axios";
import EvaluationResult from "../components/EvaluationResult";
import Navbar from "../components/Navbar";
import ScoreCard from "../components/ScoreCard";

const Report = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/api/reports/${id}`);
        setReport(data.data.report);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Could not fetch report");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return <div className="neon-page min-h-screen grid place-items-center text-soft">Loading report...</div>;
  }

  if (!report) {
    return <div className="neon-page min-h-screen grid place-items-center text-soft">Report not found</div>;
  }

  const scoreCards = [
    ["Grammar", report.grammar_score],
    ["Structure", report.structure_score],
    ["Formatting", report.formatting_score],
    ["Relevance", report.relevance_score],
    ["AI Detection", report.ai_detect_score],
  ];

  return (
    <div className="neon-page min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="card p-6 relative overflow-hidden">
          <div className="orbit absolute -top-8 -right-8 h-24 w-24 rounded-full bg-sun/30 blur-2xl" />
          <h1 className="font-display text-3xl neon-title">{report.filename}</h1>
          <p className="text-soft">Type: {report.doc_type}</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 text-white px-4 py-2">
            <span className="text-lg font-bold">{Number(report.overall_score).toFixed(1)}</span>
            <span>Overall Score</span>
          </div>
          <div className="mt-4">
            <button 
              onClick={async () => {
                try {
                  const token = localStorage.getItem("token");
                  const response = await fetch(`http://localhost:8000/api/reports/${report.id}/pdf`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  if (!response.ok) throw new Error("PDF load failed");
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `report_${report.id}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  a.remove();
                } catch (err) {
                  toast.error("Could not download PDF");
                }
              }} 
              className="neon-btn alt px-4 py-2 rounded-lg text-white font-semibold"
            >
              Download PDF Report
            </button>
          </div>
        </div>

        <section className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {scoreCards.map(([title, score]) => (
            <ScoreCard key={title} title={title} score={score} />
          ))}
        </section>

        <EvaluationResult report={report} />
      </main>
    </div>
  );
};

export default Report;
