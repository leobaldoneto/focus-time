import { useSetAtom } from 'jotai';
import { Settings } from 'lucide-react';
import { Timer } from './components/Timer';
import { Controls } from './components/Controls';
import { TaskInput } from './components/TaskInput';
import { History } from './components/History';
import { Settings as SettingsDialog } from './components/Settings';
import { ConfirmDialog } from './components/ConfirmDialog';
import { InterruptModal } from './components/InterruptModal';
import { StatsBar } from './components/StatsBar';
import { StatusPanel } from './components/StatusPanel';
import {
  showSettingsAtom,
} from './atoms/timerAtoms';

function App() {
  const setShowSettings = useSetAtom(showSettingsAtom);

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
      <TaskInput />
      <StatusPanel />
      <StatsBar />

      <History />
      <SettingsDialog />
      <ConfirmDialog />
      <InterruptModal />
    </main>
  );
}

export default App;
