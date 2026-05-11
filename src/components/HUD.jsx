export function HUD({ score, lives, savedCount, bombCount, status, time }) {
  const statusColor = {
    TRACKING: '#00ff88',
    NO_HAND:  '#ff9800',
    LOADING:  '#ff9800',
    ERROR:    '#ff4444',
    STANDBY:  '#ff9800',
  }[status] || '#ff9800';

  const hearts = Array.from({ length: Math.max(0, lives) }, () => '♥').join('') +
                 Array.from({ length: Math.max(0, 3 - lives) }, () => '♡').join('');

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 16px',
      background: 'rgba(0,8,20,0.85)',
      borderBottom: '1px solid rgba(0,229,255,0.2)',
      backdropFilter: 'blur(4px)',
      fontFamily: '"Courier New", monospace',
    }}>
      <div style={{ fontSize: 11, letterSpacing: 2, color: '#00e5ff' }}>
        🌍 WORLD DEFENSE &nbsp;
        <span style={{ fontSize: 9, color: statusColor }}>● {status}</span>
      </div>
      <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
        <span style={{ fontSize: 14, color: '#ff4444' }}>{hearts}</span>
        <span style={{ fontSize: 11, color: '#ff9800' }}>💣 {bombCount}</span>
        <span style={{ fontSize: 11, color: '#00ff88' }}>✓ {savedCount}</span>
        <span style={{ fontSize: 15, color: '#00ff88', fontWeight: 'bold' }}>SCORE: {score}</span>
        <span style={{ fontSize: 11, color: 'rgba(0,229,255,0.35)' }}>{time}</span>
      </div>
    </div>
  );
}
