let ac = null;

function getAC() {
  if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
  return ac;
}

export function initAudio() {
  try { getAC(); } catch (e) {}
}

export function playCrowdCheer() {
  try {
    const a = getAC();
    const bufLen = a.sampleRate * 1.2;
    const buf = a.createBuffer(2, bufLen, a.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < bufLen; i++) {
        const env = Math.min(i / (a.sampleRate * 0.05), 1) * Math.pow(1 - i / bufLen, 0.4);
        d[i] = (Math.random() * 2 - 1) * env * 0.6;
      }
    }
    const src = a.createBufferSource(); src.buffer = buf;
    const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1200; bp.Q.value = 0.8;
    const bp2 = a.createBiquadFilter(); bp2.type = 'bandpass'; bp2.frequency.value = 600; bp2.Q.value = 0.5;
    const gain = a.createGain();
    gain.gain.setValueAtTime(1.8, a.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 1.2);
    src.connect(bp); bp.connect(gain);
    src.connect(bp2); bp2.connect(gain);
    gain.connect(a.destination); src.start();
    [523, 659, 784, 1046].forEach((f, i) => {
      const o = a.createOscillator(), g = a.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.35, a.currentTime + i * 0.09);
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + i * 0.09 + 0.35);
      o.connect(g); g.connect(a.destination);
      o.start(a.currentTime + i * 0.09); o.stop(a.currentTime + i * 0.09 + 0.4);
    });
  } catch (e) {}
}

export function playExplode() {
  try {
    const a = getAC();
    const buf = a.createBuffer(1, a.sampleRate * 0.9, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 1.1);
    const src = a.createBufferSource(); src.buffer = buf;
    const g = a.createGain();
    g.gain.setValueAtTime(3.5, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.9);
    const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 250;
    src.connect(lp); lp.connect(g); g.connect(a.destination); src.start();
  } catch (e) {}
}

export function playMissileLaunch() {
  try {
    const a = getAC(), o = a.createOscillator(), g = a.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(400, a.currentTime);
    o.frequency.exponentialRampToValueAtTime(80, a.currentTime + 0.3);
    g.gain.setValueAtTime(0.4, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.3);
    o.connect(g); g.connect(a.destination);
    o.start(); o.stop(a.currentTime + 0.32);
  } catch (e) {}
}

export function playMissileHit() {
  try {
    const a = getAC();
    const buf = a.createBuffer(1, a.sampleRate * 0.25, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 0.8) * 0.5;
    const src = a.createBufferSource(); src.buffer = buf;
    const g = a.createGain();
    g.gain.setValueAtTime(1.5, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.25);
    src.connect(g); g.connect(a.destination); src.start();
  } catch (e) {}
}

export function playPenalty() {
  try {
    const a = getAC();
    [300, 200, 120].forEach((f, i) => {
      const o = a.createOscillator(), g = a.createGain();
      o.type = 'sawtooth'; o.frequency.value = f;
      g.gain.setValueAtTime(1.3, a.currentTime + i * 0.13);
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + i * 0.13 + 0.3);
      o.connect(g); g.connect(a.destination);
      o.start(a.currentTime + i * 0.13); o.stop(a.currentTime + i * 0.13 + 0.3);
    });
  } catch (e) {}
}

export function playGameOver() {
  try {
    const a = getAC();
    [440, 330, 220, 110].forEach((f, i) => {
      const o = a.createOscillator(), g = a.createGain();
      o.type = 'sawtooth'; o.frequency.value = f;
      g.gain.setValueAtTime(1.0, a.currentTime + i * 0.22);
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + i * 0.22 + 0.5);
      o.connect(g); g.connect(a.destination);
      o.start(a.currentTime + i * 0.22); o.stop(a.currentTime + i * 0.22 + 0.5);
    });
  } catch (e) {}
}
