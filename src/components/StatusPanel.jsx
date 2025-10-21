import { useAtomValue } from 'jotai';
import { Target, Clock } from 'lucide-react';
import { totalFocusedTimeAtom, breakTimeCreditAtom } from '../atoms/timerAtoms';
import { settingsAtom } from '../atoms/settingsAtoms';
import { useTimer } from '../hooks/useTimer';
import { useStreak } from '../hooks/useStreak';

export const StatusPanel = () => {
  const { formatTime } = useTimer();
  const { streakCount } = useStreak();
  const totalFocusedTime = useAtomValue(totalFocusedTimeAtom);
  const breakTimeCredit = useAtomValue(breakTimeCreditAtom);
  const settings = useAtomValue(settingsAtom);

  const progressValue = Math.min(totalFocusedTime / (settings.dailyGoal * 60), 1);
  const focusedMinutes = Math.floor(totalFocusedTime / 60);
  const dailyGoal = settings.dailyGoal;
  const percentageComplete = Math.floor(progressValue * 100);

  return (
    <div className="status-panel">
      <div className="status-card daily-goal-card">
        <div className="status-card-header">
          <Target size={16} />
          <span>Daily Goal</span>
        </div>
        <div className="status-card-content">
          <div className="progress-bar">
            <progress value={progressValue}></progress>
          </div>
          <div className="status-stats">
            <span className="status-value">{focusedMinutes}/{dailyGoal}</span>
            <span className="status-label">minutes</span>
          </div>
          <div className="status-percentage">{percentageComplete}%</div>
          <div className="status-card-footer">
            <span className="status-footer-item">
              <span className="status-footer-icon">🔥</span>
              {streakCount} {streakCount === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>
      </div>

      <div className="status-card break-credit-card">
        <div className="status-card-header">
          <Clock size={16} />
          <span>Break Credit</span>
        </div>
        <div className="status-card-content">
          <div className="status-value-large">{formatTime(breakTimeCredit)}</div>
          <div className="status-label">available</div>
        </div>
      </div>
    </div>
  );
};
