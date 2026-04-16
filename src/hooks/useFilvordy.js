import { useState, useCallback, useEffect, useRef } from 'react';
import { playTick, playMatch, playError, playWin } from '../utils/audio';

export const PUZZLE_SETS = {
  kyrgyz_particles: {
    label: 'Бөлүкчөлөр',
    icon: '🇰🇬',
    words: ['ГАНА', 'ООБА', 'ДАЛ', 'ЫЯ', 'АБДАН', 'ЭҢ', 'КУДУ', 'ЭЛЕ', 'ТАК', 'ТУРСУН'],
  },
  kyrgyz_nature: {
    label: 'Табият',
    icon: '🌿',
    words: ['ТАШ', 'СУУ', 'ЖЕР', 'АЙ', 'КУН', 'ЖАЙ', 'КЫШ', 'КОЛ', 'ДАР'],
  },
};

const DIRECTIONS = [
  [0, 1], [0, -1], [1, 0], [-1, 0],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];

const ALPHABET = 'АБВГДЕЁЖЗИЙКЛМНҢОӨПРСТУҮФХЦЧШЩЪЫЬЭЮЯ';

let currentSeed = 42;
function seededRandom() {
  currentSeed = (currentSeed * 16807) % 2147483647;
  return (currentSeed - 1) / 2147483646;
}

const rnd = (n) => Math.floor(seededRandom() * n);

function randomLetter() {
  return ALPHABET[rnd(ALPHABET.length)];
}

function generateGrid(words, rows, cols) {
  currentSeed = 12345; // Fixed seed for constant level generation
  
  const grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ letter: '', wordIndex: -1 }))
  );

  for (let wi = 0; wi < words.length; wi++) {
    const word = words[wi].toUpperCase();
    let placed = false;

    for (let attempt = 0; attempt < 300 && !placed; attempt++) {
      const [dr, dc] = DIRECTIONS[rnd(DIRECTIONS.length)];
      const r0 = rnd(rows);
      const c0 = rnd(cols);
      const r1 = r0 + dr * (word.length - 1);
      const c1 = c0 + dc * (word.length - 1);
      if (r1 < 0 || r1 >= rows || c1 < 0 || c1 >= cols) continue;

      let ok = true;
      for (let i = 0; i < word.length; i++) {
        const cell = grid[r0 + dr * i][c0 + dc * i];
        if (cell.letter !== '' && cell.letter !== word[i]) { ok = false; break; }
      }
      if (!ok) continue;

      for (let i = 0; i < word.length; i++) {
        grid[r0 + dr * i][c0 + dc * i] = { letter: word[i], wordIndex: wi };
      }
      placed = true;
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!grid[r][c].letter) {
        grid[r][c] = { letter: randomLetter(), wordIndex: -1, isRandom: true };
      }
    }
  }

  let hasAccidental = true;
  let safetyLimit = 500;
  while (hasAccidental && safetyLimit > 0) {
    hasAccidental = false;
    safetyLimit--;
    for (let wi = 0; wi < words.length; wi++) {
      const word = words[wi].toUpperCase();
      const revWord = [...word].reverse().join('');

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          for (const [dr, dc] of DIRECTIONS) {
            let matchesStr = '';
            let randomCells = [];

            for (let i = 0; i < word.length; i++) {
              const rr = r + dr * i;
              const cc = c + dc * i;
              if (rr < 0 || rr >= rows || cc < 0 || cc >= cols) break;
              matchesStr += grid[rr][cc].letter;
              if (grid[rr][cc].isRandom) randomCells.push({ r: rr, c: cc });
            }

            if ((matchesStr === word || matchesStr === revWord) && randomCells.length > 0) {
              hasAccidental = true;
              const cellToScramble = randomCells[0];
              grid[cellToScramble.r][cellToScramble.c].letter = randomLetter();
            }
          }
        }
      }
    }
  }

  return grid;
}

function calcLine(r1, c1, r2, c2, rows, cols) {
  const dr = r2 - r1, dc = c2 - c1;
  const len = Math.max(Math.abs(dr), Math.abs(dc));
  if (len === 0) return [{ r: r1, c: c1 }];

  let dirR = 0, dirC = 0;
  if (Math.abs(dr) >= Math.abs(dc)) {
    dirR = dr > 0 ? 1 : -1;
    if (Math.abs(dc) >= Math.abs(dr) * 0.5) dirC = dc > 0 ? 1 : -1;
  } else {
    dirC = dc > 0 ? 1 : -1;
    if (Math.abs(dr) >= Math.abs(dc) * 0.5) dirR = dr > 0 ? 1 : -1;
  }

  const cells = [];
  for (let i = 0; i <= len; i++) {
    const r = r1 + dirR * i, c = c1 + dirC * i;
    if (r >= 0 && r < rows && c >= 0 && c < cols) cells.push({ r, c });
  }
  return cells;
}

