export default function StatsBar({ moves, matches, totalPairs, time, formatTime }) {
  return (
    <div className="stats-bar">
      <div className="stat-item">
        <span className="stat-icon">🎯</span>
        <span className="stat-value">{moves}</span>
        <span className="stat-label">Ходы</span>
      </div>
      <div className="stat-item">
        <span className="stat-icon">✨</span>
        <span className="stat-value">{matches}/{totalPairs}</span>
        <span className="stat-label">Пары</span>
      </div>
      <div className="stat-item">
        <span className="stat-icon">⏱️</span>
        <span className="stat-value gold">{formatTime(time)}</span>
        <span className="stat-label">Время</span>
      </div>
    </div>
  );
}
