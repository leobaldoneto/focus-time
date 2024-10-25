// DOM Elements
const timerDisplay = document.getElementById('timer-display');
const playButton = document.getElementById('play-button');
const pauseButton = document.getElementById('pause-button');
const stopButton = document.getElementById('stop-button');
const toggleTimerVisibilityButton = document.getElementById('toggle-timer-visibility');
const breakTimeCreditDisplay = document.getElementById('break-time-credit');
const dailyProgressBarFill = document.getElementById('daily-progress-bar-fill');
const dailyGoalText = document.getElementById('daily-goal-text');
const dailyGoalMinutesSpan = document.getElementById('daily-goal-minutes');
const taskInput = document.getElementById('task-input');
const historyLogBody = document.querySelector('#history-log tbody');
const statusText = document.getElementById('status-text');
const timerRing = document.getElementById('timer-ring');

// Settings Modal Elements
const settingsButton = document.getElementById('settings-button');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsButton = document.getElementById('close-settings-button');
const saveSettingsButton = document.getElementById('save-settings-button');
const breakMultiplierInput = document.getElementById('break-multiplier-input');
const dailyGoalInput = document.getElementById('daily-goal-input');
const enableWebhookCheckbox = document.getElementById('enable-webhook-checkbox');
const webhookUrlInput = document.getElementById('webhook-url-input');
const clearHistoryButton = document.getElementById('clear-history-button');
const resetAppButton = document.getElementById('reset-app-button');
const enableAlarmCheckbox = document.getElementById('enable-alarm-checkbox');

// Other Elements
const darkModeToggle = document.getElementById('dark-mode-toggle');
const notification = document.getElementById('notification');
const confirmModal = document.getElementById('confirm-modal');
const confirmModalMessage = document.getElementById('confirm-modal-message');
const confirmModalYes = document.getElementById('confirm-modal-yes');
const confirmModalNo = document.getElementById('confirm-modal-no');

// Variables
let workTimer = null;
let breakTimer = null;
let timerStartTime = null;
let pausedTime = 0;
let totalFocusedTime = 0; // in seconds
let breakTimeCredit = 0; // in seconds
let isTimerVisible = true;
let isWorking = false;
let isPaused = false;
let settings = {
  breakMultiplier: 0.2,
  dailyGoal: 120, // in minutes
  enableWebhooks: false,
  webhookURL: '',
  enableAlarmSound: true,
};

const alarmSound = new Audio('alarm.mp3');

// Load settings from localStorage
function loadSettings() {
  const savedSettings = JSON.parse(localStorage.getItem('settings'));
  if (savedSettings) {
    settings = savedSettings;
    breakMultiplierInput.value = settings.breakMultiplier;
    dailyGoalInput.value = settings.dailyGoal;
    dailyGoalMinutesSpan.textContent = settings.dailyGoal;
    enableWebhookCheckbox.checked = settings.enableWebhooks;
    webhookUrlInput.value = settings.webhookURL;
    enableAlarmCheckbox.checked = settings.enableAlarmSound;
  }

  // Load streak
  const lastGoalMetDate = localStorage.getItem('lastGoalMetDate');
  let streakCount = parseInt(localStorage.getItem('streakCount')) || 0;

  if (lastGoalMetDate) {
    const lastDate = new Date(lastGoalMetDate);
    const today = new Date();
    const diffDays = getDaysBetween(lastDate, today);
    if (diffDays === 0) {
      // Do nothing
    } else if (diffDays === 1 || (diffDays <= 3 && isWeekendDaysBetween(lastDate, today))) {
      // Streak continues
    } else {
      // Streak broken
      streakCount = 0;
      localStorage.setItem('streakCount', streakCount);
    }
  } else {
    streakCount = 0;
  }

  document.getElementById('streak-count').textContent = streakCount;

  // Load totalFocusedTime and breakTimeCredit
  const savedTotalFocusedTime = localStorage.getItem('totalFocusedTime');
  const savedBreakTimeCredit = localStorage.getItem('breakTimeCredit');
  if (savedTotalFocusedTime) {
    totalFocusedTime = parseInt(savedTotalFocusedTime);
  }
  if (savedBreakTimeCredit) {
    breakTimeCredit = parseInt(savedBreakTimeCredit);
  }

  // Load task input
  const savedTaskInput = localStorage.getItem('taskInput');
  if (savedTaskInput) {
    taskInput.value = savedTaskInput;
  }
}

