import { useTimer } from '../hooks/useTimer';

export const Timer = () => {
  const { displayTime, statusText } = useTimer();

  return (
    <div className="timer-display">
      <div className="timer-ring"></div>
      <div className="timer-content">
        <div className="timer-status">{statusText}</div>
        <div role="timer" aria-live="polite">{displayTime}</div>
      </div>
    </div>
  );
};
