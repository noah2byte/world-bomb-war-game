import { COUNTRIES, PEOPLE_EMOJIS, CONFETTI_COLORS } from '../data/countries.js';
import {
  playCrowdCheer, playExplode, playMissileLaunch, playMissileHit, playPenalty
} from '../audio/audioEngine.js';

let bombIdCounter = 0;

// ── 팩토리 ────────────────────────────────────────────────
export function createBomb(country, gen = 0, isChain = false, globalTime = 0) {
  const elapsed = globalTime / 60;
  const fuseTime = Math.max(3, 12 - elapsed * 0.07 - gen * 1.2);
  return {
    id: bombIdCounter++,
    country, gen, isChain,
    x: country.cx,   // 0~1 정규화 좌표
    y: country.cy,
    fuse: 1.0,
    fuseSpeed: 1 / (fuseTime * 60),
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.022 + Math.random() * 0.018,
    dead: false,
    chainPulse: 0,
  };
}

export function createMissile(fromBomb, targetCountry, gen) {
  return {
    sx: fromBomb.x, sy: fromBomb.y,
    tx: targetCountry.cx, ty: targetCountry.cy,
    t: 0,
    speed: 0.014 + Math.random() * 0.006,
    trail: [],
    targetCountry,
    gen,
    done: false,
    headX: fromBomb.x, headY: fromBomb.y,
  };
}

export function createConfetti(cx, cy) {
  const a = Math.random() * Math.PI * 2, sp = 2.5 + Math.random() * 6;
  return {
    x: cx, y: cy,
    vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 4,
    r: 3 + Math.random() * 4.5,
    life: 1.0, decay: 0.009 + Math.random() * 0.01,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rot: Math.random() * Math.PI * 2, rotV: (Math.random() - 0.5) * 0.28,
    rect: Math.random() < 0.5,
  };
}

export function createCrowdPerson(cx, cy, angle) {
  const sp = 1.8 + Math.random() * 3.5;
  return {
    x: cx + (Math.random() - 0.5) * 0.016,
    y: cy + (Math.random() - 0.5) * 0.016,
    vx: Math.cos(angle) * sp * 0.001,
    vy: Math.sin(angle) * sp * 0.001 - 0.0025,
    emoji: PEOPLE_EMOJIS[Math.floor(Math.random() * PEOPLE_EMOJIS.length)],
    life: 1.0, decay: 0.007 + Math.random() * 0.006,
    bounce: Math.random() * Math.PI * 2, bounceSpeed: 0.07 + Math.random() * 0.06,
  };
}

export function createParticle(cx, cy, angle) {
  const sp = 2 + Math.random() * 6;
  return {
    x: cx, y: cy,
    vx: Math.cos(angle) * sp * 0.001,
    vy: Math.sin(angle) * sp * 0.001,
    life: 1.0, decay: 0.014 + Math.random() * 0.014,
    r: 2.5 + Math.random() * 4,
    color: ['#ff6600','#ffcc00','#ff3300','#ff8800','#ffee00'][Math.floor(Math.random() * 5)],
  };
}

export function createExplosion(cx, cy, big = false) {
  return {
    x: cx, y: cy, r: 0.005,
    maxR: big ? 0.08 : 0.04,
    life: 1.0,
  };
}

export function createFloatingText(x, y, text, color = '#00ff88', size = 14) {
  return { x, y, text, color, life: 1.0, vy: -0.0022, size };
}

// ── 연쇄 미사일 발사 ──────────────────────────────────────
export function launchMissiles(state, fromBomb, count) {
  const targets = COUNTRIES
    .filter(c =>
      c.name !== fromBomb.country.name &&
      !state.destroyedCountries.has(c.name) &&
      !state.bombs.some(b => b.country.name === c.name)
    )
    .sort(() => Math.random() - 0.5)
    .slice(0, count);

  targets.forEach(tc => {
    state.missiles.push(createMissile(fromBomb, tc, fromBomb.gen + 1));
    playMissileLaunch();
  });
}

// ── 초기 상태 ─────────────────────────────────────────────
export function createInitialState() {
  return {
    bombs: [],
    missiles: [],
    explosions: [],
    particles: [],
    confetti: [],
    crowdPeople: [],
    floatingTexts: [],
    destroyedCountries: new Set(),
    celebrating: new Map(),   // name → timer
    score: 0,
    lives: 3,
    savedCount: 0,
    lostCount: 0,
    spawnTimer: 0,
    globalTime: 0,
    screenShake: 0,
    gameActive: false,
    gameOver: false,
  };
}

