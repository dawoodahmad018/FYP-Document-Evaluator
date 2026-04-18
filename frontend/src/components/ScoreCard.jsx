const ScoreCard = ({ title, score }) => {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const safeScore = Number(score || 0);
  const offset = circumference - (safeScore / 10) * circumference;

  const ringColor = safeScore >= 8 ? "#1f9d55" : safeScore >= 5 ? "#f18701" : "#f35b04";

  return (
    <div className="metric-card text-center">
      <h3 className="font-display text-lg mb-3 neon-title">{title}</h3>
      <div className="mx-auto w-28 h-28 relative">
        <div className="orbit absolute inset-2 rounded-full bg-periwinkle/30 blur-xl" />
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} stroke="rgba(255,255,255,0.18)" strokeWidth="10" fill="none" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={ringColor}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center font-bold text-white text-xl">{safeScore.toFixed(1)}</div>
      </div>
    </div>
  );
};

export default ScoreCard;
