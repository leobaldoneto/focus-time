import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Settings } from 'lucide-react';
import { Timer } from './components/Timer';
import { Controls } from './components/Controls';
import { History } from './components/History';
import { Settings as SettingsDialog } from './components/Settings';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Notification } from './components/Notification';
import { useTimer } from './hooks/useTimer';
import { useStreak } from './hooks/useStreak';
import {
  taskInputAtom,
  totalFocusedTimeAtom,
  breakTimeCreditAtom,
  showSettingsAtom,
} from './atoms/timerAtoms';
import { settingsAtom } from './atoms/settingsAtoms';

function App() {
  const { formatTime } = useTimer();
  const { streakCount } = useStreak();
  const [taskInput, setTaskInput] = useAtom(taskInputAtom);
  const totalFocusedTime = useAtomValue(totalFocusedTimeAtom);
  const breakTimeCredit = useAtomValue(breakTimeCreditAtom);
  const settings = useAtomValue(settingsAtom);
  const setShowSettings = useSetAtom(showSettingsAtom);

  const progressValue = Math.min(totalFocusedTime / (settings.dailyGoal * 60), 1);

  return (
    <main className="container">
      <nav>
        <h1>Focus Time</h1>
        <button onClick={() => setShowSettings(true)} className="icon-btn" aria-label="Settings">
          <Settings size={20} />
        </button>
      </nav>

      <Timer />
      <Controls />

      <p className="streak-info">
        <strong>Break Time Credit:</strong> <span>{formatTime(breakTimeCredit)}</span>
      </p>

      <progress value={progressValue}></progress>
      <p className="streak-info">
        <span>{Math.floor(totalFocusedTime / 60)} of {settings.dailyGoal} minutes focused</span>
      </p>

      <p className="streak-info">
        Current Streak: <span>{streakCount}</span> days
      </p>

      <input
        id="task-input"
        value={taskInput}
        onChange={(e) => setTaskInput(e.target.value)}
        type="text"
        placeholder="What are you working on?"
      />

      <History />
      <SettingsDialog />
      <ConfirmDialog />
      <Notification />
    </main>
  );
}

export default App;
