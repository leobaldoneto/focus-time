import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Timer states: IDLE, FOCUSING, INTERRUPTED, BREAK_READY, RESTING
export const timerStateAtom = atomWithStorage('timerState', 'IDLE');
export const isWorkingAtom = atomWithStorage('isWorking', false);
export const isPausedAtom = atomWithStorage('isPaused', false);
export const timerStartTimeAtom = atomWithStorage('timerStartTime', null);
export const pausedTimeAtom = atomWithStorage('pausedTime', 0);
export const totalFocusedTimeAtom = atomWithStorage('totalFocusedTime', 0);
export const breakTimeCreditAtom = atomWithStorage('breakTimeCredit', 0);
export const interruptionReasonAtom = atomWithStorage('interruptionReason', '');

// UI state (not persisted)
export const isRunningAtom = atom(false);
export const displayTimeAtom = atom('00:00');
export const statusTextAtom = atom('Focus');

// Task input
export const taskInputAtom = atomWithStorage('taskInput', '');

// Modals
export const showSettingsAtom = atom(false);
export const showConfirmAtom = atom(false);
export const confirmMessageAtom = atom('');
export const confirmCallbackAtom = atom(null);
export const showInterruptModalAtom = atom(false);


// Streak
export const streakCountAtom = atomWithStorage('streakCount', 0);
export const lastGoalMetDateAtom = atomWithStorage('lastGoalMetDate', null);
