import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useRef, useEffect, useCallback } from 'react';
import {
  timerStateAtom,
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
  showInterruptModalAtom,
  interruptionReasonAtom,
} from '../atoms/timerAtoms';
import { settingsAtom } from '../atoms/settingsAtoms';
import { historyLogAtom } from '../atoms/historyAtoms';
import { useWebhook } from './useWebhook';
import { useStreak } from './useStreak';
import { useConfetti } from './useConfetti';
import { useSound } from './useSound';

const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (num) => num.toString().padStart(2, '0');
  return hrs > 0 ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
};

export const useTimer = () => {
  const [timerState, setTimerState] = useAtom(timerStateAtom);
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
  const setShowInterruptModal = useSetAtom(showInterruptModalAtom);
  const [interruptionReason, setInterruptionReason] = useAtom(interruptionReasonAtom);
  const settings = useAtomValue(settingsAtom);

  const intervalRef = useRef(null);
  const alarmRef = useRef(null);
  const stopTimerRef = useRef(null);
  const breakTimeCreditBeforeFocusRef = useRef(0);
  const { sendWebhook } = useWebhook();
  const { updateStreak } = useStreak();
  const { goalReached, skipCelebration } = useConfetti();
  const { playSound, playGoalReachedSequence } = useSound();

  // Initialize alarm
  useEffect(() => {
    alarmRef.current = new Audio('alarm.mp3');
  }, []);

  const logHistory = useCallback((type, task, startTime, duration, interruptionReason = '') => {
    const timeStr = new Date(startTime).toLocaleTimeString();
    setHistoryLog((prev) => [
      {
        type,
        task,
        startTime: timeStr,
        duration: formatTime(duration),
        interruptionReason,
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

    playSound('click');
    const now = Date.now();
    const startTime = now - pausedTime;
    setTimerStartTime(startTime);
    setIsRunning(true);
    setIsPaused(false);

    if (isWorking || timerState === 'BREAK_READY') {
      // Starting break
      setTimerState('RESTING');
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
      // Starting focus
      // Store the break time credit before focus starts, for reverting on interruption
      breakTimeCreditBeforeFocusRef.current = breakTimeCredit;
      setTimerState('FOCUSING');
      setStatusText(taskInput ? `Focusing on: ${taskInput}` : 'Focusing...');
      sendWebhook('focus');
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setDisplayTime(formatTime(elapsed));
        // Update break time credit in real time based on break multiplier
        // Add to the credit that existed before focus
        const creditEarned = Math.floor(elapsed * settings.breakMultiplier);
        const newBreakCredit = breakTimeCreditBeforeFocusRef.current + creditEarned;
        setBreakTimeCredit(newBreakCredit);
      }, 1000);
    }
  }, [isRunning, isWorking, timerState, taskInput, pausedTime, breakTimeCredit, settings.enableAlarmSound, setTimerState, setTimerStartTime, setIsRunning, setIsPaused, setStatusText, setDisplayTime, sendWebhook, playSound]);

  const interruptTimer = useCallback(() => {
    if (!isRunning) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsPaused(true);
    setIsRunning(false);
    setPausedTime(Date.now() - timerStartTime);

    if (timerState === 'FOCUSING') {
      // Durante foco: interromper com modal
      // Revert break time credit to before focus started
      setBreakTimeCredit(breakTimeCreditBeforeFocusRef.current);
      playSound('interrupt');
      setTimerState('INTERRUPTED');
      setShowInterruptModal(true);
      sendWebhook('interrupted');
    } else if (timerState === 'RESTING') {
      // Durante descanso: apenas pausar sem modal
      playSound('click');
      // Mantém o estado RESTING, apenas pausa
      sendWebhook('paused');
    }
  }, [isRunning, timerState, timerStartTime, setIsPaused, setIsRunning, setPausedTime, setTimerState, setShowInterruptModal, setBreakTimeCredit, sendWebhook, playSound]);

  const resumeFromInterruption = useCallback(() => {
    playSound('click');
    setShowInterruptModal(false);
    // Keep in INTERRUPTED state until user clicks play again
  }, [setShowInterruptModal, playSound]);

  const skipTimer = useCallback(() => {
    playSound('click');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const duration = Math.floor((Date.now() - timerStartTime) / 1000);

    if (timerState === 'FOCUSING') {
      // Skip focus - register time (break credit already updated in real time)
      const newTotalFocused = totalFocusedTime + duration;

      setTotalFocusedTime(newTotalFocused);
      // breakTimeCredit is already updated in real time, no need to add again
      logHistory('Work', taskInput, timerStartTime, duration);
      setTaskInput('');
      setTimerState('BREAK_READY');
      setIsWorking(true);
      setDisplayTime(formatTime(breakTimeCredit));
      setStatusText(`Break available! (${formatTime(breakTimeCredit)})`);
      sendWebhook('break_ready');

      // Check if goal met
      if (newTotalFocused >= settings.dailyGoal * 60) {
        updateStreak();
        goalReached();
        playGoalReachedSequence(); // confetti + goal-reached.mp3 + finish_focus.mp3
      } else {
        playSound('finishFocus');
      }
    } else if (timerState === 'RESTING') {
      // Skip break - consume only used time
      const newBreakCredit = Math.max(0, breakTimeCredit - duration);
      setBreakTimeCredit(newBreakCredit);
      logHistory('Break', 'Break Time', timerStartTime, duration);
      setTimerState('IDLE');
      setIsWorking(false);
      setDisplayTime('00:00');
      setStatusText('Focusing...');
      sendWebhook('skipped_break');
    }

    setIsPaused(false);
    setIsRunning(false);
    setPausedTime(0);
    setTimerStartTime(null);
  }, [timerState, timerStartTime, totalFocusedTime, breakTimeCredit, taskInput, settings, setTotalFocusedTime, setBreakTimeCredit, setTaskInput, setTimerState, setIsWorking, setDisplayTime, setStatusText, setIsPaused, setIsRunning, setPausedTime, setTimerStartTime, logHistory, sendWebhook, updateStreak, goalReached, playSound, playGoalReachedSequence]);

  const stopTimer = useCallback(() => {
    // This is called automatically when timer completes (e.g., break timer reaches 0)
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const duration = Math.floor((Date.now() - timerStartTime) / 1000);

    if (timerState === 'RESTING') {
      // Break completed automatically
      const newBreakCredit = Math.max(0, breakTimeCredit - duration);
      setBreakTimeCredit(newBreakCredit);
      logHistory('Break', 'Break Time', timerStartTime, duration);
      setTimerState('IDLE');
      setIsWorking(false);
      setDisplayTime('00:00');
      setStatusText('Focusing...');
      sendWebhook('break_completed');
      playSound('finishRest');
    }

    setIsPaused(false);
    setIsRunning(false);
    setPausedTime(0);
    setTimerStartTime(null);
  }, [timerState, timerStartTime, breakTimeCredit, setBreakTimeCredit, setTimerState, setIsWorking, setDisplayTime, setStatusText, setIsPaused, setIsRunning, setPausedTime, setTimerStartTime, logHistory, sendWebhook, playSound]);

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
    interruptTimer,
    resumeFromInterruption,
    skipTimer,
    stopTimer,
    displayTime,
    statusText,
    isRunning,
    isPaused,
    timerState,
    formatTime,
  };
};
