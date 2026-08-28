const STORAGE_KEY = "ishu-cute-focus-timer";

const state = {
  durationSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  pointsPerCycle: 10,
  totalPoints: 0,
  completedCycles: 0,
  pagesCompleted: 0,
  questionsCompleted: 0,
  lastResultText: "No cycle completed yet. Rooting for her! 🫶",
  isRunning: false,
  intervalId: null,
  bundledAudioLibrary: Array.isArray(window.BUNDLED_AUDIO_LIBRARY) ? window.BUNDLED_AUDIO_LIBRARY : [],
  silentMode: false,
  selectedBundledAudioPath: "",
  selectedBundledAudioName: "",
  lastPlayedAudioName: "",
  audio: null,
};

const encouragementMessages = {
  ready: "Ready for a lovely focused session? 🌸",
  running: "You got this, sweetheart — one tiny step at a time 💪💖",
  paused: "Paused for a moment. Deep breath, then back to it ✨",
  finished: "Time is up! Let the celebration audio do its magic 🎉",
};

const elements = {
  timerDisplay: document.getElementById("timerDisplay"),
  timerStateBadge: document.getElementById("timerStateBadge"),
  minutesInput: document.getElementById("minutesInput"),
  secondsInput: document.getElementById("secondsInput"),
  pointsInput: document.getElementById("pointsInput"),
  startPauseButton: document.getElementById("startPauseButton"),
  resetButton: document.getElementById("resetButton"),
  encouragementText: document.getElementById("encouragementText"),
  audioSelect: document.getElementById("audioSelect"),
  audioLibraryInfo: document.getElementById("audioLibraryInfo"),
  silentModeInput: document.getElementById("silentModeInput"),
  audioFileName: document.getElementById("audioFileName"),
  testAudioButton: document.getElementById("testAudioButton"),
  stopAudioButton: document.getElementById("stopAudioButton"),
  pointsValue: document.getElementById("pointsValue"),
  cyclesValue: document.getElementById("cyclesValue"),
  rewardValue: document.getElementById("rewardValue"),
  pagesValue: document.getElementById("pagesValue"),
  addPageButton: document.getElementById("addPageButton"),
  removePageButton: document.getElementById("removePageButton"),
  questionsValue: document.getElementById("questionsValue"),
  addQuestionButton: document.getElementById("addQuestionButton"),
  removeQuestionButton: document.getElementById("removeQuestionButton"),
  lastResultText: document.getElementById("lastResultText"),
  resetStatsButton: document.getElementById("resetStatsButton"),
  successModal: document.getElementById("successModal"),
  successYesButton: document.getElementById("successYesButton"),
  successNoButton: document.getElementById("successNoButton"),
};

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function clampNumber(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);
    const minutes = clampNumber(Number(parsed.minutes) || 25, 0, 180);
    const seconds = clampNumber(Number(parsed.seconds) || 0, 0, 59);

    state.durationSeconds = minutes * 60 + seconds;
    state.remainingSeconds = state.durationSeconds;
    state.pointsPerCycle = clampNumber(Number(parsed.pointsPerCycle) || 10, 1, 1000);
    state.totalPoints = Math.max(Number(parsed.totalPoints) || 0, 0);
    state.completedCycles = Math.max(Number(parsed.completedCycles) || 0, 0);
    state.pagesCompleted = Math.max(Number(parsed.pagesCompleted) || 0, 0);
    state.questionsCompleted = Math.max(Number(parsed.questionsCompleted) || 0, 0);
    state.lastResultText = parsed.lastResultText || state.lastResultText;
    state.silentMode = Boolean(parsed.silentMode);
    state.selectedBundledAudioPath = parsed.selectedBundledAudioPath || "";
  } catch (error) {
    console.warn("Could not load saved timer state.", error);
  }
}

