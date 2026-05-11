import { useEffect, useRef, useState, useCallback } from 'react';

export function useHandTracking(skelCanvasRef) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('STANDBY'); // STANDBY | LOADING | TRACKING | NO_HAND | ERROR
  const fingerNormRef = useRef({ x: -1, y: -1 });
  const handDetectedRef = useRef(false);
  const cameraRef = useRef(null);

  const start = useCallback(async () => {
    setStatus('LOADING');
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
    } catch (e) {
      setStatus('ERROR');
      return false;
    }

    const video = videoRef.current;
    video.srcObject = stream;
    await video.play();

    if (typeof window.Hands === 'undefined') {
      setStatus('ERROR');
      return false;
    }

    const hands = new window.Hands({
      locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${f}`,
    });
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(results => {
      const sc = skelCanvasRef.current;
      if (sc) {
        const sCtx = sc.getContext('2d');
        sCtx.clearRect(0, 0, sc.width, sc.height);
      }

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const lm = results.multiHandLandmarks[0];

        // 스켈레톤 그리기
        const sc = skelCanvasRef.current;
        if (sc && typeof window.drawConnectors !== 'undefined') {
          const sCtx = sc.getContext('2d');
          window.drawConnectors(sCtx, lm, window.HAND_CONNECTIONS, { color: 'rgba(0,229,255,0.7)', lineWidth: 1.5 });
          window.drawLandmarks(sCtx, lm, { color: '#00ff88', lineWidth: 1, radius: 2 });
        }

        const tip = lm[8]; // index finger tip
        fingerNormRef.current = { x: 1 - tip.x, y: tip.y }; // mirror X
        handDetectedRef.current = true;
        setStatus('TRACKING');
      } else {
        handDetectedRef.current = false;
        fingerNormRef.current = { x: -1, y: -1 };
        setStatus('NO_HAND');
      }
    });

    const camera = new window.Camera(video, {
      onFrame: async () => { await hands.send({ image: video }); },
      width: 1280, height: 720,
    });
    await camera.start();
    cameraRef.current = camera;
    return true;
  }, [skelCanvasRef]);

  return { videoRef, fingerNormRef, handDetectedRef, status, start };
}
