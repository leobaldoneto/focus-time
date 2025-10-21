import { useSetAtom } from 'jotai';
import { notificationAtom, notificationMessageAtom } from '../atoms/timerAtoms';
import { useCallback, useEffect } from 'react';

export const useNotification = () => {
  const setNotification = useSetAtom(notificationAtom);
  const setNotificationMessage = useSetAtom(notificationMessageAtom);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const showNotification = useCallback((message) => {
    setNotificationMessage(message);
    setNotification(true);
    setTimeout(() => {
      setNotification(false);
    }, 3000);
  }, [setNotification, setNotificationMessage]);

  return { showNotification };
};
