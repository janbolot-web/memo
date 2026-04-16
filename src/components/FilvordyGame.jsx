import { useRef, useCallback } from 'react';
import { useFilvordy, PUZZLE_SETS } from '../hooks/useFilvordy';

const WORD_COLORS = [
  '#7c3aed', '#10b981', '#f59e0b', '#ef4444',
  '#3b82f6', '#ec4899', '#14b8a6', '#84cc16',
  '#f97316', '#a855f7',
];

export default function FilvordyGame({ onBack }) {
  const {
    grid, words, foundWords, rows, cols,
    selectedKey, foundCellKeys, flashError,
    puzzleSet, puzzleSets,
    isWon, time, formatTime,
    startSelect, moveSelect, endSelect,
    newPuzzle, setPuzzleSet,
  } = useFilvordy(14, 16);

  const boardRef = useRef(null);

  const cellFromPoint = useCallback((clientX, clientY) => {
    const board = boardRef.current;
    if (!board) return null;
    const rect = board.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const c = Math.floor((x / rect.width) * cols);
    const r = Math.floor((y / rect.height) * rows);
    if (r >= 0 && r < rows && c >= 0 && c < cols) return { r, c };
    return null;
  }, [rows, cols]);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    const cell = cellFromPoint(e.clientX, e.clientY);
    if (cell) startSelect(cell.r, cell.c);
  }, [cellFromPoint, startSelect]);

  const onMouseMove = useCallback((e) => {
    const cell = cellFromPoint(e.clientX, e.clientY);
    if (cell) moveSelect(cell.r, cell.c);
  }, [cellFromPoint, moveSelect]);

  const onMouseUp = useCallback(() => endSelect(), [endSelect]);

  const onTouchStart = useCallback((e) => {
    e.preventDefault();
    const t = e.touches[0];
    const cell = cellFromPoint(t.clientX, t.clientY);
    if (cell) startSelect(cell.r, cell.c);
  }, [cellFromPoint, startSelect]);

  const onTouchMove = useCallback((e) => {
    e.preventDefault();
    const t = e.touches[0];
    const cell = cellFromPoint(t.clientX, t.clientY);
    if (cell) moveSelect(cell.r, cell.c);
  }, [cellFromPoint, moveSelect]);

  const onTouchEnd = useCallback(() => endSelect(), [endSelect]);

  const getCellStyle = (r, c) => {
    const key = `${r},${c}`;
    if (selectedKey.has(key)) {
      return flashError
        ? { background: 'rgba(239,68,68,0.55)', color: '#fff', transform: 'scale(1.06)' }
        : { background: 'rgba(168,85,247,0.65)', color: '#fff', transform: 'scale(1.06)' };
    }
    if (foundCellKeys.has(key)) {
      const wi = grid[r][c].wordIndex;
      const color = WORD_COLORS[wi % WORD_COLORS.length];
      return { background: color + '99', color: '#fff', borderColor: color };
    }
    return {};
  };

  const progress = words.length > 0 ? (foundWords.size / words.length) * 100 : 0;

  return (
    <div className="filvordy-container">
      {/* ── Sidebar ── */}
      <aside className="filvordy-sidebar">
        <header className="game-header" style={{ paddingBottom: '16px' }}>
          <div className="game-logo">
            <span className="game-logo-icon">🔤</span>
            <h1 className="game-title">ФИЛВОРДЫ</h1>
          </div>
          <p className="game-subtitle">Найди все слова в сетке</p>
        </header>

        {/* Timer */}
        <div className="filvordy-timer">
          <span className="filvordy-timer-icon">⏱</span>
          <span className="filvordy-timer-value">{formatTime(time)}</span>
        </div>

        {/* Puzzle set selector */}
        <div className="filvordy-section-label">Набор слов</div>
        <div className="filvordy-sets">
          {Object.entries(puzzleSets).map(([key, { label, icon }]) => (
            <button
              key={key}
              className={`filvordy-set-btn ${puzzleSet === key ? 'active' : ''}`}
              onClick={() => setPuzzleSet(key)}
            >
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="filvordy-stats">
          <div className="filvordy-stat">
            <span className="filvordy-stat-value">{foundWords.size}</span>
            <span className="filvordy-stat-label">найдено</span>
          </div>
          <div className="filvordy-stat">
            <span className="filvordy-stat-value">{words.length - foundWords.size}</span>
            <span className="filvordy-stat-label">осталось</span>
          </div>
        </div>

        {/* Controls */}
        <div className="controls-row" style={{ marginTop: '16px' }}>
          <button className="ctrl-btn" onClick={() => newPuzzle()}>🔁 Заново</button>
          <button className="ctrl-btn" onClick={onBack}>🏠 Меню</button>
        </div>
      </aside>

      {/* ── Board + Words below ── */}
      <main className="filvordy-board-wrapper">
        {/* Grid */}
        <div
          ref={boardRef}
          className={`filvordy-board${flashError ? ' flash-error' : ''}`}
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onContextMenu={e => e.preventDefault()}
        >
          {grid.flatMap((row, r) =>
            row.map((cell, c) => {
              const style = getCellStyle(r, c);
              return (
                <div
                  key={`${r}-${c}`}
                  className={`filvordy-cell${style.background ? ' highlighted' : ''}`}
                  style={style}
                >
                  {cell.letter}
                </div>
              );
            })
          )}
        </div>

        {/* Progress bar */}
        <div className="filvordy-progress-bar">
          <div className="filvordy-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* ── Word list BELOW the board ── */}
        <div className="filvordy-words-below">
          {words.map((word, i) => {
            const found = foundWords.has(i);
            const color = WORD_COLORS[i % WORD_COLORS.length];
            return (
              <div
                key={i}
                className={`filvordy-word-chip ${found ? 'found' : ''}`}
                style={found ? {
                  borderColor: color,
                  background: color + '28',
                  color: color,
                } : {}}
              >
                {found && <span className="filvordy-word-check">✓</span>}
                {word}
              </div>
            );
          })}
        </div>
      </main>

      {/* ── Win Modal ── */}
      {isWon && (
        <div className="modal-overlay">
          <div className="modal-card">
            <span className="modal-trophy">🎉</span>
            <h2 className="modal-title">Все слова найдены!</h2>
            <p className="modal-subtitle">
              Набор «{puzzleSets[puzzleSet]?.label}» пройден
            </p>
            <div className="modal-stats">
              <div className="modal-stat">
                <span className="modal-stat-value">{words.length}</span>
                <span className="modal-stat-label">Слов</span>
              </div>
              <div className="modal-stat">
                <span className="modal-stat-value">{formatTime(time)}</span>
                <span className="modal-stat-label">Время</span>
              </div>
            </div>
            <button className="modal-btn modal-btn-primary" onClick={() => newPuzzle()}>
              🔁 Играть снова
            </button>
            <button
              className="modal-btn modal-btn-secondary"
              style={{ marginTop: '10px' }}
              onClick={onBack}
            >
              🏠 В меню
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
