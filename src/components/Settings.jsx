import { useAtom, useSetAtom } from 'jotai';
import { showSettingsAtom, showConfirmAtom, confirmMessageAtom, confirmCallbackAtom } from '../atoms/timerAtoms';
import { settingsAtom } from '../atoms/settingsAtoms';
import { historyLogAtom } from '../atoms/historyAtoms';
import { useNotification } from '../hooks/useNotification';

export const Settings = () => {
  const [showSettings, setShowSettings] = useAtom(showSettingsAtom);
  const [settings, setSettings] = useAtom(settingsAtom);
  const setHistoryLog = useSetAtom(historyLogAtom);
  const setShowConfirm = useSetAtom(showConfirmAtom);
  const setConfirmMessage = useSetAtom(confirmMessageAtom);
  const setConfirmCallback = useSetAtom(confirmCallbackAtom);
  const { showNotification } = useNotification();

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSettings(false);
    showNotification('Settings saved.');
  };

  const confirmClearHistory = () => {
    setConfirmMessage('Are you sure you want to clear the history?');
    setConfirmCallback(() => () => {
      setHistoryLog([]);
      setShowConfirm(false);
    });
    setShowConfirm(true);
  };

  const confirmResetApp = () => {
    setConfirmMessage('Are you sure you want to reset the app?');
    setConfirmCallback(() => () => {
      localStorage.clear();
      location.reload();
    });
    setShowConfirm(true);
  };

  if (!showSettings) return null;

  return (
    <div role="dialog" aria-modal="true" onClick={() => setShowSettings(false)}>
      <div onClick={(e) => e.stopPropagation()}>
        <h2>Settings</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Break Multiplier (e.g., 0.2):
            <input
              type="number"
              step="0.01"
              min="0"
              value={settings.breakMultiplier}
              onChange={(e) => setSettings({ ...settings, breakMultiplier: parseFloat(e.target.value) })}
            />
          </label>
          <label>
            Daily Focus Time Goal (minutes):
            <input
              type="number"
              min="1"
              value={settings.dailyGoal}
              onChange={(e) => setSettings({ ...settings, dailyGoal: parseInt(e.target.value) })}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.enableWebhooks}
              onChange={(e) => setSettings({ ...settings, enableWebhooks: e.target.checked })}
            />
            {' '}Enable Webhooks
          </label>
          <label>
            Webhook URL:
            <input
              type="url"
              value={settings.webhookURL}
              onChange={(e) => setSettings({ ...settings, webhookURL: e.target.value })}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.enableAlarmSound}
              onChange={(e) => setSettings({ ...settings, enableAlarmSound: e.target.checked })}
            />
            {' '}Enable Alarm Sound
          </label>
          <button onClick={confirmClearHistory} type="button" className="contrast">
            Clear History
          </button>
          <button onClick={confirmResetApp} type="button" className="contrast">
            Reset App
          </button>
          <div className="flex-end">
            <button onClick={() => setShowSettings(false)} type="button" className="outline">
              Close
            </button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};
