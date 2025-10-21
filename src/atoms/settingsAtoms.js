import { atomWithStorage } from 'jotai/utils';

export const settingsAtom = atomWithStorage('settings', {
  breakMultiplier: 0.2,
  dailyGoal: 120,
  enableWebhooks: false,
  webhookURL: '',
  enableAlarmSound: true,
});
