export function GameOver({ score, savedCount, lostCount, onRestart }) {
  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%,-50%)',
      textAlign: 'center',
      background: 'rgba(0,4,14,0.97)',
      border: '1px solid rgba(255,68,68,0.6)',
      padding: '50px 70px', borderRadius: 6, zIndex: 50,
      fontFamily: '"Courier New", monospace',
    }}>
      <h2 style={{ fontSize: 26, letterSpacing: 5, color: '#ff4444', marginBottom: 14 }}>
        WORLD DESTROYED
      </h2>
      <div style={{ fontSize: 14, color: 'rgba(0,229,255,0.8)', letterSpacing: 2, marginBottom: 8 }}>
        SCORE: {score}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,120,120,0.6)', letterSpacing: 1, marginBottom: 26 }}>
        SAVED: {savedCount} | DESTROYED: {lostCount}
      </div>
      <button
        onClick={onRestart}
        style={{
          background: 'rgba(0,229,255,0.12)',
          border: '1px solid rgba(0,229,255,0.6)',
          color: '#00e5ff',
          fontFamily: '"Courier New", monospace',
          fontSize: 12, letterSpacing: 3,
          padding: '12px 32px', cursor: 'pointer',
        }}
      >
        ▶ RESTART MISSION
      </button>
    </div>
  );
}
