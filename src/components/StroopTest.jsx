import { useState, useCallback } from 'react';
import '../App.css';

const COLORS = [
  { word: 'КЫЗЫЛ', color: '#ef4444' }, // Red
  { word: 'ЖАШЫЛ', color: '#10b981' }, // Green
  { word: 'САРЫ', color: '#eab308' },  // Yellow
  { word: 'КӨК', color: '#3b82f6' },   // Blue
  { word: 'АК', color: '#ffffff' },    // White
  { word: 'КАРА', color: '#000000' },  // Black
];

// Fisher-Yates shuffle
function shuffle(array) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function generateStroopItems(count) {
  const items = [];
  for (let i = 0; i < count; i++) {
    const wordObj = COLORS[Math.floor(Math.random() * COLORS.length)];
    let colorObj = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    while (colorObj.color === wordObj.color) {
      colorObj = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    
    items.push({
      id: i,
      word: wordObj.word,
      color: colorObj.color,
    });
  }
  return items;
}

export default function StroopTest({ onBack }) {
  // Use 24 items to display a lot of words while still packing them tightly to fit 100vh
  const [items, setItems] = useState(() => generateStroopItems(24));

  const refresh = useCallback(() => {
    setItems(generateStroopItems(24));
  }, []);

  return (
    <div className="game-container" style={{ height: '100dvh', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
      <div className="stroop-wrapper" style={{ height: '100%', maxHeight: '100%', justifyContent: 'space-between' }}>
        <header className="game-header" style={{ flexShrink: 0, paddingBottom: '10px', textAlign: 'center' }}>
          <div className="game-logo" style={{ justifyContent: 'center' }}>
            <span className="game-logo-icon">🧠</span>
            <h1 className="game-title">СТРУП ТЕСТ</h1>
          </div>
          <p className="game-subtitle" style={{ marginTop: '5px' }}>
            Называйте ЦВЕТ слова, а не то, что написано.
          </p>
        </header>

        <div className="stroop-grid" style={{ flex: 1, alignContent: 'center', margin: '0', gap: '8px' }}>
          {items.map((item) => (
            <div
              key={item.id}
              className="stroop-word"
              style={{ 
                color: item.color, 
                fontSize: 'clamp(1rem, 2.5vw, 1.8rem)', 
                padding: '6px 14px', 
                margin: '4px',
                lineHeight: '1.2'
              }}
            >
              {item.word}
            </div>
          ))}
        </div>

        <div className="controls-row" style={{ flexShrink: 0, marginTop: '20px', justifyContent: 'center' }}>
          <button className="ctrl-btn" onClick={refresh}>
            🔁 Обновить
          </button>
          <button className="ctrl-btn" onClick={onBack}>
            🏠 Меню
          </button>
        </div>
      </div>
    </div>
  );
}
