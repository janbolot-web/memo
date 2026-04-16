import { useRef, useCallback } from 'react';

export function useSoundEffects() {
  const audioCtxRef = useRef(null);

  const initCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  const playTone = useCallback((freq, type, duration, vol, pitchSlide = 0) => {
    initCtx();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;
    
    // Frequency envelope
    osc.frequency.setValueAtTime(freq, now);
    if (pitchSlide) {
      osc.frequency.exponentialRampToValueAtTime(freq * pitchSlide, now + duration);
    }

    // Volume envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(vol, now + duration * 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.start(now);
    osc.stop(now + duration);
  }, [initCtx]);

  const playFlip = useCallback(() => {
    playTone(400, 'sine', 0.1, 0.2, 0.8);
  }, [playTone]);

  const playMatch = useCallback(() => {
    playTone(600, 'sine', 0.15, 0.1);
    setTimeout(() => {
      playTone(800, 'sine', 0.3, 0.15);
    }, 100);
  }, [playTone]);

  const playMismatch = useCallback(() => {
    playTone(200, 'sine', 0.2, 0.15, 0.8);
    setTimeout(() => {
      playTone(150, 'sine', 0.3, 0.15, 0.8);
    }, 150);
  }, [playTone]);

  const playWin = useCallback(() => {
    // Play a major chord arpeggio
    const chord = [392.00, 493.88, 587.33, 783.99]; // G4, B4, D5, G5
    chord.forEach((freq, i) => {
      setTimeout(() => {
        playTone(freq, 'sine', 0.6, 0.1);
      }, i * 150);
    });
  }, [playTone]);

  return { playFlip, playMatch, playMismatch, playWin };
}
