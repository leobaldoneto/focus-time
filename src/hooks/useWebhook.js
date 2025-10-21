import { useAtomValue } from 'jotai';
import { settingsAtom } from '../atoms/settingsAtoms';
import { useCallback } from 'react';

export const useWebhook = () => {
  const settings = useAtomValue(settingsAtom);

  const sendWebhook = useCallback((status) => {
    if (settings.enableWebhooks && settings.webhookURL) {
      fetch(settings.webhookURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify({ status }),
      }).catch(err => console.error('Webhook Error:', err));
    }
  }, [settings]);

  return { sendWebhook };
};
