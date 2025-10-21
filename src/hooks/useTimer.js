import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useRef, useEffect, useCallback } from 'react';
import {
  isWorkingAtom,
  isPausedAtom,
  isRunningAtom,
  timerStartTimeAtom,
  pausedTimeAtom,
  totalFocusedTimeAtom,
  breakTimeCreditAtom,
  displayTimeAtom,
  statusTextAtom,
  taskInputAtom,
} from '../atoms/timerAtoms';
import { settingsAtom } from '../atoms/settingsAtoms';
import { historyLogAtom } from '../atoms/historyAtoms';
import { useWebhook } from './useWebhook';
import { useNotification } from './useNotification';
import { useStreak } from './useStreak';

const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (num) => num.toString().padStart(2, '0');
  return hrs > 0 ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
};

export const useTimer = () => {
  const [isWorking, setIsWorking] = useAtom(isWorkingAtom);
  const [isPaused, setIsPaused] = useAtom(isPausedAtom);
  const [isRunning, setIsRunning] = useAtom(isRunningAtom);
  const [timerStartTime, setTimerStartTime] = useAtom(timerStartTimeAtom);
  const [pausedTime, setPausedTime] = useAtom(pausedTimeAtom);
  const [totalFocusedTime, setTotalFocusedTime] = useAtom(totalFocusedTimeAtom);
  const [breakTimeCredit, setBreakTimeCredit] = useAtom(breakTimeCreditAtom);
  const [displayTime, setDisplayTime] = useAtom(displayTimeAtom);
  const [statusText, setStatusText] = useAtom(statusTextAtom);
  const [taskInput, setTaskInput] = useAtom(taskInputAtom);
  const [historyLog, setHistoryLog] = useAtom(historyLogAtom);
  const settings = useAtomValue(settingsAtom);

  const intervalRef = useRef(null);
  const alarmRef = useRef(null);
  const stopTimerRef = useRef(null);
  const { sendWebhook } = useWebhook();
  const { showNotification } = useNotification();
  const { updateStreak } = useStreak();

  // Initialize alarm
  useEffect(() => {
    alarmRef.current = new Audio('alarm.mp3');
  }, []);

  const logHistory = useCallback((type, task, startTime, duration) => {
    const timeStr = new Date(startTime).toLocaleTimeString();
    setHistoryLog((prev) => [
      {
        type,
        task,
        startTime: timeStr,
        duration: formatTime(duration),
      },
      ...prev,
    ]);
  }, [setHistoryLog]);

  const updateWorkTimer = useCallback(() => {
    if (!timerStartTime) return;
    const elapsed = Math.floor((Date.now() - timerStartTime) / 1000);
    setDisplayTime(formatTime(elapsed));
  }, [timerStartTime, setDisplayTime]);

  const updateBreakTimer = useCallback(() => {
    if (!timerStartTime) return;
    const totalSeconds = breakTimeCredit;
    const elapsed = Math.floor((Date.now() - timerStartTime) / 1000);
    const remaining = totalSeconds - elapsed;

    if (remaining <= 0) {
      if (settings.enableAlarmSound && alarmRef.current) {
        alarmRef.current.play().catch(() => {});
      }
      if (Notification.permission === 'granted') {
        new Notification('Break Over', { body: 'Time to focus!' });
      }
      stopTimer();
    } else {
      setDisplayTime(formatTime(remaining));
    }
  }, [breakTimeCredit, timerStartTime, settings.enableAlarmSound]);

  const startTimer = useCallback(() => {
    if (isRunning) return;

    const now = Date.now();
    const startTime = now - pausedTime;
    setTimerStartTime(startTime);
    setIsRunning(true);
    setIsPaused(false);

    if (isWorking) {
      setStatusText('Break');
      sendWebhook('break');
      const totalBreakSeconds = breakTimeCredit;
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = totalBreakSeconds - elapsed;

        if (remaining <= 0) {
          if (settings.enableAlarmSound && alarmRef.current) {
            alarmRef.current.play().catch(() => {});
          }
          if (Notification.permission === 'granted') {
            new Notification('Break Over', { body: 'Time to focus!' });
          }
          if (stopTimerRef.current) stopTimerRef.current();
        } else {
          setDisplayTime(formatTime(remaining));
        }
      }, 1000);
    } else {
      setStatusText('Focus');
      sendWebhook('focus');
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setDisplayTime(formatTime(elapsed));
      }, 1000);
    }
  }, [isRunning, isWorking, pausedTime, breakTimeCredit, settings.enableAlarmSound, setTimerStartTime, setIsRunning, setIsPaused, setStatusText, setDisplayTime, sendWebhook]);

  const pauseTimer = useCallback(() => {
    if (!isRunning) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsPaused(true);
    setIsRunning(false);
    setPausedTime(Date.now() - timerStartTime);
    sendWebhook('paused');
  }, [isRunning, timerStartTime, setIsPaused, setIsRunning, setPausedTime, sendWebhook]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const duration = Math.floor((Date.now() - timerStartTime) / 1000);

    if (!isWorking) {
      // Was in focus mode
      const newTotalFocused = totalFocusedTime + duration;
      const newBreakCredit = breakTimeCredit + Math.floor(duration * settings.breakMultiplier);

      setTotalFocusedTime(newTotalFocused);
      setBreakTimeCredit(newBreakCredit);
      logHistory('Work', taskInput, timerStartTime, duration);
      setTaskInput('');
      setIsWorking(true);
      setDisplayTime(formatTime(newBreakCredit));
      setStatusText('Break');
      sendWebhook('resting');

      // Check if goal met
      if (newTotalFocused >= settings.dailyGoal * 60) {
        updateStreak();
      }
    } else {
      // Was in break mode
      const newBreakCredit = Math.max(0, breakTimeCredit - duration);
      setBreakTimeCredit(newBreakCredit);
      logHistory('Break', 'Break Time', timerStartTime, duration);
      setIsWorking(false);
      setDisplayTime('00:00');
      setStatusText('Focus');
      sendWebhook('working');
    }

    setIsPaused(false);
    setIsRunning(false);
    setPausedTime(0);
    setTimerStartTime(null);
  }, [isWorking, timerStartTime, totalFocusedTime, breakTimeCredit, taskInput, settings, setTotalFocusedTime, setBreakTimeCredit, setTaskInput, setIsWorking, setDisplayTime, setStatusText, setIsPaused, setIsRunning, setPausedTime, setTimerStartTime, logHistory, sendWebhook, updateStreak]);

  // Keep stopTimerRef updated
  useEffect(() => {
    stopTimerRef.current = stopTimer;
  }, [stopTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Initialize display on mount
  useEffect(() => {
    // Validate pausedTime - it should be a reasonable duration, not a timestamp
    const maxReasonablePausedTime = 24 * 60 * 60 * 1000; // 24 hours in ms
    if (pausedTime > maxReasonablePausedTime) {
      console.warn('Invalid pausedTime detected, resetting timer state');
      setTimerStartTime(null);
      setPausedTime(0);
      setIsPaused(false);
      setIsRunning(false);
      setDisplayTime('00:00');
      setStatusText('Focus');
      return;
    }

    // Check if saved state is valid (not too old)
    if (timerStartTime) {
      const timeSinceStart = Date.now() - timerStartTime;
      const maxValidTime = 24 * 60 * 60 * 1000; // 24 hours

      if (timeSinceStart > maxValidTime || timeSinceStart < 0) {
        // State is too old or invalid, reset it
        console.warn('Invalid timerStartTime detected, resetting timer state');
        setTimerStartTime(null);
        setPausedTime(0);
        setIsPaused(false);
        setIsRunning(false);
        setDisplayTime(isWorking ? formatTime(breakTimeCredit) : '00:00');
        return;
      }

      // Resume timer if it was running
      if (!isPaused && !isRunning) {
        startTimer();
      } else if (isPaused) {
        // Update paused display
        if (isWorking) {
          const totalSeconds = breakTimeCredit;
          const elapsed = Math.floor((pausedTime) / 1000);
          const remaining = Math.max(0, totalSeconds - elapsed);
          setDisplayTime(formatTime(remaining));
        } else {
          const elapsed = Math.floor(pausedTime / 1000);
          setDisplayTime(formatTime(elapsed));
        }
      }
    } else {
      // No saved timer, set initial display
      setDisplayTime(isWorking ? formatTime(breakTimeCredit) : '00:00');
      setStatusText(isWorking ? 'Break' : 'Focus');
    }
  }, []);

  return {
    startTimer,
    pauseTimer,
    stopTimer,
    displayTime,
    statusText,
    isRunning,
    isPaused,
    formatTime,
  };
};
