import { useAtom, useSetAtom } from 'jotai';
import { showInterruptModalAtom, interruptionReasonAtom } from '../atoms/timerAtoms';
import { useTimer } from '../hooks/useTimer';
import { useState } from 'react';

export const InterruptModal = () => {
  const [showModal, setShowModal] = useAtom(showInterruptModalAtom);
  const setInterruptionReason = useSetAtom(interruptionReasonAtom);
  const { resumeFromInterruption } = useTimer();
  const [reason, setReason] = useState('');

  const quickReasons = [
    { emoji: '🚽', label: 'Bathroom' },
    { emoji: '💧', label: 'Water' },
    { emoji: '📱', label: 'Distraction' },
    { emoji: '🚨', label: 'Emergency' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalReason = reason.trim() || 'Break not specified';
    setInterruptionReason(finalReason);
    setReason('');
    resumeFromInterruption();
  };

  const handleQuickReason = (label) => {
    setInterruptionReason(label);
    setReason('');
    resumeFromInterruption();
  };

  if (!showModal) return null;

  return (
    <div role="dialog" aria-modal="true" onClick={() => {
      setInterruptionReason('Break not specified');
      setReason('');
      resumeFromInterruption();
    }}>
      <div onClick={(e) => e.stopPropagation()}>
        <h2>⏸️ Break Recorded</h2>
        <p>The timer has been paused. Would you like to record the reason for the break?</p>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {quickReasons.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleQuickReason(item.label)}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                background: 'var(--color-bg-tertiary)',
                border: '2px solid var(--color-border)',
                borderRadius: '0.5rem',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
              }}
            >
              {item.emoji} {item.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Custom reason (optional):
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="E.g.: Unexpected meeting, phone call..."
              autoFocus
            />
          </label>

          <div className="flex-end">
            <button
              onClick={() => {
                setInterruptionReason('Break not specified');
                setReason('');
                resumeFromInterruption();
              }}
              type="button"
              className="outline"
            >
              Skip
            </button>
            <button type="submit">Confirm</button>
          </div>
        </form>
      </div>
    </div>
  );
};
