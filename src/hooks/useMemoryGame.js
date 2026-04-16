import { useState, useEffect, useCallback, useRef } from 'react';
import { useSoundEffects } from './useSoundEffects';

export const CATEGORIES = {
  mixed: { label: 'Ассорти', icon: '🎨', pool: ['🦊', '🐼', '🦁', '🐯', '🦋', '🦄', '🐉', '🦀', '🌺', '🍄', '🎸', '🚀', '🎭', '💎', '🔮', '⚡', '🌊', '🍕', '🎯', '🏆', '🎪', '🌙', '🦚', '🎨'] },
  animals: { label: 'Животные', icon: '🦊', pool: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦'] },
  food: { label: 'Еда', icon: '🍔', pool: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🍔', '🍟', '🍕', '🌭'] },
  space: { label: 'Космос', icon: '🚀', pool: ['🌍', '🌝', '🌤', '⭐', '🌠', '🌌', '🚀', '🛸', '🛰', '👨‍🚀', '☄️', '🌙', '🪐', '🔭', '👽', '👾', '🔥', '🌞'] },
  kyrgyz: { label: 'Бөлүкчөлөр', icon: '🇰🇬', pool: ['го', 'гана', 'абдан', 'өтө', 'ыя', 'эч', 'белем', 'бейм', 'да', 'деле', 'тургай', 'түгүл', 'тура', 'турбайбы', 'эмеспи', 'кана', 'эле', 'гой', 'ай', 'чыгар'] },
  kyrgyz2: { label: 'Бөлүкчөлөр 2', icon: '🇰🇬', pool: ['гана', 'эле', 'өтө', 'абдан', 'аябай', 'да', 'дагы', 'деле', 'так', 'нак', 'ооба', 'эч', 'турсун', 'турмак', 'түгүл', 'ыя', 'куду', 'кадим', 'го'] },
};

export const DIFFICULTIES = {
  easy: { label: 'Лёгкий', cols: 4, pairs: 8 },
  medium: { label: 'Средний', cols: 4, pairs: 12 },
  hard: { label: 'Сложный', cols: 6, pairs: 18 },
};

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function createCards(pairs, categoryKey = 'mixed', customCategories = null) {
  const merged = { ...CATEGORIES, ...(customCategories || {}) };
  const pool = merged[categoryKey] ? merged[categoryKey].pool : CATEGORIES['mixed'].pool;
  
  if (!pool || pool.length === 0) return [];

  let emojis = [];
  const shuffledPool = shuffle(pool);
  
  // Fill emojis until we reach pairs count (loops if pool is smaller)
  while (emojis.length < pairs) {
    emojis.push(...shuffledPool.slice(0, pairs - emojis.length));
  }

  return shuffle([...emojis, ...emojis].map((emoji, i) => ({
    id: i,
    emoji,
    isFlipped: false,
    isMatched: false,
  })));
}

function getBestKey(difficulty) {
  return `memo_best_${difficulty}`;
}

export function useMemoryGame(initialDifficulty = 'easy', initialCategory = 'mixed') {
  const [customCategories, setCustomCategories] = useState(() => {
    const stored = localStorage.getItem('memo_custom_categories');
    return stored ? JSON.parse(stored) : null;
  });

  const [difficulty, setDifficultyState] = useState(initialDifficulty);
  const [category, setCategoryState] = useState(initialCategory);
  
  const [cards, setCards] = useState(() => {
    const stored = localStorage.getItem('memo_custom_categories');
    const custom = stored ? JSON.parse(stored) : null;
    return createCards(DIFFICULTIES[initialDifficulty].pairs, initialCategory, custom);
  });
  
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [bestScores, setBestScores] = useState(() => {
    const scores = {};
    Object.keys(DIFFICULTIES).forEach(d => {
      const v = localStorage.getItem(getBestKey(d));
      scores[d] = v ? JSON.parse(v) : null;
    });
    return scores;
  });

  const { playFlip, playMatch, playMismatch, playWin } = useSoundEffects();

  const timerRef = useRef(null);

  // Timer
  useEffect(() => {
    if (isRunning && !isWon) {
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, isWon]);

  const stopGame = useCallback(() => {
    clearInterval(timerRef.current);
    setIsRunning(false);
  }, []);

  // Win check
  const totalPairs = DIFFICULTIES[difficulty].pairs;
  useEffect(() => {
    if (matches > 0 && matches === totalPairs) {
      stopGame();
      setIsWon(true);
      playWin();
      // Save best score
      const current = { moves, time };
      const prev = bestScores[difficulty];
      if (!prev || moves < prev.moves || (moves === prev.moves && time < prev.time)) {
        const next = { ...bestScores, [difficulty]: current };
        setBestScores(next);
        localStorage.setItem(getBestKey(difficulty), JSON.stringify(current));
      }
    }
  }, [matches, totalPairs, moves, time, difficulty, bestScores, stopGame, playWin]);

  const flipCard = useCallback((id) => {
    if (isLocked || isWon) return;

    // Synchronous check to prevent double click on same card
    if (flipped.includes(id)) return;

    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    if (!isRunning) setIsRunning(true);

    playFlip();

    const nextFlipped = [...flipped, id];
    setFlipped(nextFlipped);

    // Optimistically show flip
    setCards(prevCards =>
      prevCards.map(c => (c.id === id ? { ...c, isFlipped: true } : c))
    );

    if (nextFlipped.length === 2) {
      setIsLocked(true);
      setMoves(m => m + 1);

      const [id1, id2] = nextFlipped;
      const card1 = cards.find(c => c.id === id1);
      const card2 = cards.find(c => c.id === id2);

      const isMatch = card1 && card2 && card1.emoji === card2.emoji;

      if (isMatch) {
        setMatches(m => m + 1);
      }

      setTimeout(() => {
        if (isMatch) {
          playMatch();
        } else {
          playMismatch();
        }

        setCards(currCards => {
          return currCards.map(c => {
            if (c.id === id1 || c.id === id2) {
              return { ...c, isMatched: isMatch, isFlipped: isMatch };
            }
            return c;
          });
        });
        setFlipped([]);
        setIsLocked(false);
      }, 900);
    }
  }, [isLocked, isWon, isRunning, cards, flipped, playFlip, playMatch, playMismatch]);

  const newGame = useCallback((diff, cat, overrideCustom) => {
    const d = diff || difficulty;
    const c = cat || category;
    const cust = overrideCustom !== undefined ? overrideCustom : customCategories;
    
    clearInterval(timerRef.current);
    setDifficultyState(d);
    setCategoryState(c);
    setCards(createCards(DIFFICULTIES[d].pairs, c, cust));
    setFlipped([]);
    setMoves(0);
    setMatches(0);
    setTime(0);
    setIsRunning(false);
    setIsLocked(false);
    setIsWon(false);
  }, [difficulty, category, customCategories]);

  const saveCustomCategory = useCallback((pool) => {
    if (!pool || pool.length === 0) return;
    const newCustom = {
      custom: { label: 'Мой список', icon: '📝', pool }
    };
    setCustomCategories(newCustom);
    localStorage.setItem('memo_custom_categories', JSON.stringify(newCustom));
    if (category === 'custom') {
      newGame(difficulty, 'custom', newCustom);
    }
  }, [category, difficulty, newGame]);

  const setDifficulty = useCallback((d) => {
    newGame(d, category);
  }, [newGame, category]);

  const setCategory = useCallback((c) => {
    newGame(difficulty, c);
  }, [newGame, difficulty]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const isNewBest = isWon && (() => {
    const prev = bestScores[difficulty];
    if (!prev) return true;
    if (moves < prev.moves) return true;
    if (moves === prev.moves && time <= prev.time) return true;
    return false;
  })();

  return {
    cards,
    flipped,
    moves,
    matches,
    time,
    formatTime,
    isRunning,
    isWon,
    difficulty,
    difficulties: DIFFICULTIES,
    categories: { ...CATEGORIES, ...(customCategories || {}) },
    category,
    bestScores,
    isNewBest,
    flipCard,
    newGame,
    setDifficulty,
    setCategory,
    saveCustomCategory,
    totalPairs,
    cols: DIFFICULTIES[difficulty].cols,
  };
}