// Save settings to localStorage
function saveSettings() {
  settings.breakMultiplier = parseFloat(breakMultiplierInput.value);
  settings.dailyGoal = parseInt(dailyGoalInput.value);
  settings.enableWebhooks = enableWebhookCheckbox.checked;
  settings.webhookURL = webhookUrlInput.value;
  settings.enableAlarmSound = enableAlarmCheckbox.checked;
  localStorage.setItem('settings', JSON.stringify(settings));
  dailyGoalMinutesSpan.textContent = settings.dailyGoal;
  showNotification('Settings saved.');
}

// Save timer state to localStorage
function saveTimerState() {
  const timerState = {
    isWorking,
    isPaused,
    timerStartTime,
    pausedTime,
    breakTimeCredit,
    totalFocusedTime,
  };
  localStorage.setItem('timerState', JSON.stringify(timerState));
}

// Load timer state from localStorage
function loadTimerState() {
  const savedTimerState = JSON.parse(localStorage.getItem('timerState'));
  if (savedTimerState) {
    isWorking = savedTimerState.isWorking;
    isPaused = savedTimerState.isPaused;
    timerStartTime = savedTimerState.timerStartTime;
    pausedTime = savedTimerState.pausedTime;
    breakTimeCredit = savedTimerState.breakTimeCredit;
    totalFocusedTime = savedTimerState.totalFocusedTime;
    updateBreakTimeCreditDisplay();
    updateDailyProgress();
    updateButtonVisibility();

    if (timerStartTime && !isPaused) {
      // Resume timer
      if (isWorking) {
        startBreakTimer();
      } else {
        startWorkTimer();
      }
    } else if (timerStartTime && isPaused) {
      // Update display
      if (isWorking) {
        statusText.textContent = 'Break (Paused)';
        timerDisplay.textContent = formatTime(getRemainingBreakTime());
      } else {
        statusText.textContent = 'Focus (Paused)';
        const elapsedSeconds = Math.floor((Date.now() - timerStartTime - pausedTime) / 1000);
        timerDisplay.textContent = formatTime(elapsedSeconds);
      }
    } else {
      statusText.textContent = isWorking ? 'Break' : 'Focus';
      timerDisplay.textContent = isWorking ? formatTime(breakTimeCredit) : '00:00';
    }
  }
}

// Start Work Timer
function startWorkTimer() {
  workTimer = setInterval(updateWorkTimer, 1000);
  sendWebhook('focus');
  // Timer ring pulses during focus
  timerRing.classList.add('animate-pulse');
  timerRing.classList.add('border-blue-500');
  timerRing.classList.remove('border-green-500');
  statusText.textContent = 'Focus';
  isPaused = false;
  saveTimerState();
}

// Start Break Timer
function startBreakTimer() {
  breakTimer = setInterval(updateBreakTimer, 1000);
  sendWebhook('break');
  // Adjust timer ring for break
  timerRing.classList.remove('animate-pulse');
  timerRing.classList.add('border-green-500');
  timerRing.classList.remove('border-blue-500');
  statusText.textContent = 'Break';
  isPaused = false;
  saveTimerState();
}

// Start Work or Break Timer
function startTimer() {
  if (workTimer || breakTimer) return;
  if (!timerStartTime) {
    timerStartTime = Date.now() - pausedTime;
  } else {
    timerStartTime = Date.now() - pausedTime;
  }
  if (isWorking) {
    startBreakTimer();
  } else {
    startWorkTimer();
  }
  updateButtonVisibility();
}

