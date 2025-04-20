// DOM Elements
const timerDisplay = document.querySelector('.timer-time');
const timerStatus = document.querySelector('.timer-status');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const sessionsCompletedEl = document.getElementById('sessions-completed');
const dailyStreakEl = document.getElementById('daily-streak');
const focusMinutesEl = document.getElementById('focus-minutes');
const todaysSessionsEl = document.getElementById('todays-sessions');
const modalSessionsCompleted = document.getElementById('modal-sessions-completed');
const modalStreak = document.getElementById('modal-streak');
const focusDurationInput = document.getElementById('focus-duration');
const shortBreakDurationInput = document.getElementById('short-break-duration');
const longBreakDurationInput = document.getElementById('long-break-duration');
const autoStartBreaksCheckbox = document.getElementById('auto-start-breaks');
const autoStartWorkCheckbox = document.getElementById('auto-start-work');
const saveSettingsBtn = document.getElementById('save-settings');
const motivationModal = document.getElementById('motivation-modal');
const motivationContent = document.getElementById('motivation-content');
const closeModalBtn = document.getElementById('close-modal');
const modeBtns = document.querySelectorAll('.mode-btn');
const progressCircle = document.querySelector('.timer-progress .progress');
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const tasksList = document.getElementById('tasks-list');
const tasksEmptyState = document.getElementById('task-empty-state');
const notification = document.getElementById('notification');
const notificationTitle = document.getElementById('notification-title');
const notificationMessage = document.getElementById('notification-message');
const notificationClose = document.getElementById('notification-close');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const soundBtn = document.getElementById('sound-btn');
const volumeSlider = document.getElementById('volume-slider');
const soundSelector = document.getElementById('sound-selector');
const tutorialBtn = document.getElementById('tutorial-btn');
const tutorialModal = document.getElementById('tutorial-modal');
const tutorialContent = document.getElementById('tutorial-content');
const tutorialNextBtn = document.getElementById('tutorial-next-btn');
const tutorialPrevBtn = document.getElementById('tutorial-prev-btn');
const tutorialCloseBtn = document.getElementById('tutorial-close-btn');

// Audio elements
const timerEndSound = document.getElementById('timer-end-sound');
const focusCompleteSound = document.getElementById('focus-complete-sound');
const breakCompleteSound = document.getElementById('break-complete-sound');
const taskCompleteSound = document.getElementById('task-complete-sound');

// Timer variables
let timerInterval;
let timeLeft = 25 * 60; // Default: 25 minutes in seconds
let totalTime = 25 * 60;
let isRunning = false;
let currentMode = 'focus';
let completedSessions = 0;
let focusSessionsBeforeLongBreak = 4;
let sessionCounter = 0;

// Stats variables
let stats = {
  sessionsCompleted: 0,
  dailyStreak: 0,
  focusMinutes: 0,
  todaysSessions: 0,
  lastSessionDate: null
};

// Settings
let settings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  autoStartBreaks: true,
  autoStartWork: false,
  soundEnabled: true,
  volume: 50,
  selectedSound: 'timer-end'
};

// Tasks array
let tasks = [];

// Motivational quotes
const motivationalQuotes = [
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { quote: "Don't wait. The time will never be just right.", author: "Napoleon Hill" },
  { quote: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { quote: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { quote: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { quote: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { quote: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Anonymous" }
];

// Tutorial steps
const tutorialSteps = [
  {
    title: "Welcome to Procrastination Timer!",
    content: "This tutorial will guide you through all the features of this productivity app. Click 'Next' to continue.",
    target: null
  },
  {
    title: "Timer Modes",
    content: "Switch between Focus, Short Break, and Long Break modes depending on your current need.",
    target: ".timer-mode-selector"
  },
  {
    title: "Timer Controls",
    content: "Start, pause, or reset your timer using these controls.",
    target: ".timer-controls"
  },
  {
    title: "Progress Tracking",
    content: "View your progress statistics including completed sessions, daily streak, and total focus minutes.",
    target: ".stats-card"
  },
  {
    title: "Customize Settings",
    content: "Adjust durations for focus and break periods to match your work style.",
    target: ".settings-card"
  },
  {
    title: "Task Management",
    content: "Add tasks to focus on during your work sessions and check them off when complete.",
    target: ".tasks-card"
  },
  {
    title: "Sound Settings",
    content: "Choose different notification sounds and adjust volume to your preference.",
    target: ".audio-controls"
  },
  {
    title: "Dark Mode",
    content: "Toggle between light and dark modes for your visual comfort.",
    target: "#dark-mode-toggle"
  },
  {
    title: "That's it!",
    content: "You're all set to boost your productivity. Happy focusing!",
    target: null
  }
];

let currentTutorialStep = 0;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  loadStats();
  loadTasks();
  updateTimerDisplay();
  updateProgressCircle(1);
  updateStatsDisplay();
  checkDarkMode();
  initializeAudio();
  checkAndUpdateStreak();

  // Set up circle stroke properties
  const circle = progressCircle;
  const radius = circle.getAttribute('r');
  const circumference = 2 * Math.PI * radius;

  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = circumference;

  // Event listeners
  startBtn.addEventListener('click', startTimer);
  pauseBtn.addEventListener('click', pauseTimer);
  resetBtn.addEventListener('click', resetTimer);
  saveSettingsBtn.addEventListener('click', saveSettings);
  closeModalBtn.addEventListener('click', closeMotivationModal);
  notificationClose.addEventListener('click', closeNotification);
  darkModeToggle.addEventListener('click', toggleDarkMode);
  soundBtn.addEventListener('click', toggleSound);
  volumeSlider.addEventListener('input', adjustVolume);
  soundSelector.addEventListener('change', changeSound);
  tutorialBtn.addEventListener('click', startTutorial);
  tutorialNextBtn.addEventListener('click', nextTutorialStep);
  tutorialPrevBtn.addEventListener('click', prevTutorialStep);
  tutorialCloseBtn.addEventListener('click', closeTutorial);

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.getAttribute('data-mode');
      resetTimer();
    });
  });

  // Tasks event listeners
  addTaskBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  });
});