function saveState() {
  const minutes = Math.floor(state.durationSeconds / 60);
  const seconds = state.durationSeconds % 60;

  const serializableState = {
    minutes,
    seconds,
    pointsPerCycle: state.pointsPerCycle,
    totalPoints: state.totalPoints,
    completedCycles: state.completedCycles,
    pagesCompleted: state.pagesCompleted,
    questionsCompleted: state.questionsCompleted,
    lastResultText: state.lastResultText,
    silentMode: state.silentMode,
    selectedBundledAudioPath: state.selectedBundledAudioPath,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializableState));
}

function syncInputsFromState() {
  elements.minutesInput.value = Math.floor(state.durationSeconds / 60);
  elements.secondsInput.value = state.durationSeconds % 60;
  elements.pointsInput.value = state.pointsPerCycle;
  elements.silentModeInput.checked = state.silentMode;
}

function getBundledAudioByPath(path) {
  return state.bundledAudioLibrary.find((item) => item.path === path) || null;
}

function ensureSelectedBundledAudio() {
  if (state.bundledAudioLibrary.length === 0) {
    state.selectedBundledAudioPath = "";
    state.selectedBundledAudioName = "";
    return;
  }

  const existingSelection = getBundledAudioByPath(state.selectedBundledAudioPath);
  if (existingSelection) {
    state.selectedBundledAudioName = existingSelection.name;
    return;
  }

  state.selectedBundledAudioPath = state.bundledAudioLibrary[0].path;
  state.selectedBundledAudioName = state.bundledAudioLibrary[0].name;
}

function populateAudioSelect() {
  elements.audioSelect.innerHTML = "";

  if (state.bundledAudioLibrary.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No audio files found";
    elements.audioSelect.append(option);
    elements.audioSelect.disabled = true;
    return;
  }

  elements.audioSelect.disabled = false;

  state.bundledAudioLibrary.forEach((audioItem) => {
    const option = document.createElement("option");
    option.value = audioItem.path;
    option.textContent = audioItem.name;
    elements.audioSelect.append(option);
  });

  ensureSelectedBundledAudio();
  elements.audioSelect.value = state.selectedBundledAudioPath;
}

function updateStatsUI() {
  elements.pointsValue.textContent = state.totalPoints;
  elements.cyclesValue.textContent = state.completedCycles;
  elements.rewardValue.textContent = `${state.pointsPerCycle} pts`;
  elements.pagesValue.textContent = state.pagesCompleted;
  elements.questionsValue.textContent = state.questionsCompleted;
  elements.lastResultText.textContent = state.lastResultText;
}

function updateTimerUI() {
  elements.timerDisplay.textContent = formatTime(state.remainingSeconds);
  elements.startPauseButton.textContent = state.isRunning ? "Pause" : "Start";

  if (state.isRunning) {
    elements.timerStateBadge.textContent = "Running";
    elements.encouragementText.textContent = encouragementMessages.running;
  } else if (state.remainingSeconds === 0) {
    elements.timerStateBadge.textContent = "Finished";
    elements.encouragementText.textContent = encouragementMessages.finished;
  } else if (state.remainingSeconds !== state.durationSeconds) {
    elements.timerStateBadge.textContent = "Paused";
    elements.encouragementText.textContent = encouragementMessages.paused;
  } else {
    elements.timerStateBadge.textContent = "Ready";
    elements.encouragementText.textContent = encouragementMessages.ready;
  }
}

function updateAudioUI() {
  const bundledCount = state.bundledAudioLibrary.length;
  if (bundledCount > 0) {
    elements.audioLibraryInfo.textContent = `${bundledCount} bundled audio clip${bundledCount === 1 ? "" : "s"} loaded from assets/audio 💿`;
  } else {
    elements.audioLibraryInfo.textContent = "No bundled audio clips found yet. Add some to assets/audio and refresh the manifest.";
  }

  if (state.silentMode) {
    elements.audioFileName.textContent = "Silent mode is ON. The timer will finish quietly 🤍";
  } else if (state.selectedBundledAudioName) {
    elements.audioFileName.textContent = `Selected looping audio: ${state.selectedBundledAudioName}`;
  } else if (state.lastPlayedAudioName) {
    elements.audioFileName.textContent = `Last played audio: ${state.lastPlayedAudioName}`;
  } else {
    elements.audioFileName.textContent = "Select an audio to preview and loop when the timer ends.";
  }
}