// Pause Timer
function pauseTimer() {
  if (workTimer) {
    clearInterval(workTimer);
    workTimer = null;
    isPaused = true;
    pausedTime = Date.now() - timerStartTime;
    sendWebhook('paused');
  } else if (breakTimer) {
    clearInterval(breakTimer);
    breakTimer = null;
    isPaused = true;
    pausedTime = Date.now() - timerStartTime;
    sendWebhook('paused');
  }
  saveTimerState();
  updateButtonVisibility();
}

// Stop Timer
function stopTimer() {
  if (workTimer) {
    clearInterval(workTimer);
    workTimer = null;
    const workDuration = Math.floor((Date.now() - timerStartTime) / 1000);
    totalFocusedTime += workDuration;
    const breakCredit = Math.floor(workDuration * settings.breakMultiplier);
    breakTimeCredit += breakCredit;
    updateBreakTimeCreditDisplay();
    updateDailyProgress();
    logHistory('Work', taskInput.value, timerStartTime, workDuration);
    taskInput.value = '';
    localStorage.removeItem('taskInput');
    isWorking = true; // Next is break
    sendWebhook('resting');
  } else if (breakTimer) {
    clearInterval(breakTimer);
    breakTimer = null;
    const breakDuration = Math.floor((Date.now() - timerStartTime) / 1000);
    breakTimeCredit -= breakDuration;
    if (breakTimeCredit < 0) breakTimeCredit = 0;
    updateBreakTimeCreditDisplay();
    updateDailyProgress();
    logHistory('Break', 'Break Time', timerStartTime, breakDuration);
    isWorking = false; // Next is focus
    sendWebhook('working');
  }
  isPaused = false;
  pausedTime = 0;
  timerStartTime = null;
  timerDisplay.textContent = isWorking ? formatTime(breakTimeCredit) : formatTime(0);
  statusText.textContent = isWorking ? 'Break' : 'Focus';
  timerRing.classList.remove('animate-pulse');
  timerRing.classList.remove('border-blue-500');
  timerRing.classList.remove('border-green-500');
  timerRing.style.background = '';
  saveTimerState();
  updateButtonVisibility();
}

// Update Work Timer Display
function updateWorkTimer() {
  const elapsedSeconds = Math.floor((Date.now() - timerStartTime) / 1000);
  timerDisplay.textContent = formatTime(elapsedSeconds);
  saveTimerState();
}

// Update Break Timer Display
function updateBreakTimer() {
  const totalBreakSeconds = breakTimeCredit;
  const elapsedSeconds = Math.floor((Date.now() - timerStartTime) / 1000);
  let remainingSeconds = totalBreakSeconds - elapsedSeconds;
  if (remainingSeconds <= 0) {
    if (settings.enableAlarmSound && alarmSound) { // Check if alarm sound is enabled
      alarmSound.play();
    }
    showBrowserNotification('Break Over', 'Time to focus!');
    // Set remainingSeconds to 0 to fully consume the ring
    remainingSeconds = 0;
    updateTimerRingProgress(remainingSeconds, totalBreakSeconds);
    stopTimer();
  } else {
    timerDisplay.textContent = formatTime(remainingSeconds);
    updateTimerRingProgress(remainingSeconds, totalBreakSeconds);
    saveTimerState();
  }
}

// Get Remaining Break Time
function getRemainingBreakTime() {
  const totalBreakSeconds = breakTimeCredit;
  const elapsedSeconds = Math.floor((Date.now() - timerStartTime - pausedTime) / 1000);
  const remainingSeconds = totalBreakSeconds - elapsedSeconds;
  return remainingSeconds > 0 ? remainingSeconds : 0;
}

// Update Timer Ring Progress
function updateTimerRingProgress(remainingSeconds, totalSeconds) {
  const progressPercent = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  timerRing.style.background = `conic-gradient(
    #10B981 ${(progressPercent * 3.6)}deg,
    rgba(0, 0, 0, 0.1) ${(progressPercent * 3.6)}deg
  )`;
}

// Update Break Time Credit Display
function updateBreakTimeCreditDisplay() {
  breakTimeCreditDisplay.textContent = formatTime(breakTimeCredit);
  localStorage.setItem('breakTimeCredit', breakTimeCredit);
}

