import { useEffect, useRef } from 'react';

const COLORS = ['#7c3aed', '#a855f7', '#c084fc', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899'];

function createParticle(container) {
  const el = document.createElement('div');
  el.className = 'confetti';
  el.style.left = `${Math.random() * 100}vw`;
  el.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
  el.style.width = `${6 + Math.random() * 8}px`;
  el.style.height = `${6 + Math.random() * 8}px`;
  el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
  el.style.animationDuration = `${2 + Math.random() * 3}s`;
  el.style.animationDelay = `${Math.random() * 2}s`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 5500);
}

export default function WinModal({
  isOpen,
  moves,
  time,
  formatTime,
  isNewBest,
  difficulty,
  onPlayAgain,
  onChangeDifficulty,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      for (let i = 0; i < 60; i++) {
        createParticle(containerRef.current);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" ref={containerRef}>
      <div className="modal-card">
        <span className="modal-trophy">🏆</span>
        <h2 className="modal-title">Поздравляем!</h2>
        <p className="modal-subtitle">
          Вы нашли все пары на уровне «{difficulty}»
        </p>

        <div className="modal-stats">
          <div className="modal-stat">
            <span className="modal-stat-value">{moves}</span>
            <span className="modal-stat-label">Ходов</span>
          </div>
          <div className="modal-stat">
            <span className="modal-stat-value">{formatTime(time)}</span>
            <span className="modal-stat-label">Время</span>
          </div>
        </div>

        {isNewBest && (
          <div className="modal-new-best">
            🌟 Новый рекорд!
          </div>
        )}

        <button className="modal-btn modal-btn-primary" onClick={onPlayAgain}>
          🔁 Играть ещё
        </button>
        <button className="modal-btn modal-btn-secondary" onClick={onChangeDifficulty}>
          🎚️ Другой уровень
        </button>
      </div>
    </div>
  );
}
