import './index.css';
import './App.css';
import { useState } from 'react';
import { useMemoryGame } from './hooks/useMemoryGame';
import Board from './components/Board';
import StatsBar from './components/StatsBar';
import DifficultySelector from './components/DifficultySelector';
import CategorySelector from './components/CategorySelector';
import WinModal from './components/WinModal';
import CategoryModal from './components/CategoryModal';
import MenuPage from './components/MenuPage';
import FilvordyGame from './components/FilvordyGame';
import StroopTest from './components/StroopTest';

// ---- Memo Game wrapper ----
function MemoGame({ onBack }) {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const {
    cards, moves, matches, totalPairs,
    time, formatTime, isWon, isNewBest,
    difficulty, difficulties, bestScores,
    categories, category, setCategory, saveCustomCategory,
    flipCard, newGame, setDifficulty, cols,
  } = useMemoryGame('hard', 'kyrgyz2');

  const handleDiffSelect = (d) => {
    setDifficulty(d);
  };

  const diffLabels = { easy: 'Лёгкий', medium: 'Средний', hard: 'Сложный' };

  return (
    <div className="game-container">
      <div className="game-layout">
        {/* Floating Hamburger Menu Button */}
        <button className="menu-toggle-btn" onClick={() => setIsMenuOpen(true)}>
          ☰ Меню
        </button>

        {/* Menu Overlay */}
        <div className={`menu-overlay ${isMenuOpen ? 'visible' : ''}`} onClick={() => setIsMenuOpen(false)}></div>

        {/* Sidebar as Drawer */}
        <aside className={`game-sidebar ${isMenuOpen ? 'open' : ''}`}>
          <button className="close-menu-btn" onClick={() => setIsMenuOpen(false)}>✕</button>
          <header className="game-header">
            <div className="game-logo">
              <span className="game-logo-icon">🃏</span>
              <h1 className="game-title">МЕМО</h1>
            </div>
            <p className="game-subtitle">Найди все пары карточек</p>
          </header>

          <CategorySelector
            categories={categories}
            current={category}
            onChange={setCategory}
            onOpenCustomModal={() => setShowCategoryModal(true)}
          />

          <DifficultySelector
            difficulties={difficulties}
            current={difficulty}
            onChange={handleDiffSelect}
          />

          <StatsBar
            moves={moves}
            matches={matches}
            totalPairs={totalPairs}
            time={time}
            formatTime={formatTime}
          />

          <div className="controls-row">
            <button className="ctrl-btn" onClick={() => {
              newGame();
              setIsMenuOpen(false);
            }}>
              🔁 Заново
            </button>
            <button className="ctrl-btn" onClick={onBack}>
              🏠 Выход
            </button>
          </div>

          {Object.values(bestScores).some(Boolean) && (
            <div className="best-scores">
              <p className="best-scores-title">🏆 Лучшие результаты</p>
              <div className="best-scores-row">
                {Object.entries(bestScores).map(([d, score]) =>
                  score ? (
                    <div key={d} className="best-score-badge">
                      {diffLabels[d]}: {score.moves} ходов
                      <span>/ {formatTime(score.time)}</span>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Board */}
        <main className="game-board-container">
          <Board cards={cards} cols={cols} onCardClick={flipCard} />
        </main>
      </div>

      <WinModal
        isOpen={isWon}
        moves={moves}
        time={time}
        formatTime={formatTime}
        isNewBest={isNewBest}
        difficulty={diffLabels[difficulty]}
        onPlayAgain={() => newGame()}
        onChangeDifficulty={() => {}}
      />

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSave={saveCustomCategory}
        initialPool={categories.custom?.pool || []}
      />
    </div>
  );
}

// ---- Root ----
export default function App() {
  const [screen, setScreen] = useState('menu'); // 'menu' | 'memo' | 'filvordy' | 'stroop'

  if (screen === 'memo') return <MemoGame onBack={() => setScreen('menu')} />;
  if (screen === 'filvordy') return <FilvordyGame onBack={() => setScreen('menu')} />;
  if (screen === 'stroop') return <StroopTest onBack={() => setScreen('menu')} />;
  return <MenuPage onSelectGame={setScreen} />;
}
