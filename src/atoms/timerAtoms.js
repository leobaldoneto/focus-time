import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Timer state
export const isWorkingAtom = atomWithStorage('isWorking', false);
export const isPausedAtom = atomWithStorage('isPaused', false);
export const timerStartTimeAtom = atomWithStorage('timerStartTime', null);
export const pausedTimeAtom = atomWithStorage('pausedTime', 0);
export const totalFocusedTimeAtom = atomWithStorage('totalFocusedTime', 0);
export const breakTimeCreditAtom = atomWithStorage('breakTimeCredit', 0);

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

// Notifications
export const notificationAtom = atom(false);
export const notificationMessageAtom = atom('');

// Streak
export const streakCountAtom = atomWithStorage('streakCount', 0);
export const lastGoalMetDateAtom = atomWithStorage('lastGoalMetDate', null);
