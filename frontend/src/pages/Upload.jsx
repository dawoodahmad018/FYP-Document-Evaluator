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
      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={submit} className="card p-6 space-y-6">
          <h1 className="font-display text-3xl neon-title">Upload Document</h1>
          <FileUpload onFileChange={setFile} />
          {file ? <p className="text-sm text-soft">Selected: {file.name}</p> : null}

          <div>
            <label className="block mb-1 font-semibold text-soft">Document Type</label>
            <select className="neon-input" value={docType} onChange={(e) => setDocType(e.target.value)}>
              {docTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <button disabled={loading} className="neon-btn w-full py-3 rounded-lg text-white font-semibold">
            {loading ? "Evaluating your document..." : "Submit for Evaluation"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default Upload;
