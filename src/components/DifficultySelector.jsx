export default function DifficultySelector({ difficulties, current, onChange }) {
  return (
    <div className="difficulty-selector">
      {Object.entries(difficulties).map(([key, cfg]) => (
        <button
          key={key}
          className={`diff-btn ${current === key ? 'active' : ''}`}
          onClick={() => onChange(key)}
        >
          {cfg.label} ({cfg.pairs} пар)
        </button>
      ))}
    </div>
  );
}
