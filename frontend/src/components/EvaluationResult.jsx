import { useState } from "react";

const EvaluationResult = ({ report }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const feedbackRows = [
    ["Grammar", report.grammar_feedback],
    ["Structure", report.structure_feedback],
    ["Formatting", report.formatting_feedback],
    ["Relevance", report.relevance_feedback],
    ["AI Detection", report.ai_detect_feedback],
  ];

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="font-display text-xl neon-title mb-4">Detailed Feedback</h3>
        <div className="space-y-3">
          {feedbackRows.map(([title, body]) => (
            <div key={title} className="rounded-xl border border-white/10 p-4 bg-black/20 hover:bg-black/30 transition">
              <p className="font-semibold text-sun mb-1">{title}</p>
              <p className="text-white/80 text-sm leading-6">{body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-display text-xl neon-title mb-4">Q&A</h3>
        <div className="space-y-2">
          {(report.questions_answers || []).map((qa, idx) => (
            <div key={idx} className="border border-white/15 rounded-lg overflow-hidden bg-black/20">
              <button
                className="w-full text-left p-3 font-semibold text-white bg-indigo/35 hover:bg-indigo/50 transition"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              >
                {qa.question}
              </button>
              {openIndex === idx ? <div className="p-3 bg-black/25 text-sm text-white/80">{qa.answer}</div> : null}
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6 border-l-8 border-sun">
        <h3 className="font-display text-xl neon-title mb-2">Professional Summary</h3>
        <p className="text-white/80 leading-7">{report.summary}</p>
      </div>
    </div>
  );
};

export default EvaluationResult;
