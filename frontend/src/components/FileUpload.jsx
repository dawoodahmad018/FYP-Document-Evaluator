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
      className={`border-2 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden group
      ${dragOver 
        ? "border-sun bg-sun/10 scale-[1.02] shadow-[0_0_40px_rgba(243,91,4,0.3)]" 
        : "border-indigo-500/50 bg-black/40 hover:bg-indigo-900/20 hover:border-indigo-400 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]"
      }`}
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
      onClick={() => inputRef.current?.click()}
    >
      <div className={`absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

      <div className={`p-5 rounded-2xl mb-4 transition-colors duration-300 ${dragOver ? "bg-sun/20 text-sun shadow-[0_0_20px_rgba(243,91,4,0.5)]" : "bg-indigo-500/20 text-indigo-400 group-hover:text-indigo-300"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      </div>

      <div className="orbit absolute -top-10 right-8 h-20 w-20 rounded-full bg-sun/30 blur-2xl pointer-events-none" />
      <p className="text-xl font-bold text-white mb-2 tracking-wide drop-shadow-md">
        {dragOver ? "Drop file here!" : "Drag & Drop Document"}
      </p>
      <p className="text-white/60 mb-6 text-center text-sm">or click anywhere to browse</p>
      
      <span className="bg-white/10 text-white/50 text-xs font-semibold px-4 py-2 rounded-full uppercase tracking-widest border border-white/10 shadow-inner">
        PDF or DOCX
      </span>

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