// Audio initialization
function initializeAudio() {
  const audioElements = [
    timerEndSound,
    focusCompleteSound,
    breakCompleteSound,
    taskCompleteSound
  ];

  audioElements.forEach(audio => {
    audio.volume = settings.volume / 100;
    audio.addEventListener('error', () => {
      console.error(`Failed to load audio: ${audio.id}`);
      showNotification("Audio Error", `Could not load ${audio.id.replace('-', ' ')} sound`);
    });
  });
}

// Timer Functions
function startTimer() {
  if (isRunning) return;

  isRunning = true;
  startBtn.disabled = true;
  pauseBtn.disabled = false;

  timerInterval = setInterval(() => {
    timeLeft--;

    updateTimerDisplay();
    const progress = 1 - (timeLeft / totalTime);
    updateProgressCircle(progress);

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      timerComplete();
    }
  }, 1000);

  if (currentMode === 'focus') {
    timerStatus.textContent = 'Focusing...';
  } else if (currentMode === 'short-break') {
    timerStatus.textContent = 'Taking a short break...';
  } else {
    timerStatus.textContent = 'Taking a long break...';
  }
}

function pauseTimer() {
  if (!isRunning) return;

  clearInterval(timerInterval);
  isRunning = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  timerStatus.textContent = 'Paused';
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;

  if (currentMode === 'focus') {
    timeLeft = settings.focusDuration * 60;
    timerStatus.textContent = 'Ready to focus';
  } else if (currentMode === 'short-break') {
    timeLeft = settings.shortBreakDuration * 60;
    timerStatus.textContent = 'Ready for a short break';
  } else {
    timeLeft = settings.longBreakDuration * 60;
    timerStatus.textContent = 'Ready for a long break';
  }

  totalTime = timeLeft;
  updateTimerDisplay();
  updateProgressCircle(0);
}

function timerComplete() {
  if (currentMode === 'focus') {
    playSound('focus-complete');
    stats.sessionsCompleted++;
    stats.todaysSessions++;
    stats.focusMinutes += settings.focusDuration;
    stats.lastSessionDate = new Date().toDateString();
    saveStats();
    showMotivationModal();
    sessionCounter++;

    if (sessionCounter % focusSessionsBeforeLongBreak === 0) {
      switchMode('long-break');
    } else {
      switchMode('short-break');
    }

    if (settings.autoStartBreaks) {
      setTimeout(() => {
        if (!isRunning) startTimer();
      }, 500);
    }
  } else {
    playSound('break-complete');
    switchMode('focus');
    if (settings.autoStartWork) {
      setTimeout(() => {
        if (!isRunning) startTimer();
      }, 500);
    }
  }

  updateStatsDisplay();
}

function switchMode(mode) {
  currentMode = mode;
  modeBtns.forEach(btn => {
    if (btn.getAttribute('data-mode') === mode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  resetTimer();
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  document.title = `${timerDisplay.textContent} - Procrastination Timer`;
}

function updateProgressCircle(progress) {
  const circle = progressCircle;
  const radius = circle.getAttribute('r');
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  circle.style.strokeDashoffset = offset;
}

// Sound Functions
function playSound(soundType) {
  if (!settings.soundEnabled) return;
  
  let sound;
  switch(soundType) {
    case 'timer-end':
      sound = timerEndSound;
      break;
    case 'focus-complete':
      sound = focusCompleteSound;
      break;
    case 'break-complete':
      sound = breakCompleteSound;
      break;
    case 'task-complete':
      sound = taskCompleteSound;
      break;
    default:
      sound = timerEndSound;
  }

  if (!sound) {
    console.error("Sound element not found:", soundType);
    return;
  }

  sound.volume = settings.volume / 100;
  try {
    sound.currentTime = 0;
    const playPromise = sound.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error("Audio playback failed:", error);
        showNotification("Audio Error", "Could not play sound effect");
      });
    }
  } catch (error) {
    console.error("Audio error:", error);
    showNotification("Audio Error", "Sound playback issue");
  }
}