// Format Time in HH:MM:SS
function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  } else {
    return `${pad(mins)}:${pad(secs)}`;
  }
}

// Pad numbers with leading zeros
function pad(num) {
  return num.toString().padStart(2, '0');
}

// Update Daily Progress
function updateDailyProgress() {
  const goalInSeconds = settings.dailyGoal * 60;
  const progressPercent = (totalFocusedTime / goalInSeconds) * 100;
  dailyProgressBarFill.style.width = `${Math.min(progressPercent, 100)}%`;
  const totalFocusedMinutes = Math.floor(totalFocusedTime / 60);
  dailyGoalText.textContent = `${totalFocusedMinutes} of ${settings.dailyGoal} minutes focused`;
  localStorage.setItem('totalFocusedTime', totalFocusedTime);

  if (totalFocusedTime >= goalInSeconds) {
    // User has met the daily goal
    checkAndUpdateStreak();
  }
}

// Check and Update Streak
function checkAndUpdateStreak() {
  const today = new Date();
  const lastGoalMetDate = localStorage.getItem('lastGoalMetDate');
  let streakCount = parseInt(localStorage.getItem('streakCount')) || 0;

  if (lastGoalMetDate) {
    const lastDate = new Date(lastGoalMetDate);
    const diffDays = getDaysBetween(lastDate, today);

    if (diffDays === 1 || (diffDays <= 3 && isWeekendDaysBetween(lastDate, today))) {
      // Consecutive day (skipping weekends)
      streakCount++;
    } else if (diffDays === 0) {
      // Already updated today
      return;
    } else {
      // Not consecutive
      streakCount = 1;
    }
  } else {
    streakCount = 1;
  }

  localStorage.setItem('streakCount', streakCount);
  localStorage.setItem('lastGoalMetDate', today.toISOString());
  document.getElementById('streak-count').textContent = streakCount;
  showNotification(`Congratulations! You have a ${streakCount}-day streak!`);
}

// Get Days Between Dates
function getDaysBetween(date1, date2) {
  const diffTime = date2.setHours(0, 0, 0, 0) - date1.setHours(0, 0, 0, 0);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Check if Days Between are Weekends
function isWeekendDaysBetween(date1, date2) {
  let currentDate = new Date(date1);
  currentDate.setDate(currentDate.getDate() + 1);
  while (currentDate <= date2) {
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      return false;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return true;
}

// Toggle Timer Visibility
function toggleTimerVisibility() {
  isTimerVisible = !isTimerVisible;
  timerDisplay.style.visibility = isTimerVisible ? 'visible' : 'hidden';
  toggleTimerVisibilityButton.innerHTML = isTimerVisible
    ? '<i class="fas fa-eye-slash"></i>'
    : '<i class="fas fa-eye"></i>';
}

// Update Button Visibility
function updateButtonVisibility() {
  if (workTimer || breakTimer) {
    playButton.classList.add('hidden');
    pauseButton.classList.remove('hidden');
    stopButton.classList.remove('hidden');
  } else if (isPaused) {
    playButton.classList.remove('hidden');
    pauseButton.classList.add('hidden');
    stopButton.classList.remove('hidden');
  } else {
    playButton.classList.remove('hidden');
    pauseButton.classList.add('hidden');
    stopButton.classList.add('hidden');
  }
}

// Log History
function logHistory(type, task, startTime, duration) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td class="px-2 py-1 border-b dark:border-gray-600">${type}</td>
    <td class="px-2 py-1 border-b dark:border-gray-600">${task || '-'}</td>
    <td class="px-2 py-1 border-b dark:border-gray-600">${new Date(startTime).toLocaleTimeString()}</td>
    <td class="px-2 py-1 border-b dark:border-gray-600">${formatTime(duration)}</td>
    <td class="px-2 py-1 border-b dark:border-gray-600">
      <button class="delete-button text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
    </td>
  `;
  historyLogBody.appendChild(tr);

  // Add delete functionality with confirmation
  tr.querySelector('.delete-button').addEventListener('click', () => {
    confirmAction('Are you sure you want to delete this item?', () => {
      tr.remove();
    });
  });

  // Save history log to localStorage
  saveHistoryLog();
}

// Save History Log to localStorage
function saveHistoryLog() {
  const historyData = [];
  historyLogBody.querySelectorAll('tr').forEach(tr => {
    const tds = tr.querySelectorAll('td');
    historyData.push({
      type: tds[0].textContent,
      task: tds[1].textContent,
      startTime: tds[2].textContent,
      duration: tds[3].textContent,
    });
  });
  localStorage.setItem('historyLog', JSON.stringify(historyData));
}

// Load History Log from localStorage
function loadHistoryLog() {
  const savedHistory = JSON.parse(localStorage.getItem('historyLog'));
  if (savedHistory) {
    savedHistory.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="px-2 py-1 border-b dark:border-gray-600">${item.type}</td>
        <td class="px-2 py-1 border-b dark:border-gray-600">${item.task}</td>
        <td class="px-2 py-1 border-b dark:border-gray-600">${item.startTime}</td>
        <td class="px-2 py-1 border-b dark:border-gray-600">${item.duration}</td>
        <td class="px-2 py-1 border-b dark:border-gray-600">
          <button class="delete-button text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
        </td>
      `;
      historyLogBody.appendChild(tr);

      // Add delete functionality with confirmation
      tr.querySelector('.delete-button').addEventListener('click', () => {
        confirmAction('Are you sure you want to delete this item?', () => {
          tr.remove();
          saveHistoryLog();
        });
      });
    });
  }
}

