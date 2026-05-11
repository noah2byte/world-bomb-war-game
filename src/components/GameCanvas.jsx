import { useEffect, useRef } from 'react';
import {
  drawMap, drawBomb, drawMissiles,
  drawExplosions, drawParticles, drawConfetti,
  drawCrowdPeople, drawFloatingTexts, drawCursor,
} from '../game/renderer.js';

export function GameCanvas({ stateRef, fingerNormRef, handDetectedRef, onTick }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function loop() {
      const s = stateRef.current;
      const W = canvas.width, H = canvas.height;
      const ctx = canvas.getContext('2d');

      // 화면 흔들기
      let sx = 0, sy = 0;
      if (s.screenShake > 0) {
        sx = (Math.random() - 0.5) * s.screenShake;
        sy = (Math.random() - 0.5) * s.screenShake;
      }
      ctx.save();
      ctx.translate(sx, sy);

      // 그리기
      drawMap(ctx, W, H, s.destroyedCountries, s.celebrating, s.globalTime);
      drawMissiles(ctx, W, H, s.missiles);
      drawExplosions(ctx, W, H, s.explosions);
      drawParticles(ctx, W, H, s.particles);
      drawConfetti(ctx, W, H, s.confetti);
      drawCrowdPeople(ctx, W, H, s.crowdPeople);
      s.bombs.forEach(b => drawBomb(ctx, W, H, b, s.globalTime));
      drawFloatingTexts(ctx, W, H, s.floatingTexts);
      drawCursor(ctx, W, H, fingerNormRef.current, handDetectedRef.current, s.bombs, s.globalTime);

      ctx.restore();

      // 게임 로직 tick → App으로 콜백
      onTick();

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);  // mount once

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }}
    />
  );
}