function toggleSound() {
  settings.soundEnabled = !settings.soundEnabled;
  soundBtn.querySelector('i').className = settings.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
  soundBtn.classList.toggle('active', settings.soundEnabled);
  localStorage.setItem('procrastinationTimerSettings', JSON.stringify(settings));
}

function adjustVolume() {
  settings.volume = volumeSlider.value;
  localStorage.setItem('procrastinationTimerSettings', JSON.stringify(settings));
  
  // Update all audio volumes
  [timerEndSound, focusCompleteSound, breakCompleteSound, taskCompleteSound].forEach(audio => {
    audio.volume = settings.volume / 100;
  });
}

function changeSound() {
  settings.selectedSound = soundSelector.value;
  localStorage.setItem('procrastinationTimerSettings', JSON.stringify(settings));
  if (settings.soundEnabled) {
    playSound(settings.selectedSound);
  }
}

// Settings Functions
function loadSettings() {
  const savedSettings = localStorage.getItem('procrastinationTimerSettings');
  if (savedSettings) {
    const parsedSettings = JSON.parse(savedSettings);
    settings = {
      ...settings,
      ...parsedSettings
    };

    focusDurationInput.value = settings.focusDuration;
    shortBreakDurationInput.value = settings.shortBreakDuration;
    longBreakDurationInput.value = settings.longBreakDuration;
    autoStartBreaksCheckbox.checked = settings.autoStartBreaks;
    autoStartWorkCheckbox.checked = settings.autoStartWork;
    volumeSlider.value = settings.volume;
    soundSelector.value = settings.selectedSound || 'timer-end';
    timeLeft = settings.focusDuration * 60;
    totalTime = timeLeft;

    if (settings.soundEnabled) {
      soundBtn.classList.add('active');
      soundBtn.querySelector('i').className = 'fas fa-volume-up';
    } else {
      soundBtn.classList.remove('active');
      soundBtn.querySelector('i').className = 'fas fa-volume-mute';
    }
  }
}

function saveSettings() {
  settings.focusDuration = parseInt(focusDurationInput.value) || 25;
  settings.shortBreakDuration = parseInt(shortBreakDurationInput.value) || 5;
  settings.longBreakDuration = parseInt(longBreakDurationInput.value) || 15;
  settings.autoStartBreaks = autoStartBreaksCheckbox.checked;
  settings.autoStartWork = autoStartWorkCheckbox.checked;
  settings.volume = parseInt(volumeSlider.value);
  settings.selectedSound = soundSelector.value;

  localStorage.setItem('procrastinationTimerSettings', JSON.stringify(settings));
  resetTimer();
  loadSounds();
  showNotification('Settings Saved', 'Your timer settings have been updated!');
}

// Stats Functions
function loadStats() {
  const savedStats = localStorage.getItem('procrastinationTimerStats');
  if (savedStats) {
    stats = JSON.parse(savedStats);
  }
}

function saveStats() {
  localStorage.setItem('procrastinationTimerStats', JSON.stringify(stats));
}

function updateStatsDisplay() {
  sessionsCompletedEl.textContent = stats.sessionsCompleted;
  dailyStreakEl.textContent = stats.dailyStreak;
  focusMinutesEl.textContent = stats.focusMinutes;
  todaysSessionsEl.textContent = stats.todaysSessions;
  modalSessionsCompleted.textContent = stats.sessionsCompleted;
  modalStreak.textContent = stats.dailyStreak;
}

function checkAndUpdateStreak() {
  const today = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toDateString();

  if (!stats.lastSessionDate) {
    stats.lastSessionDate = today;
    stats.dailyStreak = 0;
    stats.todaysSessions = 0;
  } else if (stats.lastSessionDate === today) {
    // Already logged today
  } else if (stats.lastSessionDate === yesterdayString) {
    stats.dailyStreak++;
    stats.todaysSessions = 0;
    stats.lastSessionDate = today;
  } else {
    stats.dailyStreak = 0;
    stats.todaysSessions = 0;
    stats.lastSessionDate = today;
  }

  saveStats();
  updateStatsDisplay();
}

// Task Functions
function loadTasks() {
  const savedTasks = localStorage.getItem('procrastinationTimerTasks');
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
    renderTasks();
  }
}

