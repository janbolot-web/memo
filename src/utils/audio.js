// Web Audio API for simple synthesized sounds
let audioCtx = null;

// Initialize context lazily on first user interaction to comply with browser policies
function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, type, duration, vol) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    console.warn("Audio not supported or disabled");
  }
}

export function playTick() {
  playTone(800, 'sine', 0.05, 0.05);
}

export function playMatch() {
  playTone(880, 'sine', 0.1, 0.1);
  setTimeout(() => playTone(1108, 'sine', 0.2, 0.1), 100);
}

export function playError() {
  playTone(150, 'sawtooth', 0.2, 0.1);
}

export function playWin() {
  [440, 554, 659, 880].forEach((f, i) => {
    setTimeout(() => playTone(f, 'sine', 0.2, 0.15), i * 150);
  });
}
