import { useEffect, useState } from 'react';

export function FlashOverlay({ penaltyFlash, celebrateFlash }) {
  const [penaltyOpacity, setPenaltyOpacity] = useState(0);
  const [celebrateOpacity, setCelebrateOpacity] = useState(0);

  useEffect(() => {
    if (!penaltyFlash) return;
    setPenaltyOpacity(1);
    const t = setTimeout(() => setPenaltyOpacity(0), 150);
    return () => clearTimeout(t);
  }, [penaltyFlash]);

  useEffect(() => {
    if (!celebrateFlash) return;
    setCelebrateOpacity(1);
    const t = setTimeout(() => setCelebrateOpacity(0), 220);
    return () => clearTimeout(t);
  }, [celebrateFlash]);

  return (
    <>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 45,
        background: 'rgba(255,0,0,0.22)',
        opacity: penaltyOpacity, transition: 'opacity 0.06s',
      }} />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 45,
        background: 'rgba(255,220,0,0.07)',
        opacity: celebrateOpacity, transition: 'opacity 0.1s',
      }} />
    </>
  );
}
