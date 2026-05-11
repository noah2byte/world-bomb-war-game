import { COUNTRIES } from '../data/countries.js';

// ── 지도 배경 ─────────────────────────────────────────────
export function drawMap(ctx, W, H, destroyedCountries, celebrating, globalTime) {
  const og = ctx.createLinearGradient(0, 0, 0, H);
  og.addColorStop(0, '#010d1e'); og.addColorStop(1, '#020b18');
  ctx.fillStyle = og; ctx.fillRect(0, 0, W, H);

  // 격자
  ctx.strokeStyle = 'rgba(0,229,255,0.04)'; ctx.lineWidth = 0.5;
  for (let i = 0; i <= 18; i++) { const x = i/18*W; ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let i = 0; i <= 9;  i++) { const y = i/9*H;  ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // 적도
  ctx.strokeStyle = 'rgba(0,229,255,0.09)'; ctx.lineWidth = 1;
  ctx.setLineDash([6, 8]);
  ctx.beginPath(); ctx.moveTo(0, H*0.5); ctx.lineTo(W, H*0.5); ctx.stroke();
  ctx.setLineDash([]);

  // 대륙명
  [['NORTH AMERICA',0.16,0.16],['SOUTH AMERICA',0.26,0.44],
   ['EUROPE',0.49,0.15],['AFRICA',0.50,0.37],
   ['ASIA',0.68,0.17],['OCEANIA',0.79,0.62]].forEach(([t,x,y]) => {
    ctx.fillStyle = 'rgba(0,229,255,0.055)';
    ctx.font = `bold ${Math.max(9, W*0.011)}px Courier New`;
    ctx.textAlign = 'center';
    ctx.fillText(t, x*W, y*H);
  });

  // 나라
  COUNTRIES.forEach(c => {
    const state = destroyedCountries.has(c.name) ? 'destroyed'
                : celebrating.has(c.name) ? 'celebrating' : null;
    drawCountry(ctx, W, H, c, state);
  });

  // 축하 오버레이
  celebrating.forEach((t, name) => {
    const c = COUNTRIES.find(x => x.name === name); if (!c) return;
    ctx.save(); ctx.translate(c.cx*W, c.cy*H);
    ctx.globalAlpha = Math.min(1, t/80);
    ctx.font = `${Math.max(20, W*0.025)}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText(c.emoji, 0, -Math.max(28, W*0.03));
    ctx.globalAlpha = 1;
    ctx.restore();
  });
}

function drawCountry(ctx, W, H, c, state) {
  const x = c.cx*W, y = c.cy*H;
  const rx = Math.max(20, W*0.024), ry = rx*0.6;
  const seed = c.name.length + c.name.charCodeAt(0);

  ctx.save(); ctx.translate(x, y);
  ctx.shadowBlur = state==='celebrating' ? 22 : state==='destroyed' ? 0 : 7;
  ctx.shadowColor = state==='celebrating' ? 'rgba(0,255,100,0.55)' : 'rgba(0,150,255,0.22)';

  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = i/8*Math.PI*2;
    const r = 1 + 0.35*Math.sin(a*3+seed)*Math.cos(a*2+seed*0.4);
    const px = Math.cos(a)*rx*r, py = Math.sin(a)*ry*r;
    i===0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py);
  }
  ctx.closePath();

  if (state==='destroyed')        { ctx.fillStyle='rgba(255,30,0,0.10)';   ctx.strokeStyle='rgba(255,60,0,0.22)'; }
  else if (state==='celebrating') { ctx.fillStyle='rgba(0,255,120,0.22)';  ctx.strokeStyle='rgba(0,255,120,0.75)'; }
  else {
    const hues = ['#0d2a45','#0d3a25','#2a1a0a','#1a1a2a','#0a2a1a','#2a0a0a'];
    ctx.fillStyle = hues[seed%hues.length]; ctx.strokeStyle = 'rgba(0,229,255,0.28)';
  }
  ctx.lineWidth = state==='celebrating' ? 2.5 : 1;
  ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;

  ctx.fillStyle = state==='celebrating' ? 'rgba(0,255,120,0.9)'
                : state==='destroyed'   ? 'rgba(255,60,0,0.5)'
                : 'rgba(0,229,255,0.42)';
  ctx.font = `${Math.max(7, W*0.0072)}px Courier New`;
  ctx.textAlign = 'center';
  ctx.fillText(state==='destroyed' ? '✕ '+c.name : c.name, 0, ry+11);
  ctx.restore();
}

// ── 폭탄 ─────────────────────────────────────────────────
export function drawBomb(ctx, W, H, b, globalTime) {
  const px = b.x*W + Math.sin(b.wobble)*2.5;
  const py = b.y*H + Math.cos(b.wobble*0.8)*2;
  const r = Math.max(14, W*0.019);

  ctx.save(); ctx.translate(px, py);

  if (b.isChain) {
    b.chainPulse = (b.chainPulse||0) + 0.12;
    const cp = 0.5+0.5*Math.sin(b.chainPulse);
    ctx.beginPath(); ctx.arc(0,0,r+14+cp*5,0,Math.PI*2);
    ctx.strokeStyle = `rgba(255,160,0,${0.3+cp*0.35})`; ctx.lineWidth=2.5; ctx.stroke();
    ctx.fillStyle = `rgba(255,180,0,${0.6+cp*0.4})`;
    ctx.font = `bold ${Math.max(7,W*0.007)}px Courier New`; ctx.textAlign='center';
    ctx.fillText('⚡CHAIN', 0, -r-18);
  }

  if (b.fuse < 0.35) {
    const p = 0.5+0.5*Math.sin(globalTime*0.3);
    ctx.beginPath(); ctx.arc(0,0,r+12+p*6,0,Math.PI*2);
    ctx.fillStyle = `rgba(255,0,0,${0.06+p*0.1})`; ctx.fill();
  }

  ctx.beginPath(); ctx.ellipse(2,r*0.78,r*0.68,r*0.17,0,0,Math.PI*2);
  ctx.fillStyle='rgba(0,0,0,0.38)'; ctx.fill();

  ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2);
  const bg = ctx.createRadialGradient(-r*0.25,-r*0.25,r*0.1,0,0,r);
  bg.addColorStop(0, b.isChain?'#3a2a00':'#3a3a3a');
  bg.addColorStop(1, b.isChain?'#1a0e00':'#111');
  ctx.fillStyle=bg; ctx.fill();
  ctx.strokeStyle=b.isChain?'#aa6600':'#555'; ctx.lineWidth=1.5; ctx.stroke();

  ctx.beginPath(); ctx.arc(-r*0.28,-r*0.28,r*0.22,0,Math.PI*2);
  ctx.fillStyle='rgba(255,255,255,0.07)'; ctx.fill();

  ctx.strokeStyle='#8b6914'; ctx.lineWidth=2; ctx.lineCap='round';
  const fl = r*0.9*b.fuse;
  ctx.beginPath(); ctx.moveTo(r*0.22,-r); ctx.quadraticCurveTo(r*0.75,-r-r*0.4,r*0.6,-r-fl); ctx.stroke();

  if (b.fuse>0.04) {
    const f = 0.6+Math.random()*0.4;
    ctx.beginPath(); ctx.arc(r*0.6,-r-fl,3.5,0,Math.PI*2);
    ctx.fillStyle=`rgba(255,${Math.floor(160*f)},0,${f})`; ctx.fill();
    ctx.beginPath(); ctx.arc(r*0.6,-r-fl,1.5,0,Math.PI*2);
    ctx.fillStyle='rgba(255,240,180,0.95)'; ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(0,0,r+5,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-b.fuse));
  ctx.strokeStyle = b.fuse>0.5?'#00e5ff':b.fuse>0.25?'#ff9800':'#ff2200';
  ctx.lineWidth=3.5; ctx.lineCap='round'; ctx.stroke();

  ctx.font=`${r*0.88}px serif`; ctx.textAlign='center';
  ctx.fillText(b.country.emoji, 0, r*0.32);
  ctx.restore();
}

// ── 미사일 ────────────────────────────────────────────────
export function drawMissiles(ctx, W, H, missiles) {
  missiles.forEach(m => {
    if (m.trail.length < 2) return;
    ctx.save();
    ctx.beginPath();
    m.trail.forEach((p,i) => i===0 ? ctx.moveTo(p.x*W, p.y*H) : ctx.lineTo(p.x*W, p.y*H));
    ctx.strokeStyle='rgba(255,140,0,0.6)'; ctx.lineWidth=2; ctx.lineCap='round'; ctx.stroke();

    if (!m.done && m.headX!==undefined) {
      const hx=m.headX*W, hy=m.headY*H;
      ctx.beginPath(); ctx.arc(hx,hy,7,0,Math.PI*2);
      ctx.fillStyle='rgba(255,80,0,0.4)'; ctx.fill();
      ctx.beginPath(); ctx.arc(hx,hy,4,0,Math.PI*2);
      ctx.fillStyle='#ffaa00'; ctx.fill();
      ctx.beginPath(); ctx.arc(hx,hy,1.5,0,Math.PI*2);
      ctx.fillStyle='#fff'; ctx.fill();
    }
    if (!m.done) {
      const tx=m.tx*W, ty=m.ty*H;
      ctx.strokeStyle='rgba(255,80,0,0.35)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(tx-12,ty); ctx.lineTo(tx+12,ty); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tx,ty-12); ctx.lineTo(tx,ty+12); ctx.stroke();
      ctx.beginPath(); ctx.arc(tx,ty,16,0,Math.PI*2);
      ctx.strokeStyle='rgba(255,80,0,0.2)'; ctx.stroke();
    }
    ctx.restore();
  });
}

// ── 파티클/이펙트 ─────────────────────────────────────────
export function drawExplosions(ctx, W, H, explosions) {
  explosions.forEach(e => {
    ctx.beginPath(); ctx.arc(e.x*W, e.y*H, e.r*W, 0, Math.PI*2);
    ctx.fillStyle=`rgba(255,${Math.floor(80*(1-e.life))},0,${e.life*0.38})`; ctx.fill();
    ctx.beginPath(); ctx.arc(e.x*W, e.y*H, e.r*W*0.42, 0, Math.PI*2);
    ctx.fillStyle=`rgba(255,220,80,${e.life*0.55})`; ctx.fill();
  });
}

export function drawParticles(ctx, W, H, particles) {
  particles.forEach(p => {
    ctx.beginPath(); ctx.arc(p.x*W, p.y*H, p.r*p.life, 0, Math.PI*2);
    ctx.fillStyle=p.color; ctx.globalAlpha=p.life; ctx.fill(); ctx.globalAlpha=1;
  });
}

export function drawConfetti(ctx, W, H, confetti) {
  confetti.forEach(p => {
    ctx.save(); ctx.translate(p.x*W, p.y*H); ctx.rotate(p.rot);
    ctx.globalAlpha=p.life; ctx.fillStyle=p.color;
    p.rect
      ? ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*0.5)
      : (ctx.beginPath(), ctx.arc(0,0,p.r/2,0,Math.PI*2), ctx.fill());
    ctx.globalAlpha=1; ctx.restore();
  });
}

export function drawCrowdPeople(ctx, W, H, crowdPeople) {
  crowdPeople.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.life;
    const bOffset = Math.sin(p.bounce) * 4;
    const size = Math.max(14, W*0.018) * p.life;
    ctx.font = `${size}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText(p.emoji, p.x*W, p.y*H + bOffset);
    ctx.restore();
  });
}

export function drawFloatingTexts(ctx, W, H, floatingTexts) {
  floatingTexts.forEach(t => {
    ctx.save();
    ctx.globalAlpha = Math.min(1, t.life*2);
    ctx.fillStyle = t.color;
    ctx.font = `bold ${t.size}px Courier New`;
    ctx.textAlign = 'center';
    ctx.shadowBlur = 10; ctx.shadowColor = t.color;
    ctx.fillText(t.text, t.x*W, t.y*H);
    ctx.shadowBlur = 0;
    ctx.restore();
  });
}

// ── 손가락 커서 ───────────────────────────────────────────
export function drawCursor(ctx, W, H, fingerNorm, handDetected, bombs, globalTime) {
  if (!handDetected || fingerNorm.x < 0) return;
  const fx = fingerNorm.x*W, fy = fingerNorm.y*H;

  ctx.beginPath(); ctx.arc(fx, fy, 22, 0, Math.PI*2);
  ctx.strokeStyle='rgba(0,255,136,0.9)'; ctx.lineWidth=2.5; ctx.stroke();
  ctx.beginPath(); ctx.arc(fx, fy, 5, 0, Math.PI*2);
  ctx.fillStyle='rgba(0,255,136,0.85)'; ctx.fill();

  [[0,-32,0,-24],[0,32,0,24],[-32,0,-24,0],[32,0,24,0]].forEach(([x1,y1,x2,y2]) => {
    ctx.beginPath(); ctx.moveTo(fx+x1,fy+y1); ctx.lineTo(fx+x2,fy+y2);
    ctx.strokeStyle='rgba(0,255,136,0.35)'; ctx.lineWidth=1.5; ctx.stroke();
  });

  const near = bombs.some(b => {
    const dx = fingerNorm.x - b.x, dy = fingerNorm.y - b.y;
    return Math.sqrt(dx*dx+dy*dy) < 0.045;
  });
  if (near) {
    ctx.beginPath(); ctx.arc(fx, fy, 32+Math.sin(globalTime*0.28)*5, 0, Math.PI*2);
    ctx.strokeStyle='rgba(255,255,0,0.45)'; ctx.lineWidth=1.5; ctx.stroke();
  }
}