function saveTasks() {
  localStorage.setItem('procrastinationTimerTasks', JSON.stringify(tasks));
}

function addTask() {
  const taskText = taskInput.value.trim();
  if (taskText) {
    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false
    };
    tasks.push(newTask);
    taskInput.value = '';
    saveTasks();
    renderTasks();
    showNotification('Task Added', 'New focus task has been added!');
  }
}

function toggleTaskStatus(taskId) {
  const taskBefore = tasks.find(task => task.id === parseInt(taskId));
  const wasCompleted = taskBefore ? taskBefore.completed : false;
  
  tasks = tasks.map(task => {
    if (task.id === parseInt(taskId)) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });
  
  const taskAfter = tasks.find(task => task.id === parseInt(taskId));
  if (!wasCompleted && taskAfter && taskAfter.completed && settings.soundEnabled) {
    playSound('task-complete');
  }
  
  saveTasks();
  renderTasks();
}

function deleteTask(taskId) {
  tasks = tasks.filter(task => task.id !== parseInt(taskId));
  saveTasks();
  renderTasks();
  showNotification('Task Removed', 'Task has been deleted!');
}

function renderTasks() {
  if (tasks.length === 0) {
    tasksList.innerHTML = '';
    tasksEmptyState.style.display = 'block';
    return;
  }

  tasksEmptyState.style.display = 'none';
  tasksList.innerHTML = '';
  
  tasks.forEach(task => {
    const taskItem = document.createElement('li');
    taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
    taskItem.innerHTML = `
      <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
      <span class="task-text">${task.text}</span>
      <button class="task-delete" data-id="${task.id}">
        <i class="fas fa-trash-alt"></i>
      </button>
    `;
    tasksList.appendChild(taskItem);
  });

  document.querySelectorAll('.task-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      toggleTaskStatus(e.target.getAttribute('data-id'));
    });
  });

  document.querySelectorAll('.task-delete').forEach(button => {
    button.addEventListener('click', (e) => {
      deleteTask(e.target.closest('.task-delete').getAttribute('data-id'));
    });
  });
}

// UI Functions
function showMotivationModal() {
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  let contentHTML = `
    <div class="motivation-text">"${randomQuote.quote}"</div>
    <div class="quote-author">- ${randomQuote.author}</div>
  `;
  motivationContent.innerHTML = contentHTML;
  motivationModal.classList.add('active');
}

function closeMotivationModal() {
  motivationModal.classList.remove('active');
}

function showNotification(title, message) {
  notificationTitle.textContent = title;
  notificationMessage.textContent = message;
  notification.classList.add('active');
  setTimeout(() => {
    closeNotification();
  }, 5000);
}

function closeNotification() {
  notification.classList.remove('active');
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const icon = darkModeToggle.querySelector('i');
  if (document.body.classList.contains('dark-mode')) {
    icon.className = 'fas fa-sun';
    localStorage.setItem('darkMode', 'enabled');
  } else {
    icon.className = 'fas fa-moon';
    localStorage.setItem('darkMode', 'disabled');
  }
}

function checkDarkMode() {
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    darkModeToggle.querySelector('i').className = 'fas fa-sun';
  }
}

// Tutorial Functions
function startTutorial() {
  currentTutorialStep = 0;
  tutorialModal.classList.add('active');
  showTutorialStep(currentTutorialStep);
}

function showTutorialStep(stepIndex) {
  const step = tutorialSteps[stepIndex];
  const totalSteps = tutorialSteps.length;
  
  tutorialContent.innerHTML = `
    <h3>${step.title}</h3>
    <p>${step.content}</p>
    <div class="tutorial-progress">Step ${stepIndex + 1} of ${totalSteps}</div>
  `;
  
  tutorialPrevBtn.disabled = stepIndex === 0;
  tutorialNextBtn.textContent = stepIndex === totalSteps - 1 ? 'Finish' : 'Next';
  highlightTutorialTarget(step.target);
}

function highlightTutorialTarget(selector) {
  document.querySelectorAll('.tutorial-highlight').forEach(el => {
    el.classList.remove('tutorial-highlight');
  });
  
  if (selector) {
    const targetElement = document.querySelector(selector);
    if (targetElement) {
      targetElement.classList.add('tutorial-highlight');
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }
}

function nextTutorialStep() {
  if (currentTutorialStep < tutorialSteps.length - 1) {
    currentTutorialStep++;
    showTutorialStep(currentTutorialStep);
  } else {
    closeTutorial();
  }
}

function prevTutorialStep() {
  if (currentTutorialStep > 0) {
    currentTutorialStep--;
    showTutorialStep(currentTutorialStep);
  }
}

function closeTutorial() {
  tutorialModal.classList.remove('active');
  document.querySelectorAll('.tutorial-highlight').forEach(el => {
    el.classList.remove('tutorial-highlight');
  });
}