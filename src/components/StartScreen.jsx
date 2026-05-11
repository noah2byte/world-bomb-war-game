export function StartScreen({ onStart }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 40,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.55)',
      fontFamily: '"Courier New", monospace',
    }}>
      <div style={{ fontSize: 28, letterSpacing: 6, color: '#00e5ff', marginBottom: 8 }}>
        J.A.R.V.I.S
      </div>
      <div style={{ fontSize: 12, letterSpacing: 3, color: 'rgba(0,229,255,0.5)', marginBottom: 40 }}>
        WORLD BOMB DEFENSE
      </div>
      <div style={{ fontSize: 11, color: 'rgba(0,229,255,0.4)', marginBottom: 8 }}>검지 손가락으로 폭탄을 터뜨리세요</div>
      <div style={{ fontSize: 10, color: 'rgba(0,229,255,0.3)', marginBottom: 40 }}>⚡CHAIN 폭탄은 연쇄 미사일을 발사합니다</div>
      <button
        onClick={onStart}
        style={{
          background: 'rgba(0,229,255,0.12)',
          border: '2px solid rgba(0,229,255,0.8)',
          color: '#00e5ff',
          fontFamily: '"Courier New", monospace',
          fontSize: 14, letterSpacing: 3,
          padding: '14px 40px', cursor: 'pointer',
        }}
      >
        ▶ 카메라 연동 + 미션 시작
      </button>
    </div>
  );
}
