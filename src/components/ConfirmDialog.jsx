import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { showConfirmAtom, confirmMessageAtom, confirmCallbackAtom } from '../atoms/timerAtoms';

export const ConfirmDialog = () => {
  const [showConfirm, setShowConfirm] = useAtom(showConfirmAtom);
  const confirmMessage = useAtomValue(confirmMessageAtom);
  const [confirmCallback, setConfirmCallback] = useAtom(confirmCallbackAtom);

  const executeCallback = () => {
    if (confirmCallback) {
      confirmCallback();
    }
    setShowConfirm(false);
    setConfirmCallback(null);
  };

  if (!showConfirm) return null;

  return (
    <div role="dialog" aria-modal="true" onClick={() => setShowConfirm(false)}>
      <div onClick={(e) => e.stopPropagation()}>
        <p>{confirmMessage}</p>
        <div className="flex-end">
          <button onClick={() => setShowConfirm(false)} type="button" className="outline">
            No
          </button>
          <button onClick={executeCallback} type="button">
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};
