import { useRef, useState } from "react";

const FileUpload = ({ onFileChange }) => {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    onFileChange(file);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-8 text-center transition relative overflow-hidden ${dragOver ? "border-periwinkle bg-periwinkle/20" : "border-sun/70 bg-black/20"}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files[0]);
      }}
    >
      <div className="orbit absolute -top-10 right-8 h-20 w-20 rounded-full bg-sun/30 blur-2xl" />
      <p className="font-semibold text-white">Drag and drop PDF/DOCX here</p>
      <p className="text-sm text-soft mt-1">or</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="neon-btn alt mt-4 px-4 py-2 rounded-lg text-white font-semibold"
      >
        Choose File
      </button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.docx"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
};

export default FileUpload;
