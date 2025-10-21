import { useAtomValue } from 'jotai';
import { notificationAtom, notificationMessageAtom } from '../atoms/timerAtoms';

export const Notification = () => {
  const notification = useAtomValue(notificationAtom);
  const notificationMessage = useAtomValue(notificationMessageAtom);

  if (!notification) return null;

  return (
    <div className="notification">
      <span>{notificationMessage}</span>
    </div>
  );
};
