import { useAtomValue } from 'jotai';
import { Play, SkipForward, PauseCircle, Pause, Eye, EyeOff } from 'lucide-react';
import { useTimer } from '../hooks/useTimer';
import { isRunningAtom, isPausedAtom, timerStateAtom } from '../atoms/timerAtoms';
import { useState } from 'react';

export const Controls = () => {
  const { startTimer, interruptTimer, skipTimer } = useTimer();
  const isRunning = useAtomValue(isRunningAtom);
  const isPaused = useAtomValue(isPausedAtom);
  const timerState = useAtomValue(timerStateAtom);
  const [isTimerVisible, setIsTimerVisible] = useState(true);

  const toggleTimerVisibility = () => {
    setIsTimerVisible(!isTimerVisible);
    const display = document.querySelector('[role="timer"]');
    if (display) {
      display.style.visibility = isTimerVisible ? 'hidden' : 'visible';
    }
  };

  const showSkip = timerState === 'FOCUSING' || timerState === 'RESTING' || timerState === 'BREAK_READY';
  const isFocusing = timerState === 'FOCUSING';
  const isResting = timerState === 'RESTING';

  return (
    <div className="button-group">
      {!isRunning && (
        <button onClick={startTimer} className="icon-btn" aria-label="Play">
          <Play size={20} />
        </button>
      )}
      {isRunning && isFocusing && (
        <button onClick={interruptTimer} className="icon-btn" aria-label="Interrupt" style={{ color: 'var(--color-accent-danger)' }}>
          <PauseCircle size={20} />
        </button>
      )}
      {isRunning && isResting && (
        <button onClick={interruptTimer} className="icon-btn" aria-label="Pause">
          <Pause size={20} />
        </button>
      )}
      {showSkip && (
        <button onClick={skipTimer} className="icon-btn contrast" aria-label="Skip">
          <SkipForward size={20} />
        </button>
      )}
      <button onClick={toggleTimerVisibility} className="icon-btn" aria-label="Toggle Timer">
        {isTimerVisible ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
};