function getConfiguredDuration() {
  const minutes = clampNumber(Number(elements.minutesInput.value) || 0, 0, 180);
  const seconds = clampNumber(Number(elements.secondsInput.value) || 0, 0, 59);
  return minutes * 60 + seconds;
}

function applyConfiguredDuration() {
  const configuredDuration = getConfiguredDuration();
  state.durationSeconds = configuredDuration > 0 ? configuredDuration : 25 * 60;
  state.remainingSeconds = state.durationSeconds;
  syncInputsFromState();
  saveState();
  updateTimerUI();
}

function updatePointsPerCycle() {
  state.pointsPerCycle = clampNumber(Number(elements.pointsInput.value) || 10, 1, 1000);
  elements.pointsInput.value = state.pointsPerCycle;
  saveState();
  updateStatsUI();
}

function stopTimer() {
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
  state.isRunning = false;
  updateTimerUI();
}

function showSuccessModal() {
  elements.successModal.classList.remove("hidden");
  elements.successModal.setAttribute("aria-hidden", "false");
}

function hideSuccessModal() {
  elements.successModal.classList.add("hidden");
  elements.successModal.setAttribute("aria-hidden", "true");
}

function resetAfterCompletion() {
  state.remainingSeconds = state.durationSeconds;
  updateTimerUI();
}

function playFallbackChime() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }

  const audioContext = new AudioContextClass();
  const notes = [523.25, 659.25, 783.99];

  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    const startTime = audioContext.currentTime + index * 0.18;
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.25, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.25);
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.3);
  });
}

function stopCurrentAudio() {
  if (state.audio) {
    state.audio.loop = false;
    state.audio.pause();
    state.audio.currentTime = 0;
  }
}

async function playSelectedAudio(loopPlayback = false) {
  stopCurrentAudio();

  if (state.silentMode) {
    state.lastPlayedAudioName = "Silent mode";
    updateAudioUI();
    return;
  }

  ensureSelectedBundledAudio();
  const selectedAudio = getBundledAudioByPath(state.selectedBundledAudioPath);
  const playbackUrl = selectedAudio ? encodeURI(selectedAudio.path) : "";
  const playbackName = selectedAudio ? selectedAudio.name : "";

  if (!playbackUrl) {
    state.lastPlayedAudioName = "Fallback chime";
    updateAudioUI();
    playFallbackChime();
    return;
  }

  try {
    if (!state.audio) {
      state.audio = new Audio();
    }
    state.audio.src = playbackUrl;
    state.audio.loop = loopPlayback;
    state.audio.currentTime = 0;
    await state.audio.play();
    state.lastPlayedAudioName = playbackName || "Bundled audio";
    updateAudioUI();
  } catch (error) {
    console.warn("Selected audio could not be played, falling back to chime.", error);
    state.lastPlayedAudioName = "Fallback chime";
    updateAudioUI();
    playFallbackChime();
  }
}

function onTimerFinished() {
  stopTimer();
  updateTimerUI();
  playSelectedAudio(true);
  showSuccessModal();
}

function startTimer() {
  if (state.isRunning) {
    return;
  }

  if (state.remainingSeconds <= 0) {
    state.remainingSeconds = state.durationSeconds;
  }

  state.isRunning = true;
  updateTimerUI();

  state.intervalId = window.setInterval(() => {
    state.remainingSeconds -= 1;
    updateTimerUI();

    if (state.remainingSeconds <= 0) {
      state.remainingSeconds = 0;
      onTimerFinished();
    }
  }, 1000);
}

