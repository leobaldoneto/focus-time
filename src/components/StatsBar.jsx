import { useAtomValue } from 'jotai';
import { historyLogAtom } from '../atoms/historyAtoms';
import { useMemo } from 'react';

export const StatsBar = () => {
  const historyLog = useAtomValue(historyLogAtom);

  const todayInterruptions = useMemo(() => {
    const today = new Date().toLocaleDateString();
    return historyLog.filter(entry => {
      if (!entry.interruptionReason) return false;
      const entryDate = new Date(entry.startTime).toLocaleDateString();
      return entryDate === today;
    }).length;
  }, [historyLog]);

  if (todayInterruptions === 0) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
      <div className={`badge ${todayInterruptions > 5 ? 'warning' : ''}`}>
        {todayInterruptions > 5 ? '⚠️' : '🔴'} {todayInterruptions} interruptions today
      </div>
    </div>
  );
};
