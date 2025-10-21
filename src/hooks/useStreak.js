import { useAtom, useAtomValue } from 'jotai';
import { streakCountAtom, lastGoalMetDateAtom } from '../atoms/timerAtoms';
import { useNotification } from './useNotification';
import { useCallback, useEffect } from 'react';

const getDaysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
};

const isWeekendDaysBetween = (date1, date2) => {
  let current = new Date(date1);
  current.setDate(current.getDate() + 1);
  while (current <= date2) {
    if (current.getDay() !== 0 && current.getDay() !== 6) {
      return false;
    }
    current.setDate(current.getDate() + 1);
  }
  return true;
};

export const useStreak = () => {
  const [streakCount, setStreakCount] = useAtom(streakCountAtom);
  const [lastGoalMetDate, setLastGoalMetDate] = useAtom(lastGoalMetDateAtom);
  const { showNotification } = useNotification();

  // Check streak validity on mount
  useEffect(() => {
    if (lastGoalMetDate) {
      const lastDate = new Date(lastGoalMetDate);
      const today = new Date();
      const diffDays = getDaysBetween(lastDate, today);
      if (diffDays > 3 || (diffDays > 1 && !isWeekendDaysBetween(lastDate, today))) {
        setStreakCount(0);
      }
    }
  }, []);

  const updateStreak = useCallback(() => {
    const today = new Date();

    if (lastGoalMetDate) {
      const lastDate = new Date(lastGoalMetDate);
      const diffDays = getDaysBetween(lastDate, today);

      if (diffDays === 1 || (diffDays <= 3 && isWeekendDaysBetween(lastDate, today))) {
        const newStreak = streakCount + 1;
        setStreakCount(newStreak);
        showNotification(`Congratulations! You have a ${newStreak}-day streak!`);
      } else if (diffDays === 0) {
        return;
      } else {
        setStreakCount(1);
        showNotification('Congratulations! You have a 1-day streak!');
      }
    } else {
      setStreakCount(1);
      showNotification('Congratulations! You have a 1-day streak!');
    }

    setLastGoalMetDate(today.toISOString());
  }, [lastGoalMetDate, streakCount, setStreakCount, setLastGoalMetDate, showNotification]);

  return { streakCount, updateStreak };
};