function toggleTimer() {
  if (state.isRunning) {
    stopTimer();
    return;
  }

  const configuredDuration = getConfiguredDuration();
  if (configuredDuration !== state.durationSeconds && state.remainingSeconds === state.durationSeconds) {
    applyConfiguredDuration();
  }

  if (state.durationSeconds <= 0) {
    state.durationSeconds = 25 * 60;
    state.remainingSeconds = state.durationSeconds;
    syncInputsFromState();
  }

  updatePointsPerCycle();
  startTimer();
}

function resetTimer() {
  stopTimer();
  stopCurrentAudio();
  applyConfiguredDuration();
}

function handleAudioSelection(event) {
  state.selectedBundledAudioPath = event.target.value;
  const selectedAudio = getBundledAudioByPath(state.selectedBundledAudioPath);
  state.selectedBundledAudioName = selectedAudio ? selectedAudio.name : "";
  saveState();
  updateAudioUI();
}

function stopAudioPlayback() {
  stopCurrentAudio();
  updateAudioUI();
}

function handleSilentModeChange(event) {
  state.silentMode = event.target.checked;
  saveState();
  updateAudioUI();
}

function completeCycleSucceeded() {
  stopAudioPlayback();
  hideSuccessModal();
  state.totalPoints += state.pointsPerCycle;
  state.completedCycles += 1;
  state.lastResultText = `Completed at ${new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })} — earned ${state.pointsPerCycle} sweet points 💖`;
  saveState();
  updateStatsUI();
  resetAfterCompletion();
}

function completeCycleFailed() {
  stopAudioPlayback();
  hideSuccessModal();
  state.lastResultText = `Timer ended at ${new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}, but no points were added this time 🌷`;
  saveState();
  updateStatsUI();
  resetAfterCompletion();
}

function resetStats() {
  state.totalPoints = 0;
  state.completedCycles = 0;
  state.pagesCompleted = 0;
  state.questionsCompleted = 0;
  state.lastResultText = "Stats reset. Fresh start, same cuteness 💞";
  saveState();
  updateStatsUI();
}

function addPage() {
  state.pagesCompleted += 1;
  saveState();
  updateStatsUI();
}

function removePage() {
  state.pagesCompleted = Math.max(0, state.pagesCompleted - 1);
  saveState();
  updateStatsUI();
}

function addQuestion() {
  state.questionsCompleted += 1;
  saveState();
  updateStatsUI();
}

function removeQuestion() {
  state.questionsCompleted = Math.max(0, state.questionsCompleted - 1);
  saveState();
  updateStatsUI();
}

function bindEvents() {
  elements.startPauseButton.addEventListener("click", toggleTimer);
  elements.resetButton.addEventListener("click", resetTimer);
  elements.minutesInput.addEventListener("change", applyConfiguredDuration);
  elements.secondsInput.addEventListener("change", applyConfiguredDuration);
  elements.pointsInput.addEventListener("change", updatePointsPerCycle);
  elements.silentModeInput.addEventListener("change", handleSilentModeChange);
  elements.audioSelect.addEventListener("change", handleAudioSelection);
  elements.testAudioButton.addEventListener("click", () => playSelectedAudio(false));
  elements.stopAudioButton.addEventListener("click", stopAudioPlayback);
  elements.successYesButton.addEventListener("click", completeCycleSucceeded);
  elements.successNoButton.addEventListener("click", completeCycleFailed);
  elements.addPageButton.addEventListener("click", addPage);
  elements.removePageButton.addEventListener("click", removePage);
  elements.addQuestionButton.addEventListener("click", addQuestion);
  elements.removeQuestionButton.addEventListener("click", removeQuestion);
  elements.resetStatsButton.addEventListener("click", resetStats);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.successModal.classList.contains("hidden")) {
      completeCycleFailed();
    }
  });
}

function init() {
  loadState();
  ensureSelectedBundledAudio();
  populateAudioSelect();
  syncInputsFromState();
  updateTimerUI();
  updateStatsUI();
  updateAudioUI();
  bindEvents();
}

init();