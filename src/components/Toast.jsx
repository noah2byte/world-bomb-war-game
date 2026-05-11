import { useEffect, useState } from 'react';

export function Toast({ message }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2800);
    return () => clearTimeout(t);
  }, [message]);

  return (
    <div style={{
      position: 'absolute', top: 62, left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,8,20,0.92)',
      border: '1px solid rgba(0,229,255,0.4)',
      color: '#00e5ff',
      fontFamily: '"Courier New", monospace',
      fontSize: 13, letterSpacing: 2,
      padding: '8px 22px', borderRadius: 3,
      zIndex: 35, pointerEvents: 'none',
      whiteSpace: 'nowrap',
      transition: 'opacity 0.2s',
      opacity: visible ? 1 : 0,
    }}>
      {message}
    </div>
  );
}
