import { useAtom, useAtomValue } from 'jotai';
import { Play, Pause, Square, Eye, EyeOff } from 'lucide-react';
import { useTimer } from '../hooks/useTimer';
import { isRunningAtom, isPausedAtom } from '../atoms/timerAtoms';
import { useState } from 'react';

export const Controls = () => {
  const { startTimer, pauseTimer, stopTimer } = useTimer();
  const isRunning = useAtomValue(isRunningAtom);
  const isPaused = useAtomValue(isPausedAtom);
  const [isTimerVisible, setIsTimerVisible] = useState(true);

  const toggleTimerVisibility = () => {
    setIsTimerVisible(!isTimerVisible);
    const display = document.querySelector('[role="timer"]');
    if (display) {
      display.style.visibility = isTimerVisible ? 'hidden' : 'visible';
    }
  };

  return (
    <div className="button-group">
      {!isRunning && (
        <button onClick={startTimer} className="icon-btn" aria-label="Play">
          <Play size={20} />
        </button>
      )}
      {isRunning && (
        <button onClick={pauseTimer} className="icon-btn" aria-label="Pause">
          <Pause size={20} />
        </button>
      )}
      {(isRunning || isPaused) && (
        <button onClick={stopTimer} className="icon-btn contrast" aria-label="Stop">
          <Square size={20} />
        </button>
      )}
      <button onClick={toggleTimerVisibility} className="icon-btn" aria-label="Toggle Timer">
        {isTimerVisible ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
};
