import { forwardRef } from 'react';

export const CameraView = forwardRef(function CameraView({ skelCanvasRef, status }, videoRef) {
  const isActive = status === 'TRACKING' || status === 'NO_HAND';
  const dotColor = status === 'TRACKING' ? '#00ff88' : '#ff9800';

  return (
    <div style={{
      position: 'absolute', bottom: 16, right: 16,
      width: 180, height: 130,
      border: '2px solid rgba(0,229,255,0.6)',
      borderRadius: 4, overflow: 'hidden',
      background: '#000', zIndex: 20,
    }}>
      <video
        ref={videoRef}
        playsInline muted
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)',
          display: 'block',
        }}
      />
      <canvas
        ref={skelCanvasRef}
        width={180} height={130}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: 180, height: 130,
          transform: 'scaleX(-1)',
          pointerEvents: 'none',
        }}
      />
      {/* 라벨 */}
      <div style={{
        position: 'absolute', bottom: 4, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between',
        padding: '0 6px',
        fontFamily: '"Courier New", monospace',
        fontSize: 8, letterSpacing: 1,
        pointerEvents: 'none',
      }}>
        <span style={{ color: 'rgba(0,229,255,0.5)' }}>CAM FEED</span>
        <span style={{ color: dotColor }}>● {status}</span>
      </div>
      {/* 오프라인 오버레이 */}
      {!isActive && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.8)',
          color: 'rgba(0,229,255,0.6)',
          fontFamily: '"Courier New", monospace',
          fontSize: 9, letterSpacing: 1, textAlign: 'center', lineHeight: 2,
        }}>
          CAMERA<br/>OFFLINE
        </div>
      )}
    </div>
  );
});
