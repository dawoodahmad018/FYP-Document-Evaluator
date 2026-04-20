import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../api/axios";
import FileUpload from "../components/FileUpload";
import Navbar from "../components/Navbar";

const docTypes = ["SRS", "SDD", "Scope", "FYP_Proposal", "Other"];

const Upload = () => {
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("SRS");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("doc_type", docType);

      const { data } = await api.post("/api/evaluate/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Upload successful. Evaluation started.");
      navigate(`/report/${data.data.report_id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="neon-page min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <form onSubmit={submit} className="relative card p-8 sm:p-12 space-y-8 overflow-hidden rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md bg-black/40">
          
          {/* Aesthetic background glows */}
          <div className="orbit absolute -top-20 -left-20 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
          <div className="orbit absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-sun/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center">
            <h1 className="font-display text-4xl neon-title mb-2 drop-shadow-md">Upload Document</h1>
            <p className="text-white/60 text-lg">Select a file and specify its type to begin the AI evaluation process.</p>
          </div>

          <div className="relative z-10 w-full max-w-xl mx-auto space-y-6">
            <div className="transform hover:scale-[1.01] transition-transform duration-300">
              <FileUpload onFileChange={setFile} />
              {file ? (
                <div className="mt-4 flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl shadow-inner">
                  <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <p className="text-md text-white/90 font-medium truncate">{file.name}</p>
                </div>
              ) : null}
            </div>

            <div className="pt-2">
              <label className="block mb-2 text-sm font-semibold text-white/70 uppercase tracking-wider">Document Type</label>
              <div className="relative">
                <select 
                  className="w-full bg-black/50 border border-white/10 text-white p-4 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner overflow-hidden cursor-pointer" 
                  value={docType} 
                  onChange={(e) => setDocType(e.target.value)}
                >
                  {docTypes.map((type) => (
                    <option key={type} value={type} className="bg-gray-900 text-white py-2">{type}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <button 
              disabled={loading || !file} 
              className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 mt-4 
                ${loading || !file 
                  ? "bg-white/10 cursor-not-allowed opacity-50 shadow-none border border-white/5" 
                  : "bg-indigo-600 hover:bg-indigo-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] active:scale-95 border border-indigo-400/30"
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Evaluating with AI...
                </span>
              ) : "Submit for AI Evaluation"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Upload;
