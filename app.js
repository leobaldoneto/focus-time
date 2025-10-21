function focusApp() {
  return {
    // State
    workTimer: null,
    breakTimer: null,
    timerStartTime: null,
    pausedTime: 0,
    totalFocusedTime: 0,
    breakTimeCredit: 0,
    streakCount: 0,

    // UI State
    isTimerVisible: true,
    isWorking: false,
    isPaused: false,
    isRunning: false,
    displayTime: '00:00',
    statusText: 'Focus',

    // Modals
    showSettings: false,
    showConfirm: false,
    confirmMessage: '',
    confirmCallback: null,

    // Notifications
    notification: false,
    notificationMessage: '',

    // Form data
    taskInput: '',
    historyLog: [],

    settings: {
      breakMultiplier: 0.2,
      dailyGoal: 120,
      enableWebhooks: false,
      webhookURL: '',
      enableAlarmSound: true,
    },

    alarmSound: null,

    // Initialize app
    init() {
      this.alarmSound = new Audio('alarm.mp3');
      this.loadSettings();
      this.loadTimerState();
      this.loadHistoryLog();
      this.updateBreakTimeCreditDisplay();
      this.updateDailyProgress();

      if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
    },

    // Settings Management
    loadSettings() {
      const saved = localStorage.getItem('settings');
      if (saved) {
        this.settings = JSON.parse(saved);
      }

      // Load streak
      const lastGoalMetDate = localStorage.getItem('lastGoalMetDate');
      this.streakCount = parseInt(localStorage.getItem('streakCount')) || 0;

      if (lastGoalMetDate) {
        const lastDate = new Date(lastGoalMetDate);
        const today = new Date();
        const diffDays = this.getDaysBetween(lastDate, today);
        if (diffDays > 3 || (diffDays > 1 && !this.isWeekendDaysBetween(lastDate, today))) {
          this.streakCount = 0;
          localStorage.setItem('streakCount', this.streakCount);
        }
      }

      const savedTask = localStorage.getItem('taskInput');
      if (savedTask) this.taskInput = savedTask;
    },

    saveSettings() {
      localStorage.setItem('settings', JSON.stringify(this.settings));
      this.showSettings = false;
      this.showNotification('Settings saved.');
    },

    // Timer State Management
    loadTimerState() {
      const saved = localStorage.getItem('timerState');
      if (saved) {
        const state = JSON.parse(saved);
        this.isWorking = state.isWorking;
        this.isPaused = state.isPaused;
        this.timerStartTime = state.timerStartTime;
        this.pausedTime = state.pausedTime;
        this.breakTimeCredit = state.breakTimeCredit;
        this.totalFocusedTime = state.totalFocusedTime;

        if (this.timerStartTime && !this.isPaused) {
          if (this.isWorking) {
            this.startTimerType(true);
          } else {
            this.startTimerType(false);
          }
        } else if (this.timerStartTime && this.isPaused) {
          if (this.isWorking) {
            this.statusText = 'Break (Paused)';
            this.displayTime = this.formatTime(this.getRemainingBreakTime());
          } else {
            this.statusText = 'Focus (Paused)';
            const elapsed = Math.floor((Date.now() - this.timerStartTime - this.pausedTime) / 1000);
            this.displayTime = this.formatTime(elapsed);
          }
        }
      }
    },

    saveTimerState() {
      localStorage.setItem('timerState', JSON.stringify({
        isWorking: this.isWorking,
        isPaused: this.isPaused,
        timerStartTime: this.timerStartTime,
        pausedTime: this.pausedTime,
        breakTimeCredit: this.breakTimeCredit,
        totalFocusedTime: this.totalFocusedTime,
      }));
    },

    // Timer Control
    startTimer() {
      if (this.isRunning) return;
      this.timerStartTime = Date.now() - this.pausedTime;
      this.startTimerType(this.isWorking);
    },

    startTimerType(isBreak) {
      if (isBreak) {
        this.breakTimer = setInterval(() => this.updateBreakTimer(), 1000);
        setTimeout(() => {
          const ring = document.querySelector('[x-ref="timerRing"]');
          if (ring) {
            ring.classList.remove('animate-pulse', 'border-blue-500');
            ring.classList.add('border-green-500');
          }
        }, 0);
        this.statusText = 'Break';
        this.sendWebhook('break');
      } else {
        this.workTimer = setInterval(() => this.updateWorkTimer(), 1000);
        setTimeout(() => {
          const ring = document.querySelector('[x-ref="timerRing"]');
          if (ring) {
            ring.classList.add('animate-pulse', 'border-blue-500');
            ring.classList.remove('border-green-500');
          }
        }, 0);
        this.statusText = 'Focus';
        this.sendWebhook('focus');
      }
      this.isPaused = false;
      this.isRunning = true;
      this.saveTimerState();
    },

    pauseTimer() {
      if (!this.isRunning) return;
      clearInterval(this.workTimer);
      clearInterval(this.breakTimer);
      this.workTimer = this.breakTimer = null;
      this.isPaused = true;
      this.isRunning = false;
      this.pausedTime = Date.now() - this.timerStartTime;
      this.sendWebhook('paused');
      this.saveTimerState();
    },

    stopTimer() {
      const duration = Math.floor((Date.now() - this.timerStartTime) / 1000);

      if (this.workTimer) {
        clearInterval(this.workTimer);
        this.workTimer = null;
        this.totalFocusedTime += duration;
        this.breakTimeCredit += Math.floor(duration * this.settings.breakMultiplier);
        this.logHistory('Work', this.taskInput, this.timerStartTime, duration);
        this.taskInput = '';
        localStorage.removeItem('taskInput');
        this.isWorking = true;
        this.sendWebhook('resting');
      } else if (this.breakTimer) {
        clearInterval(this.breakTimer);
        this.breakTimer = null;
        this.breakTimeCredit = Math.max(0, this.breakTimeCredit - duration);
        this.logHistory('Break', 'Break Time', this.timerStartTime, duration);
        this.isWorking = false;
        this.sendWebhook('working');
      }

      this.updateBreakTimeCreditDisplay();
      this.updateDailyProgress();
      this.isPaused = false;
      this.isRunning = false;
      this.pausedTime = 0;
      this.timerStartTime = null;
      this.displayTime = this.isWorking ? this.formatTime(this.breakTimeCredit) : '00:00';
      this.statusText = this.isWorking ? 'Break' : 'Focus';

      setTimeout(() => {
        const ring = document.querySelector('[x-ref="timerRing"]');
        if (ring) {
          ring.classList.remove('animate-pulse', 'border-blue-500', 'border-green-500');
          ring.style.background = '';
        }
      }, 0);

      this.saveTimerState();
    },

    updateWorkTimer() {
      const elapsed = Math.floor((Date.now() - this.timerStartTime) / 1000);
      this.displayTime = this.formatTime(elapsed);
      this.saveTimerState();
    },

    updateBreakTimer() {
      const totalSeconds = this.breakTimeCredit;
      const elapsed = Math.floor((Date.now() - this.timerStartTime) / 1000);
      const remaining = totalSeconds - elapsed;

      if (remaining <= 0) {
        if (this.settings.enableAlarmSound && this.alarmSound) {
          this.alarmSound.play().catch(() => {});
        }
        this.showBrowserNotification('Break Over', 'Time to focus!');
        this.updateTimerRingProgress(0, totalSeconds);
        this.stopTimer();
      } else {
        this.displayTime = this.formatTime(remaining);
        this.updateTimerRingProgress(remaining, totalSeconds);
        this.saveTimerState();
      }
    },

    getRemainingBreakTime() {
      const totalSeconds = this.breakTimeCredit;
      const elapsed = Math.floor((Date.now() - this.timerStartTime - this.pausedTime) / 1000);
      const remaining = totalSeconds - elapsed;
      return remaining > 0 ? remaining : 0;
    },

    updateTimerRingProgress(remaining, total) {
      const percent = ((total - remaining) / total) * 100;
      setTimeout(() => {
        const ring = document.querySelector('[x-ref="timerRing"]');
        if (ring) {
          ring.style.background = `conic-gradient(
            #10B981 ${(percent * 3.6)}deg,
            rgba(0, 0, 0, 0.1) ${(percent * 3.6)}deg
          )`;
        }
      }, 0);
    },

    // Break Time Credit
    updateBreakTimeCreditDisplay() {
      localStorage.setItem('breakTimeCredit', this.breakTimeCredit);
    },

    // Time Formatting
    formatTime(seconds) {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return hrs > 0
        ? `${this.pad(hrs)}:${this.pad(mins)}:${this.pad(secs)}`
        : `${this.pad(mins)}:${this.pad(secs)}`;
    },

    pad(num) {
      return num.toString().padStart(2, '0');
    },

    // Daily Progress
    updateDailyProgress() {
      localStorage.setItem('totalFocusedTime', this.totalFocusedTime);
      if (this.totalFocusedTime >= this.settings.dailyGoal * 60) {
        this.checkAndUpdateStreak();
      }
    },

    // Streak Management
    checkAndUpdateStreak() {
      const today = new Date();
      const lastGoalMetDate = localStorage.getItem('lastGoalMetDate');

      if (lastGoalMetDate) {
        const lastDate = new Date(lastGoalMetDate);
        const diffDays = this.getDaysBetween(lastDate, today);

        if (diffDays === 1 || (diffDays <= 3 && this.isWeekendDaysBetween(lastDate, today))) {
          this.streakCount++;
        } else if (diffDays === 0) {
          return;
        } else {
          this.streakCount = 1;
        }
      } else {
        this.streakCount = 1;
      }

      localStorage.setItem('streakCount', this.streakCount);
      localStorage.setItem('lastGoalMetDate', today.toISOString());
      this.showNotification(`Congratulations! You have a ${this.streakCount}-day streak!`);
    },

    getDaysBetween(date1, date2) {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      d1.setHours(0, 0, 0, 0);
      d2.setHours(0, 0, 0, 0);
      return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
    },

    isWeekendDaysBetween(date1, date2) {
      let current = new Date(date1);
      current.setDate(current.getDate() + 1);
      while (current <= date2) {
        if (current.getDay() !== 0 && current.getDay() !== 6) {
          return false;
        }
        current.setDate(current.getDate() + 1);
      }
      return true;
    },

    // History Management
    logHistory(type, task, startTime, duration) {
      const timeStr = new Date(startTime).toLocaleTimeString();
      this.historyLog.unshift({
        type,
        task,
        startTime: timeStr,
        duration: this.formatTime(duration),
      });
      this.saveHistoryLog();
    },

    saveHistoryLog() {
      localStorage.setItem('historyLog', JSON.stringify(this.historyLog));
    },

    loadHistoryLog() {
      const saved = localStorage.getItem('historyLog');
      if (saved) {
        this.historyLog = JSON.parse(saved);
      }
    },

    deleteHistoryItem(index) {
      this.historyLog.splice(index, 1);
      this.saveHistoryLog();
    },

    // Notifications
    showNotification(message) {
      this.notificationMessage = message;
      this.notification = true;
      setTimeout(() => {
        this.notification = false;
      }, 3000);
    },

    showBrowserNotification(title, body) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
      }
    },

    // Confirmation Dialog
    confirmAction(message, callback) {
      this.confirmMessage = message;
      this.confirmCallback = callback;
      this.showConfirm = true;
    },

    executeConfirmCallback() {
      if (this.confirmCallback) {
        this.confirmCallback();
      }
      this.showConfirm = false;
      this.confirmCallback = null;
    },

    // Settings Actions
    confirmClearHistory() {
      this.confirmAction('Are you sure you want to clear the history?', () => {
        this.historyLog = [];
        this.saveHistoryLog();
      });
    },

    confirmResetApp() {
      this.confirmAction('Are you sure you want to reset the app?', () => {
        localStorage.clear();
        location.reload();
      });
    },

    // UI Actions
    toggleTimerVisibility() {
      this.isTimerVisible = !this.isTimerVisible;
      setTimeout(() => {
        const display = document.querySelector('[role="timer"]');
        if (display) {
          display.style.visibility = this.isTimerVisible ? 'visible' : 'hidden';
        }
      }, 0);
    },


    // Webhooks
    sendWebhook(status) {
      if (this.settings.enableWebhooks && this.settings.webhookURL) {
        fetch(this.settings.webhookURL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json;charset=utf-8' },
          body: JSON.stringify({ status }),
        }).catch(err => console.error('Webhook Error:', err));
      }
    },
  };
}

document.addEventListener('alpine:init', () => {
  Alpine.store('focusApp', focusApp());
});
