import { useRef, useState, useCallback, useEffect } from 'react';
import { GameCanvas }    from './components/GameCanvas.jsx';
import { CameraView }    from './components/CameraView.jsx';
import { HUD }           from './components/HUD.jsx';
import { GameOver }      from './components/GameOver.jsx';
import { StartScreen }   from './components/StartScreen.jsx';
import { Toast }         from './components/Toast.jsx';
import { FlashOverlay }  from './components/FlashOverlay.jsx';
import { useHandTracking } from './hooks/useHandTracking.js';
import { tickGame, createInitialState, resetState } from './game/gameEngine.js';
import { initAudio, playGameOver } from './audio/audioEngine.js';

export default function App() {
  const stateRef = useRef(createInitialState());

  const [uiState, setUiState] = useState({
    score: 0, lives: 3, savedCount: 0, bombCount: 0,
    gameOver: false, started: false,
    penaltyFlash: 0, celebrateFlash: 0,
    toast: '',
  });
  const [clock, setClock] = useState('--:--:--');

  useEffect(() => {
    const id = setInterval(() => setClock(new Date().toTimeString().slice(0,8)), 1000);
    return () => clearInterval(id);
  }, []);

  const skelCanvasRef = useRef(null);
  const { videoRef, fingerNormRef, handDetectedRef, status, start } = useHandTracking(skelCanvasRef);

  const prevLivesRef    = useRef(3);
  const prevScoreRef    = useRef(0);
  const prevSavedRef    = useRef(0);
  const prevGameOverRef = useRef(false);
  const prevBombCountRef = useRef(0);

  const onTick = useCallback(() => {
    const s = stateRef.current;
    tickGame(s, fingerNormRef.current, handDetectedRef.current);

    const changed =
      s.score      !== prevScoreRef.current    ||
      s.lives      !== prevLivesRef.current    ||
      s.savedCount !== prevSavedRef.current    ||
      s.gameOver   !== prevGameOverRef.current ||
      s.bombs.length !== prevBombCountRef.current;

    if (changed) {
      if (s.gameOver && !prevGameOverRef.current) playGameOver();

      const penaltyFlash   = s.lives    < prevLivesRef.current  ? Date.now() : 0;
      const celebrateFlash = s.savedCount > prevSavedRef.current ? Date.now() : 0;
      const toast = s._toast || '';
      s._toast = '';

      prevScoreRef.current    = s.score;
      prevLivesRef.current    = s.lives;
      prevSavedRef.current    = s.savedCount;
      prevGameOverRef.current = s.gameOver;
      prevBombCountRef.current = s.bombs.length;

      setUiState(prev => ({
        ...prev,
        score:       s.score,
        lives:       s.lives,
        savedCount:  s.savedCount,
        bombCount:   s.bombs.length,
        gameOver:    s.gameOver,
        penaltyFlash:   penaltyFlash   || prev.penaltyFlash,
        celebrateFlash: celebrateFlash || prev.celebrateFlash,
        toast: toast || prev.toast,
      }));
    }
  }, [fingerNormRef, handDetectedRef]);

  const handleStart = useCallback(async () => {
    initAudio();
    const ok = await start();
    if (!ok) { alert('카메라 권한이 필요합니다.'); return; }
    resetState(stateRef.current);
    prevLivesRef.current = prevScoreRef.current = prevSavedRef.current = 0;
    prevGameOverRef.current = false;
    prevBombCountRef.current = 0;
    setUiState(prev => ({ ...prev, started: true, gameOver: false, score: 0, lives: 3, savedCount: 0, bombCount: 0 }));
  }, [start]);

  const handleRestart = useCallback(() => {
    resetState(stateRef.current);
    prevLivesRef.current = prevScoreRef.current = prevSavedRef.current = 0;
    prevGameOverRef.current = false;
    prevBombCountRef.current = 0;
    setUiState(prev => ({ ...prev, gameOver: false, score: 0, lives: 3, savedCount: 0, bombCount: 0 }));
  }, []);

  return (
    <div style={{ width:'100vw', height:'100vh', background:'#000', position:'relative', overflow:'hidden' }}>
      <GameCanvas stateRef={stateRef} fingerNormRef={fingerNormRef} handDetectedRef={handDetectedRef} onTick={onTick} />
      <CameraView ref={videoRef} skelCanvasRef={skelCanvasRef} status={status} />
      <HUD score={uiState.score} lives={uiState.lives} savedCount={uiState.savedCount} bombCount={uiState.bombCount} status={status} time={clock} />
      <FlashOverlay penaltyFlash={uiState.penaltyFlash} celebrateFlash={uiState.celebrateFlash} />
      <Toast message={uiState.toast} />
      {!uiState.started && <StartScreen onStart={handleStart} />}
      {uiState.gameOver && <GameOver score={uiState.score} savedCount={uiState.savedCount} lostCount={stateRef.current.lostCount} onRestart={handleRestart} />}
    </div>
  );
}