export function useFilvordy(rows = 14, cols = 16) {
  const [puzzleSet, setPuzzleSetState] = useState('kyrgyz_particles');

  const [grid, setGrid] = useState(() =>
    generateGrid([...new Set(PUZZLE_SETS.kyrgyz_particles.words)], rows, cols)
  );
  const [words, setWords] = useState([...new Set(PUZZLE_SETS.kyrgyz_particles.words)]);
  const [foundWords, setFoundWords] = useState(new Set());
  const [dragStart, setDragStart] = useState(null);   // {r,c} – for render
  const [dragEnd, setDragEnd] = useState(null);   // {r,c} – for render
  const [flashError, setFlashError] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Mutable refs – always up-to-date, safe inside event handlers
  const isDragging = useRef(false);
  const startRef = useRef(null);
  const endRef = useRef(null);
  const gridRef = useRef(grid);
  const wordsRef = useRef(words);
  const foundRef = useRef(foundWords);
  gridRef.current = grid;
  wordsRef.current = words;
  foundRef.current = foundWords;

  const timerRef = useRef(null);
  useEffect(() => {
    if (isRunning && !isWon) {
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, isWon]);

  useEffect(() => {
    if (foundWords.size > 0 && foundWords.size === words.length) {
      clearInterval(timerRef.current);
      setIsRunning(false);
      setTimeout(() => {
        playWin();
        setIsWon(true);
      }, 200);
    }
  }, [foundWords.size, words.length]);

  // Derived selection line for rendering
  const selectedCells = dragStart && dragEnd
    ? calcLine(dragStart.r, dragStart.c, dragEnd.r, dragEnd.c, rows, cols)
    : (dragStart ? [dragStart] : []);
  const selectedKey = new Set(selectedCells.map(c => `${c.r},${c.c}`));

  // Play tick sound when drag length changes
  const numSelected = selectedCells.length;
  useEffect(() => {
    if (isDragging.current && numSelected > 0) {
      playTick();
    }
  }, [numSelected]);

  // Found-word highlighted cells
  const foundCellKeys = new Set();
  words.forEach((_, wi) => {
    if (foundWords.has(wi)) {
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          if (grid[r][c].wordIndex === wi) foundCellKeys.add(`${r},${c}`);
    }
  });

  const resetPuzzle = useCallback((set, newWords) => {
    clearInterval(timerRef.current);
    const rawWords = newWords || PUZZLE_SETS[set]?.words || [];
    const w = [...new Set(rawWords)];
    setGrid(generateGrid(w, rows, cols));
    setWords(w);
    setFoundWords(new Set());
    setDragStart(null);
    setDragEnd(null);
    setIsWon(false);
    setTime(0);
    setIsRunning(false);
    isDragging.current = false;
    startRef.current = null;
    endRef.current = null;
  }, [rows, cols]);

  const newPuzzle = useCallback((set) => {
    const s = set || puzzleSet;
    setPuzzleSetState(s);
    resetPuzzle(s);
  }, [puzzleSet, resetPuzzle]);

  const startSelect = useCallback((r, c) => {
    isDragging.current = true;
    startRef.current = { r, c };
    endRef.current = { r, c };
    setDragStart({ r, c });
    setDragEnd({ r, c });
    setIsRunning(true);
  }, []);

  const moveSelect = useCallback((r, c) => {
    if (!isDragging.current) return;
    endRef.current = { r, c };
    setDragEnd({ r, c });
  }, []);

  const endSelect = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const s = startRef.current;
    const e = endRef.current;
    if (!s) { setDragStart(null); setDragEnd(null); return; }

    const cells = calcLine(s.r, s.c, e?.r ?? s.r, e?.c ?? s.c, rows, cols);
    const selected = cells.map(({ r, c }) => gridRef.current[r][c].letter).join('');
    const reversed = [...selected].reverse().join('');

    let matched = -1;
    for (let i = 0; i < wordsRef.current.length; i++) {
      const w = wordsRef.current[i].toUpperCase();
      if ((w === selected || w === reversed) && !foundRef.current.has(i)) {
        matched = i; break;
      }
    }

    if (matched !== -1) {
      playMatch();
      setFoundWords(prev => new Set([...prev, matched]));
    } else if (cells.length > 1) {
      playError();
      setFlashError(true);
      setTimeout(() => setFlashError(false), 500);
    }

    setDragStart(null);
    setDragEnd(null);
    startRef.current = null;
    endRef.current = null;
  }, [rows, cols]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return {
    grid, words, foundWords, rows, cols,
    selectedKey, foundCellKeys,
    flashError,
    puzzleSet,
    puzzleSets: PUZZLE_SETS,
    isWon, time, formatTime,
    startSelect, moveSelect, endSelect,
    newPuzzle,
    setPuzzleSet: (s) => newPuzzle(s),
  };
}