// Show Notification
function showNotification(message) {
  notification.textContent = message;
  notification.classList.remove('hidden');
  setTimeout(() => {
    notification.classList.add('hidden');
  }, 3000);
}

// Send Webhook
function sendWebhook(status) {
  if (settings.enableWebhooks && settings.webhookURL) {
    fetch(settings.webhookURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({ status })
    }).catch(error => {
      console.error('Webhook Error:', error);
    });
  }
}

// Show Browser Notification
function showBrowserNotification(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}

// Dark Mode Toggle
function toggleDarkMode() {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('dark-mode');
}

// Event Listeners
playButton.addEventListener('click', () => {
  startTimer();
});
pauseButton.addEventListener('click', () => {
  pauseTimer();
});
stopButton.addEventListener('click', () => {
  stopTimer();
});
toggleTimerVisibilityButton.addEventListener('click', toggleTimerVisibility);
darkModeToggle.addEventListener('click', toggleDarkMode);

// Save task input on change
taskInput.addEventListener('input', () => {
  localStorage.setItem('taskInput', taskInput.value);
});

// Settings Modal Event Listeners
settingsButton.addEventListener('click', () => {
  settingsModal.classList.remove('hidden');
});
closeSettingsButton.addEventListener('click', () => {
  settingsModal.classList.add('hidden');
});
saveSettingsButton.addEventListener('click', () => {
  saveSettings();
  settingsModal.classList.add('hidden');
});
clearHistoryButton.addEventListener('click', () => {
  confirmAction('Are you sure you want to clear the history?', () => {
    historyLogBody.innerHTML = '';
    localStorage.removeItem('historyLog');
  });
});
resetAppButton.addEventListener('click', () => {
  confirmAction('Are you sure you want to reset the app?', () => {
    localStorage.clear();
    location.reload();
  });
});

// Confirmation Modal
function confirmAction(message, callback) {
  confirmModalMessage.textContent = message;
  confirmModal.classList.remove('hidden');
  confirmModalYes.onclick = () => {
    callback();
    confirmModal.classList.add('hidden');
  };
  confirmModalNo.onclick = () => {
    confirmModal.classList.add('hidden');
  };
}

// Initialize
loadSettings();
loadTimerState();
loadHistoryLog();
updateBreakTimeCreditDisplay();
updateDailyProgress();
updateButtonVisibility();

// Request Notification Permission
if ('Notification' in window) {
  if (Notification.permission !== 'granted') {
    Notification.requestPermission();
  }
}

// Show break time credit when status changes to break
if (isWorking) {
  timerDisplay.textContent = formatTime(breakTimeCredit);
}
