(function () {
  'use strict';

  // Request notification permission
  if ('Notification' in window) {
    Notification.requestPermission();
  }

  let timer;
  let isRunning = false;
  let timeRemaining = 25 * 60;
  let currentMode = 'focus-time';
  let continuousMode = false;
  let breakMultiplier = 0.2;
  let longBreakMultiplier = 0.2;
  let focusTime = 0;
  let completedSessions = 0;
  let sessionsBeforeLongBreak = 4;
  let historyLog = [];
  let enableWebhook = false;
  let webhookURL = '';
  let expectedEndTime = null;
  let currentLanguage = 'en';
  let dailyGoal = 8;
  let dailyProgress = 0;
  let streakCount = 0;
  let lastSessionDate = null;
  let noBreakStreakOnWeekends = false;

  const defaultTimes = {
    'focus-time': 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  };

  const elements = {
    timerDisplay: document.getElementById('timer-display'),
    startPauseButton: document.getElementById('start-pause-button'),
    skipButton: document.getElementById('skip-button'),
    focusTimeButton: document.getElementById('focus-time-button'),
    shortBreakButton: document.getElementById('short-break-button'),
    longBreakButton: document.getElementById('long-break-button'),
    settingsButton: document.getElementById('settings-button'),
    settingsModal: document.getElementById('settings-modal'),
    closeSettingsButton: document.getElementById('close-settings-button'),
    saveSettingsButton: document.getElementById('save-settings-button'),
    taskInput: document.getElementById('task-input'),
    historyList: document.getElementById('history-log'),
    darkModeToggle: document.getElementById('dark-mode-toggle'),
    notification: document.getElementById('notification'),
    progressRingCircle: document.getElementById('progress-ring-circle'),
    progressRingCircleBg: document.getElementById('progress-ring-circle-bg'),
    sessionIndicator: document.getElementById('session-indicator'),
    focusTimeInput: document.getElementById('focus-time-input'),
    shortBreakTimeInput: document.getElementById('short-break-time-input'),
    longBreakTimeInput: document.getElementById('long-break-time-input'),
    continuousModeCheckbox: document.getElementById('continuous-mode-checkbox'),
    breakMultiplierInput: document.getElementById('break-multiplier-input'),
    longBreakMultiplierInput: document.getElementById('long-break-multiplier-input'),
    sessionsBeforeLongBreakInput: document.getElementById('sessions-before-long-break-input'),
    dailyGoalInput: document.getElementById('daily-goal-input'),
    enableWebhookCheckbox: document.getElementById('enable-webhook-checkbox'),
    webhookURLInput: document.getElementById('webhook-url-input'),
    clearHistoryButton: document.getElementById('clear-history-button'),
    resetAppButton: document.getElementById('reset-app-button'),
    languageSelector: document.getElementById('language-selector'),
    dailyProgressBar: document.getElementById('daily-progress-bar'),
    dailyProgressBarFill: document.getElementById('daily-progress-bar-fill'),
    dailyGoalText: document.getElementById('daily-goal-text'),
    streakIndicator: document.getElementById('streak-indicator'),
    streakText: document.getElementById('streak-text'),
    noBreakStreakWeekendsCheckbox: document.getElementById('no-break-streak-weekends-checkbox')
  };

  const alarmSound = new Audio('alarm.mp3'); // Ensure you have an alarm.mp3 file in your project directory

  const translations = {
    en: {
      settings: 'Settings',
      toggleDarkMode: 'Toggle Dark Mode',
      focusTime: 'Focus Time',
      shortBreak: 'Short Break',
      longBreak: 'Long Break',
      start: 'Start',
      pause: 'Pause',
      skip: 'Skip',
      whatAreYouWorkingOn: 'What are you working on?',
      taskInputLabel: 'Task Input',
      type: 'Type',
      task: 'Task',
      startTime: 'Start',
      duration: 'Duration',
      deleteRecord: 'Delete Record',
      confirmDeleteRecord: 'Are you sure you want to delete this record?',
      settingsModalTitle: 'Settings',
      focusTimeInput: 'Focus Time (minutes):',
      shortBreakTime: 'Short Break Time (minutes):',
      longBreakTime: 'Long Break Time (minutes):',
      enableContinuousMode: 'Enable Continuous Focus Time Mode',
      breakMultiplier: 'Short Break Multiplier:',
      longBreakMultiplier: 'Long Break Multiplier:',
      sessionsBeforeLongBreak: 'Sessions Before Long Break:',
      dailyGoal: 'Daily Focus Time Goal:',
      enableWebhooks: 'Enable Webhooks',
      webhookURL: 'Webhook URL:',
      clearHistory: 'Clear History',
      resetApp: 'Reset App',
      close: 'Close',
      save: 'Save',
      timeForShortBreak: 'Time for a Short Break!',
      timeForLongBreak: 'Time for a Long Break!',
      backToWork: 'Back to Work!',
      shortBreakForMinutes: 'Short Break for {minutes} minutes',
      focusTimeCompleted: 'Focus Time session completed!',
      timerSkipped: 'Timer skipped!',
      webhookError: 'Webhook error:',
      confirmClearHistory: 'Are you sure you want to clear the history?',
      confirmResetApp: 'Are you sure you want to reset the app? This will erase all data.',
      noTask: 'No Task',
      stopped: 'stopped',
      paused: 'paused',
      focusing: 'focusing',
      short_break: 'short_break',
      long_break: 'long_break',
      focusTimeSkipped: 'Focus Time (Skipped)',
      of: 'of',
      focusTimeSessions: 'Focus Time Sessions',
      dayStreak: '-day streak!',
      goalReached: 'Congratulations! You reached your daily goal!',
      dailyReminder: 'You have {remaining} Focus Time sessions left to reach your goal!',
      languageSelector: 'Language Selector',
      noBreakStreakOnWeekends: "Don't Break Streak on Weekends"
    },
    pt: {
      settings: 'Configurações',
      toggleDarkMode: 'Alternar Modo Escuro',
      focusTime: 'Tempo de Foco',
      shortBreak: 'Pausa Curta',
      longBreak: 'Pausa Longa',
      start: 'Iniciar',
      pause: 'Pausar',
      skip: 'Pular',
      whatAreYouWorkingOn: 'No que você está trabalhando?',
      taskInputLabel: 'Entrada de Tarefa',
      type: 'Tipo',
      task: 'Tarefa',
      startTime: 'Início',
      duration: 'Duração',
      deleteRecord: 'Excluir Registro',
      confirmDeleteRecord: 'Tem certeza de que deseja excluir este registro?',
      settingsModalTitle: 'Configurações',
      focusTimeInput: 'Tempo de Foco (minutos):',
      shortBreakTime: 'Tempo de Pausa Curta (minutos):',
      longBreakTime: 'Tempo de Pausa Longa (minutos):',
      enableContinuousMode: 'Ativar Modo de Tempo de Foco Contínuo',
      breakMultiplier: 'Multiplicador de Pausa Curta:',
      longBreakMultiplier: 'Multiplicador de Pausa Longa:',
      sessionsBeforeLongBreak: 'Sessões antes da Pausa Longa:',
      dailyGoal: 'Meta Diária de Tempo de Foco:',
      enableWebhooks: 'Ativar Webhooks',
      webhookURL: 'URL do Webhook:',
      clearHistory: 'Limpar Histórico',
      resetApp: 'Redefinir App',
      close: 'Fechar',
      save: 'Salvar',
      timeForShortBreak: 'Hora de uma Pausa Curta!',
      timeForLongBreak: 'Hora de uma Pausa Longa!',
      backToWork: 'Volte ao trabalho!',
      shortBreakForMinutes: 'Pausa Curta de {minutes} minutos',
      focusTimeCompleted: 'Sessão de Tempo de Foco concluída!',
      timerSkipped: 'Cronômetro pulado!',
      webhookError: 'Erro de Webhook:',
      confirmClearHistory: 'Tem certeza de que deseja limpar o histórico?',
      confirmResetApp: 'Tem certeza de que deseja redefinir o app? Isso apagará todos os dados.',
      noTask: 'Sem Tarefa',
      stopped: 'parado',
      paused: 'pausado',
      focusing: 'focando',
      short_break: 'pausa_curta',
      long_break: 'pausa_longa',
      focusTimeSkipped: 'Tempo de Foco (Pulado)',
      of: 'de',
      focusTimeSessions: 'Sessões de Tempo de Foco',
      dayStreak: 'dias de sequência!',
      goalReached: 'Parabéns! Você alcançou sua meta diária!',
      dailyReminder: 'Faltam {remaining} sessões de Tempo de Foco para atingir sua meta!',
      languageSelector: 'Seletor de Idioma',
      noBreakStreakOnWeekends: "Não Quebrar Sequência nos Finais de Semana"
    }
  };

  function loadSettings() {
    const settings = localStorage.getItem('settings');
    if (settings) {
      const {
        defaultTimes: dt,
        continuousMode: cm,
        breakMultiplier: bm,
        longBreakMultiplier: lbm,
        sessionsBeforeLongBreak: sblb,
        enableWebhook: ew,
        webhookURL: wu,
        darkMode: dm,
        language: lang,
        dailyGoal: dg,
        noBreakStreakOnWeekends: nbs
      } = JSON.parse(settings);
      Object.assign(defaultTimes, dt);
      continuousMode = cm;
      breakMultiplier = bm;
      longBreakMultiplier = lbm;
      sessionsBeforeLongBreak = sblb;
      enableWebhook = ew;
      webhookURL = wu;
      currentLanguage = lang || 'en';
      elements.languageSelector.value = currentLanguage;
      dailyGoal = dg || 8;
      noBreakStreakOnWeekends = nbs || false;
      if (dm) {
        document.body.classList.add('dark-mode');
      }
    } else {
      currentLanguage = 'en';
      elements.languageSelector.value = 'en';
      dailyGoal = 8;
    }
  }

  function saveSettings() {
    const settings = {
      defaultTimes,
      continuousMode,
      breakMultiplier,
      longBreakMultiplier,
      sessionsBeforeLongBreak,
      enableWebhook,
      webhookURL,
      darkMode: document.body.classList.contains('dark-mode'),
      language: currentLanguage,
      dailyGoal,
      noBreakStreakOnWeekends
    };
    localStorage.setItem('settings', JSON.stringify(settings));
  }

  function loadStatus() {
    const status = localStorage.getItem('timerStatus');
    if (status) {
      const {
        timeRemaining: tr,
        currentMode: cm,
        isRunning: ir,
        focusTime: ft,
        completedSessions: cs,
        expectedEndTime: eet,
        taskInputValue: tiv,
        dailyProgress: dp,
        streakCount: sc,
        lastSessionDate: lsd,
      } = JSON.parse(status);
      timeRemaining = tr;
      currentMode = cm;
      isRunning = ir;
      focusTime = ft;
      completedSessions = cs;
      expectedEndTime = eet;
      elements.taskInput.value = tiv || '';
      dailyProgress = dp || 0;
      streakCount = sc || 0;
      lastSessionDate = lsd ? new Date(lsd) : null;
      resetDailyProgressIfNeeded();
      if (isRunning && expectedEndTime) {
        const now = Date.now();
        const newTimeRemaining = Math.floor((expectedEndTime - now) / 1000);
        if (newTimeRemaining > 0) {
          timeRemaining = newTimeRemaining;
        } else {
          timeRemaining = 0;
          isRunning = false;
          handleTimerCompletion();
        }
      }
    } else {
      timeRemaining = defaultTimes[currentMode];
      dailyProgress = 0;
      streakCount = 0;
    }
  }

  function saveStatus() {
    const status = {
      timeRemaining,
      currentMode,
      isRunning,
      focusTime,
      completedSessions,
      expectedEndTime,
      taskInputValue: elements.taskInput.value,
      dailyProgress,
      streakCount,
      lastSessionDate: lastSessionDate ? lastSessionDate.toISOString() : null,
    };
    localStorage.setItem('timerStatus', JSON.stringify(status));
  }

  function loadHistory() {
    const history = localStorage.getItem('historyLog');
    if (history) {
      historyLog = JSON.parse(history);
      renderHistory();
    }
  }

  function saveHistory() {
    localStorage.setItem('historyLog', JSON.stringify(historyLog));
  }

  function initialize() {
    loadSettings();
    loadStatus();
    loadHistory();
    initializeSettingsModal();
    updateModeButtons();
    updateSessionIndicator();
    updateTimerDisplay();
    applyTranslations();
    updateDailyProgressUI();
    if (isRunning) {
      startTimer(true);
    }
    // Event listeners
    elements.startPauseButton.addEventListener('click', onStartPause);
    elements.skipButton.addEventListener('click', skipTimer);
    elements.focusTimeButton.addEventListener('click', () => switchMode('focus-time'));
    elements.shortBreakButton.addEventListener('click', () => switchMode('shortBreak'));
    elements.longBreakButton.addEventListener('click', () => switchMode('longBreak'));
    elements.settingsButton.addEventListener('click', openSettingsModal);
    elements.closeSettingsButton.addEventListener('click', closeSettingsModal);
    elements.saveSettingsButton.addEventListener('click', saveSettingsModal);
    elements.darkModeToggle.addEventListener('click', toggleDarkMode);
    elements.clearHistoryButton.addEventListener('click', clearHistory);
    elements.resetAppButton.addEventListener('click', resetApp);
    elements.taskInput.addEventListener('input', saveStatus);
    elements.languageSelector.addEventListener('change', changeLanguage);
    elements.noBreakStreakWeekendsCheckbox.addEventListener('change', (event) => {
      noBreakStreakOnWeekends = event.target.checked;
      saveSettings();
    });
  }

  function applyTranslations() {
    const t = translations[currentLanguage];

    // Update the language attribute
    document.documentElement.lang = currentLanguage;

    // Update aria-labels
    elements.settingsButton.setAttribute('aria-label', t.settings);
    elements.darkModeToggle.setAttribute('aria-label', t.toggleDarkMode);
    elements.startPauseButton.setAttribute('aria-label', isRunning ? t.pause : t.start);
    elements.skipButton.setAttribute('aria-label', t.skip);
    elements.taskInput.setAttribute('aria-label', t.taskInputLabel);
    elements.languageSelector.setAttribute('aria-label', t.languageSelector);

    // Update buttons
    elements.focusTimeButton.innerHTML = `<i class="fas fa-clock mr-1"></i> ${t.focusTime}`;
    elements.shortBreakButton.innerHTML = `<i class="fas fa-coffee mr-1"></i> ${t.shortBreak}`;
    elements.longBreakButton.innerHTML = `<i class="fas fa-umbrella-beach mr-1"></i> ${t.longBreak}`;
    elements.startPauseButton.innerHTML = `<i class="fas fa-${isRunning ? 'pause' : 'play'} mr-1"></i> ${isRunning ? t.pause : t.start}`;
    elements.skipButton.innerHTML = `<i class="fas fa-forward"></i> ${t.skip}`;

    // Update placeholders
    elements.taskInput.setAttribute('placeholder', t.whatAreYouWorkingOn);

    // Update labels
    const taskInputLabel = document.querySelector('label[for="task-input"]');
    if (taskInputLabel) {
      taskInputLabel.textContent = t.taskInputLabel;
    }

    // Update table headers
    const tableHeaders = elements.historyList.querySelectorAll('th');
    tableHeaders[0].textContent = t.type;
    tableHeaders[1].textContent = t.task;
    tableHeaders[2].textContent = t.startTime;
    tableHeaders[3].textContent = t.duration;
    tableHeaders[4].textContent = t.deleteRecord;

    // Update settings modal
    document.getElementById('settings-modal-title').textContent = t.settingsModalTitle;
    document.querySelector('label[for="focus-time-input"]').textContent = t.focusTimeInput;
    document.querySelector('label[for="short-break-time-input"]').textContent = t.shortBreakTime;
    document.querySelector('label[for="long-break-time-input"]').textContent = t.longBreakTime;
    document.querySelector('label[for="continuous-mode-checkbox"]').textContent = t.enableContinuousMode;
    document.querySelector('label[for="break-multiplier-input"]').textContent = t.breakMultiplier;
    document.querySelector('label[for="long-break-multiplier-input"]').textContent = t.longBreakMultiplier;
    document.querySelector('label[for="sessions-before-long-break-input"]').textContent = t.sessionsBeforeLongBreak;
    document.querySelector('label[for="daily-goal-input"]').textContent = t.dailyGoal;
    document.querySelector('label[for="enable-webhook-checkbox"]').textContent = t.enableWebhooks;
    document.querySelector('label[for="webhook-url-input"]').textContent = t.webhookURL;
    document.querySelector('label[for="no-break-streak-weekends-checkbox"]').textContent = t.noBreakStreakOnWeekends;
    elements.clearHistoryButton.textContent = t.clearHistory;
    elements.resetAppButton.textContent = t.resetApp;
    elements.closeSettingsButton.textContent = t.close;
    elements.saveSettingsButton.textContent = t.save;

    // Update daily goal text
    updateDailyGoalText();

    // Update streak text
    updateStreakText();

    // Re-render history log with updated translations
    renderHistory();
  }

  function changeLanguage() {
    currentLanguage = elements.languageSelector.value;
    applyTranslations();
    saveSettings();
  }

  function initializeSettingsModal() {
    elements.focusTimeInput.value = defaultTimes['focus-time'] / 60;
    elements.shortBreakTimeInput.value = defaultTimes.shortBreak / 60;
    elements.longBreakTimeInput.value = defaultTimes.longBreak / 60;
    elements.continuousModeCheckbox.checked = continuousMode;
    elements.breakMultiplierInput.value = breakMultiplier;
    elements.longBreakMultiplierInput.value = longBreakMultiplier;
    elements.sessionsBeforeLongBreakInput.value = sessionsBeforeLongBreak;
    elements.enableWebhookCheckbox.checked = enableWebhook;
    elements.webhookURLInput.value = webhookURL;
    elements.dailyGoalInput.value = dailyGoal;
    elements.noBreakStreakWeekendsCheckbox.checked = noBreakStreakOnWeekends;
  }

  function updateTimerDisplay() {
    const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, '0');
    const seconds = String(timeRemaining % 60).padStart(2, '0');
    elements.timerDisplay.textContent = `${minutes}:${seconds}`;
    updateProgressRing();
  }

  function updateProgressRing() {
    const radius = elements.progressRingCircle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    elements.progressRingCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    let percent = timeRemaining / defaultTimes[currentMode];
    if (percent < 0) percent = 0;
    const offset = circumference - percent * circumference;
    elements.progressRingCircle.style.strokeDashoffset = offset;
  }

  function updateModeButtons() {
    elements.focusTimeButton.classList.remove('active');
    elements.shortBreakButton.classList.remove('active');
    elements.longBreakButton.classList.remove('active');

    if (currentMode === 'focus-time') {
      elements.focusTimeButton.classList.add('active');
    } else if (currentMode === 'shortBreak') {
      elements.shortBreakButton.classList.add('active');
    } else if (currentMode === 'longBreak') {
      elements.longBreakButton.classList.add('active');
    }
  }

  function updateSessionIndicator() {
    elements.sessionIndicator.innerHTML = '';
    for (let i = 0; i < sessionsBeforeLongBreak; i++) {
      const icon = document.createElement('i');
      icon.classList.add('fas', 'fa-apple-alt', 'pomo-icon');
      if (i < completedSessions % sessionsBeforeLongBreak) {
        icon.classList.add('completed');
      }
      elements.sessionIndicator.appendChild(icon);
    }
  }

  function renderHistory() {
    const tbody = elements.historyList.querySelector('tbody');
    tbody.innerHTML = '';
    const t = translations[currentLanguage];
    historyLog.forEach((session, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="px-2 py-1 border-b">${t[session.type] || session.type}</td>
        <td class="px-2 py-1 border-b">${session.task || t.noTask}</td>
        <td class="px-2 py-1 border-b">${session.startTime}</td>
        <td class="px-2 py-1 border-b">${session.duration} min</td>
        <td class="px-2 py-1 border-b text-center">
          <i class="fas fa-trash delete-button" data-index="${index}" aria-label="${t.deleteRecord}" tabindex="0"></i>
        </td>
      `;
      tbody.appendChild(row);
    });

    // Add event listeners for delete buttons
    const deleteButtons = tbody.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        const index = event.target.getAttribute('data-index');
        deleteRecord(index);
      });
      // Allow keyboard accessibility
      button.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          const index = event.target.getAttribute('data-index');
          deleteRecord(index);
        }
      });
    });
  }

  function deleteRecord(index) {
    const t = translations[currentLanguage];
    if (confirm(t.confirmDeleteRecord)) {
      historyLog.splice(index, 1);
      saveHistory();
      renderHistory();
    }
  }

  function onStartPause() {
    if (!isRunning) {
      startTimer();
    } else {
      if (continuousMode && currentMode === 'focus-time') {
        pauseContinuousMode();
      } else {
        pauseTimer();
      }
    }
  }

  function startTimer(resuming = false) {
    isRunning = true;
    elements.startPauseButton.innerHTML = `<i class="fas fa-pause mr-1"></i> ${translations[currentLanguage].pause}`;
    let status;
    if (currentMode === 'focus-time') {
      status = 'focusing';
    } else if (currentMode === 'shortBreak') {
      status = 'short_break';
    } else if (currentMode === 'longBreak') {
      status = 'long_break';
    }
    if (!resuming) {
      sendWebhook(status);
    }
    if (!expectedEndTime || !resuming) {
      expectedEndTime = Date.now() + timeRemaining * 1000;
    }
    timer = setInterval(timerTick, 1000);
    saveStatus();
  }

  function timerTick() {
    timeRemaining--;
    updateTimerDisplay();
    if (timeRemaining <= 0) {
      clearInterval(timer);
      handleTimerCompletion();
    }
  }

  function handleTimerCompletion() {
    const t = translations[currentLanguage];
    alarmSound.play();
    isRunning = false;
    elements.startPauseButton.innerHTML = `<i class="fas fa-play mr-1"></i> ${t.start}`;
    sendWebhook('stopped');
    showBrowserNotification(`${t[currentMode]} ${t.focusTimeCompleted}`);
    const endTime = new Date();
    const duration = Math.round(defaultTimes[currentMode] / 60);
    addToHistoryLog({
      type: currentMode,
      task: elements.taskInput.value,
      startTime: endTime.toLocaleTimeString(),
      duration: duration
    });
    if (currentMode === 'focus-time') {
      completedSessions++;
      dailyProgress++;
      updateDailyProgressUI();
      checkDailyGoalReached();
      updateSessionIndicator();
      if (completedSessions % sessionsBeforeLongBreak === 0) {
        currentMode = 'longBreak';
        timeRemaining = defaultTimes.longBreak;
        showNotification(t.timeForLongBreak);
        showBrowserNotification(t.timeForLongBreak);
      } else {
        currentMode = 'shortBreak';
        timeRemaining = defaultTimes.shortBreak;
        showNotification(t.timeForShortBreak);
        showBrowserNotification(t.timeForShortBreak);
      }
    } else {
      currentMode = 'focus-time';
      timeRemaining = defaultTimes['focus-time'];
      showNotification(t.backToWork);
      showBrowserNotification(t.backToWork);
    }
    expectedEndTime = null;
    saveStatus();
    updateModeButtons();
    updateTimerDisplay();
  }

  function pauseTimer() {
    const t = translations[currentLanguage];
    isRunning = false;
    elements.startPauseButton.innerHTML = `<i class="fas fa-play mr-1"></i> ${t.start}`;
    clearInterval(timer);
    expectedEndTime = null;
    sendWebhook('paused');
    saveStatus();
  }

  function pauseContinuousMode() {
    const t = translations[currentLanguage];
    pauseTimer();
    defaultTimes.shortBreak = Math.round(focusTime * breakMultiplier);
    defaultTimes.longBreak = Math.round(focusTime * longBreakMultiplier);
    currentMode = 'shortBreak';
    timeRemaining = defaultTimes.shortBreak;
    updateModeButtons();
    updateTimerDisplay();
    showNotification(t.shortBreakForMinutes.replace('{minutes}', Math.floor(defaultTimes.shortBreak / 60)));
    showBrowserNotification(t.shortBreakForMinutes.replace('{minutes}', Math.floor(defaultTimes.shortBreak / 60)));
    addToHistoryLog({
      type: 'focus-time',
      task: elements.taskInput.value,
      startTime: new Date(new Date() - focusTime * 1000).toLocaleTimeString(),
      duration: Math.round(focusTime / 60)
    });
    completedSessions++;
    dailyProgress++;
    updateDailyProgressUI();
    checkDailyGoalReached();
    updateSessionIndicator();
  }

  function resetTimer() {
    const t = translations[currentLanguage];
    pauseTimer();
    if (continuousMode && currentMode === 'focus-time') {
      timeRemaining = 0;
    } else {
      timeRemaining = defaultTimes[currentMode];
    }
    elements.startPauseButton.innerHTML = `<i class="fas fa-play mr-1"></i> ${t.start}`;
    updateTimerDisplay();
    saveStatus();
  }

  function skipTimer() {
    const t = translations[currentLanguage];
    clearInterval(timer);
    isRunning = false;
    elements.startPauseButton.innerHTML = `<i class="fas fa-play mr-1"></i> ${t.start}`;
    expectedEndTime = null;
    sendWebhook('stopped');
    showBrowserNotification(t.timerSkipped);
    if (currentMode === 'focus-time') {
      const endTime = new Date();
      const duration = Math.round((defaultTimes['focus-time'] - timeRemaining) / 60);
      addToHistoryLog({
        type: 'focus-timeSkipped',
        task: elements.taskInput.value,
        startTime: endTime.toLocaleTimeString(),
        duration: duration
      });
      completedSessions++;
      dailyProgress++;
      updateDailyProgressUI();
      checkDailyGoalReached();
      updateSessionIndicator();
      if (completedSessions % sessionsBeforeLongBreak === 0) {
        currentMode = 'longBreak';
        timeRemaining = defaultTimes.longBreak;
        showNotification(t.timeForLongBreak);
        showBrowserNotification(t.timeForLongBreak);
      } else {
        currentMode = 'shortBreak';
        timeRemaining = defaultTimes.shortBreak;
        showNotification(t.timeForShortBreak);
        showBrowserNotification(t.timeForShortBreak);
      }
    } else {
      currentMode = 'focus-time';
      timeRemaining = defaultTimes['focus-time'];
      showNotification(t.backToWork);
      showBrowserNotification(t.backToWork);
    }
    updateModeButtons();
    updateTimerDisplay();
    saveStatus();
  }

  function switchMode(mode) {
    currentMode = mode;
    resetTimer();
    updateModeButtons();
  }

  function openSettingsModal() {
    elements.settingsModal.classList.remove('hidden');
    initializeSettingsModal();
    elements.settingsModal.querySelector('input, button, select, textarea').focus();
  }

  function closeSettingsModal() {
    elements.settingsModal.classList.add('hidden');
    elements.settingsButton.focus();
  }

  function saveSettingsModal() {
    defaultTimes['focus-time'] = parseInt(elements.focusTimeInput.value) * 60;
    defaultTimes.shortBreak = parseInt(elements.shortBreakTimeInput.value) * 60;
    defaultTimes.longBreak = parseInt(elements.longBreakTimeInput.value) * 60;
    continuousMode = elements.continuousModeCheckbox.checked;
    breakMultiplier = parseFloat(elements.breakMultiplierInput.value);
    longBreakMultiplier = parseFloat(elements.longBreakMultiplierInput.value);
    sessionsBeforeLongBreak = parseInt(elements.sessionsBeforeLongBreakInput.value);
    enableWebhook = elements.enableWebhookCheckbox.checked;
    webhookURL = elements.webhookURLInput.value.trim();
    dailyGoal = parseInt(elements.dailyGoalInput.value);
    saveSettings();
    updateDailyGoalText();
    resetTimer();
    updateModeButtons();
    closeSettingsModal();
  }

  function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    saveSettings();
  }

  function showNotification(message) {
    elements.notification.textContent = message;
    elements.notification.style.display = 'block';
    setTimeout(() => {
      elements.notification.style.display = 'none';
    }, 3000);
  }

  function showBrowserNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(message);
    }
  }

  function sendWebhook(status) {
    if (enableWebhook && webhookURL) {
      const payload = {
        status: status,
        taskName: elements.taskInput.value,
        time: new Date().toISOString()
      };
      fetch(webhookURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Webhook request failed with status ' + response.status);
          }
          return response.json();
        })
        .catch(error => {
          console.error('Webhook error:', error);
          const t = translations[currentLanguage];
          showNotification(`${t.webhookError} ${error.message}`);
        });
    }
  }

  function addToHistoryLog(session) {
    historyLog.push(session);
    saveHistory();
    renderHistory();
  }

  function clearHistory() {
    const t = translations[currentLanguage];
    if (confirm(t.confirmClearHistory)) {
      historyLog = [];
      saveHistory();
      renderHistory();
    }
  }

  function resetApp() {
    const t = translations[currentLanguage];
    if (confirm(t.confirmResetApp)) {
      localStorage.clear();
      location.reload();
    }
  }

  function updateDailyProgressUI() {
    const t = translations[currentLanguage];
    const progressPercent = Math.min((dailyProgress / dailyGoal) * 100, 100);
    elements.dailyProgressBarFill.style.width = `${progressPercent}%`;
    updateDailyGoalText();
    saveStatus();
  }

  function updateDailyGoalText() {
    const t = translations[currentLanguage];
    elements.dailyGoalText.textContent = `${dailyProgress} ${t.of} ${dailyGoal} ${t.focusTimeSessions}`;
  }

  function checkDailyGoalReached() {
    const t = translations[currentLanguage];
    const today = new Date().toDateString();
    if (dailyProgress >= dailyGoal && (!lastSessionDate || new Date(lastSessionDate).toDateString() !== today)) {
      streakCount++;
      lastSessionDate = new Date();
      updateStreakText();
      showNotification(t.goalReached);
      showBrowserNotification(t.goalReached);
    }
    saveStatus();
  }

  function updateStreakText() {
    const t = translations[currentLanguage];
    elements.streakText.textContent = `${streakCount}${t.dayStreak}`;
  }

  function resetDailyProgressIfNeeded() {
    const today = new Date().toDateString();
    if (!lastSessionDate || new Date(lastSessionDate).toDateString() !== today) {
      dailyProgress = 0;
      saveStatus();
    }
  }

  // Set up daily reminders (without backend)
  function setupDailyReminders() {
    const intervals = [12, 15, 18]; // 12 PM, 3 PM, 6 PM
    const now = new Date();
    intervals.forEach(hour => {
      const reminderTime = new Date();
      reminderTime.setHours(hour, 0, 0, 0);
      if (reminderTime > now) {
        const timeout = reminderTime - now;
        setTimeout(() => {
          const remaining = dailyGoal - dailyProgress;
          if (remaining > 0) {
            const t = translations[currentLanguage];
            const message = t.dailyReminder.replace('{remaining}', remaining);
            showNotification(message);
            showBrowserNotification(message);
          }
        }, timeout);
      }
    });
  }

  setupDailyReminders();

  initialize();
})();