// ── 메인 업데이트 (순수 mutation, rafLoop에서 호출) ───────
export function tickGame(state, fingerNorm, handDetected) {
  if (!state.gameActive) return;
  state.globalTime++;
  if (state.screenShake > 0) state.screenShake *= 0.8;

  // 폭탄 생성 (무한 증식)
  const elapsed = state.globalTime / 60;
  const interval = Math.max(40, 180 - elapsed * 2.2);
  state.spawnTimer++;
  if (state.spawnTimer >= interval) {
    const avail = COUNTRIES.filter(c =>
      !state.destroyedCountries.has(c.name) &&
      !state.bombs.some(b => b.country.name === c.name)
    );
    if (avail.length > 0) {
      const c = avail[Math.floor(Math.random() * avail.length)];
      const isChain = Math.random() < 0.20;
      state.bombs.push(createBomb(c, 0, isChain, state.globalTime));
    }
    state.spawnTimer = 0;
  }

  // 폭탄 업데이트
  state.bombs.forEach(b => {
    if (b.dead) return;
    b.wobble += b.wobbleSpeed;
    b.fuse -= b.fuseSpeed;

    // 손가락 충돌 (정규화 좌표끼리 비교)
    if (handDetected) {
      const threshold = 0.032;
      const dx = fingerNorm.x - b.x;
      const dy = fingerNorm.y - b.y;
      if (Math.sqrt(dx * dx + dy * dy) < threshold) {
        b.dead = true;
        playCrowdCheer();

        // 군중
        for (let i = 0; i < 24; i++) {
          const angle = (i / 24) * Math.PI * 2 + Math.random() * 0.5;
          state.crowdPeople.push(createCrowdPerson(b.x, b.y, angle));
        }
        // 컨페티
        for (let i = 0; i < 80; i++) state.confetti.push(createConfetti(b.x, b.y));

        const pts = 120 + Math.floor(b.fuse * 80) + (b.isChain ? 60 : 0);
        state.score += pts;
        state.savedCount++;
        state.lives = Math.min(state.lives + 1, 9);
        state.celebrating.set(b.country.name, 200);
        state.floatingTexts.push(createFloatingText(b.x, b.y - 0.06, '🎉 SAVED! +' + pts, '#ffdd00', 15));

        // 연쇄 미사일
        if (b.isChain) {
          launchMissiles(state, b, 3 + Math.floor(Math.random() * 3));
          state.floatingTexts.push(createFloatingText(b.x, b.y - 0.11, '⚡ CHAIN REACTION!', '#ffaa00', 13));
        } else if (Math.random() < 0.30) {
          launchMissiles(state, b, 2 + Math.floor(Math.random() * 2));
        }
      }
    }

    // 퓨즈 소진
    if (b.fuse <= 0) {
      b.dead = true;
      playExplode(); playPenalty();
      for (let i = 0; i < 55; i++) {
        state.particles.push(createParticle(b.x, b.y, (i / 55) * Math.PI * 2 + Math.random() * 0.4));
      }
      state.explosions.push(createExplosion(b.x, b.y, true));
      state.screenShake = 24;

      const pen = 100 + state.lostCount * 25;
      state.score = Math.max(0, state.score - pen);
      state.lives--;
      state.lostCount++;
      state.destroyedCountries.add(b.country.name);
      state.floatingTexts.push(createFloatingText(b.x, b.y - 0.05, '💥 -' + pen, '#ff2200', 18));

      // 연쇄 미사일
      const chainCount = b.isChain
        ? 4 + Math.floor(Math.random() * 3)
        : 2 + Math.floor(Math.random() * 2);
      launchMissiles(state, b, chainCount);

      if (state.lives <= 0) {
        state.gameActive = false;
        state.gameOver = true;
      }
    }
  });
  state.bombs = state.bombs.filter(b => !b.dead);

  // 미사일 업데이트
  state.missiles.forEach(m => {
    if (m.done) return;
    m.t = Math.min(1, m.t + m.speed);
    const tt = m.t;
    const cx = m.sx + (m.tx - m.sx) * tt;
    const cy = m.sy + (m.ty - m.sy) * tt - Math.sin(tt * Math.PI) * 0.18;
    m.headX = cx; m.headY = cy;
    m.trail.push({ x: cx, y: cy });
    if (m.trail.length > 30) m.trail.shift();

    if (m.t >= 1) {
      m.done = true;
      playMissileHit();
      state.screenShake = Math.max(state.screenShake, 8);
      state.explosions.push(createExplosion(m.tx, m.ty, false));
      // 도착 나라에 새 폭탄
      const alreadyHas = state.bombs.some(b => b.country.name === m.targetCountry.name);
      if (!alreadyHas && !state.destroyedCountries.has(m.targetCountry.name)) {
        state.bombs.push(createBomb(m.targetCountry, m.gen, false, state.globalTime));
      }
    }
  });
  // done 미사일 trail 소멸 후 제거
  state.missiles.forEach(m => { if (m.done && m.trail.length > 0) m.trail.shift(); });
  state.missiles = state.missiles.filter(m => !(m.done && m.trail.length === 0));

  // 축하 타이머
  state.celebrating.forEach((t, n) => {
    state.celebrating.set(n, t - 1);
    if (t <= 1) state.celebrating.delete(n);
  });

  // 파티클
  state.explosions.forEach(e => { e.r += (e.maxR - e.r) * 0.09; e.life -= 0.042; });
  state.explosions = state.explosions.filter(e => e.life > 0);
  state.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.00008; p.life -= p.decay; });
  state.particles = state.particles.filter(p => p.life > 0);
  state.confetti.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.00012; p.vx *= 0.98; p.rot += p.rotV; p.life -= p.decay; });
  state.confetti = state.confetti.filter(p => p.life > 0);
  state.crowdPeople.forEach(p => { p.x += p.vx; p.y += p.vy; p.vx *= 0.93; p.vy += 0.00006; p.bounce += p.bounceSpeed; p.life -= p.decay; });
  state.crowdPeople = state.crowdPeople.filter(p => p.life > 0);
  state.floatingTexts.forEach(t => { t.y += t.vy; t.vy *= 0.97; t.life -= 0.016; });
  state.floatingTexts = state.floatingTexts.filter(t => t.life > 0);
}

// ── 리셋 ──────────────────────────────────────────────────
export function resetState(state) {
  Object.assign(state, createInitialState());
  state.gameActive = true;
  // 초기 폭탄 5개
  const avail = [...COUNTRIES].sort(() => Math.random() - 0.5).slice(0, 5);
  avail.forEach(c => state.bombs.push(createBomb(c, 0, false, 0)));
}
