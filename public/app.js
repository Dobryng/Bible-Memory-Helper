const referenceInput = document.getElementById("referenceInput");
const difficultySelect = document.getElementById("difficultySelect");
const difficultyPicker = document.getElementById("difficultyPicker");
const modeSelect = document.getElementById("modeSelect");
const loadBtn = document.getElementById("loadBtn");
const messageBox = document.getElementById("messageBox");
const verseCard = document.getElementById("verseCard");
const verseReference = document.getElementById("verseReference");
const verseText = document.getElementById("verseText");
const practiceOptionsCard = document.getElementById("practiceOptionsCard");
const startPracticeBtn = document.getElementById("startPracticeBtn");
const clearPracticeBtn = document.getElementById("clearPracticeBtn");
const progressCard = document.getElementById("progressCard");
const progressReference = document.getElementById("progressReference");
const progressBestScore = document.getElementById("progressBestScore");
const progressAttempts = document.getElementById("progressAttempts");
const progressChart = document.getElementById("progressChart");
const progressChartEmpty = document.getElementById("progressChartEmpty");
const practiceCard = document.getElementById("practiceCard");
const practiceTitle = document.getElementById("practiceTitle");
const practiceArea = document.getElementById("practiceArea");
const checkBtn = document.getElementById("checkBtn");
const hintBtn = document.getElementById("hintBtn");
const revealBtn = document.getElementById("revealBtn");
const newTestBtn = document.getElementById("newTestBtn");
const resultCard = document.getElementById("resultCard");
const resultTitle = document.getElementById("resultTitle");
const bigScore = document.getElementById("bigScore");
const resultDetails = document.getElementById("resultDetails");
const scorePill = document.getElementById("scorePill");
const copyBtn = document.getElementById("copyBtn");
const saveBtn = document.getElementById("saveBtn");
const clearLoadedBtn = document.getElementById("clearLoadedBtn");
const savedVersesList = document.getElementById("savedVersesList");
const emptySavedText = document.getElementById("emptySavedText");
const savedSearch = document.getElementById("savedSearch");
const clearSavedBtn = document.getElementById("clearSavedBtn");
const mainColumn = document.querySelector(".main-column");
const savedCard = document.querySelector(".saved-card");

const feedbackName = document.getElementById("feedbackName");
const feedbackMessage = document.getElementById("feedbackMessage");
const submitFeedbackBtn = document.getElementById("submitFeedbackBtn");
const feedbackList = document.getElementById("feedbackList");
const feedbackStatus = document.getElementById("feedbackStatus");
const clearFeedbackBtn = document.getElementById("clearFeedbackBtn");

const STORAGE_KEY = "esvMemoryTrainerSavedVerses";
const SAVED_VERSE_HTML_VERSION = 2;

const BIBLE_BOOK_ORDER = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings",
  "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther",
  "Job", "Psalm", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon",
  "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel",
  "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum",
  "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",

  "Matthew", "Mark", "Luke", "John", "Acts", "Romans",
  "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
  "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
  "Jude", "Revelation"
];

function parseReference(reference) {
  const match = reference.match(/^(\d?\s?[A-Za-z ]+)\s+(\d+):?(\d+)?/);

  if (!match) {
    return {
      bookIndex: 999,
      chapter: 999,
      verse: 999
    };
  }

  const book = match[1].trim();
  const chapter = Number(match[2]) || 999;
  const verse = Number(match[3]) || 999;

  let bookIndex = BIBLE_BOOK_ORDER.findIndex(
    b => b.toLowerCase() === book.toLowerCase()
  );

  if (bookIndex === -1) bookIndex = 999;

  return { bookIndex, chapter, verse };
}

function sortVersesBibleOrder(verses) {
  return [...verses].sort((a, b) => {
    const refA = parseReference(a.reference);
    const refB = parseReference(b.reference);

    if (refA.bookIndex !== refB.bookIndex) {
      return refA.bookIndex - refB.bookIndex;
    }

    if (refA.chapter !== refB.chapter) {
      return refA.chapter - refB.chapter;
    }

    return refA.verse - refB.verse;
  });
}

let messageTimer = null;
let messageFadeTimer = null;

let currentVerse = "";
let currentVerseHtml = "";
let currentReference = "";
let currentWords = [];
let blankIndexes = [];
let hintCount = 0;
let attemptRecordedThisRound = false;
let savedVerses = [];
let currentVerseSaved = false;

const difficultyMap = {
  easy: 0.25,
  medium: 0.4,
  hard: 0.6,
  extreme: 0.8
};

const difficultyLabels = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  extreme: "Extreme"
};

function getSelectedDifficulty() {
  return difficultySelect ? difficultySelect.value : "medium";
}

function getSelectedDifficultyLabel() {
  return difficultyLabels[getSelectedDifficulty()] || "Medium";
}

function getPracticeMode() {
  return "blank";
}

function syncDifficultyPicker() {
  if (!difficultyPicker || !difficultySelect) return;

  const selectedDifficulty = difficultySelect.value;
  const buttons = [...difficultyPicker.querySelectorAll("[data-difficulty]")];

  buttons.forEach(button => {
    const isActive = button.dataset.difficulty === selectedDifficulty;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function showMessage(text, type = "info") {
  clearTimeout(messageTimer);
  clearTimeout(messageFadeTimer);

  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
  syncMemoryListHeight();

  messageTimer = setTimeout(() => {
    messageBox.classList.add("fade-out");

    messageFadeTimer = setTimeout(() => {
      hideMessage();
    }, 900);
  }, 1000);
}

function hideMessage() {
  clearTimeout(messageTimer);
  clearTimeout(messageFadeTimer);
  messageBox.className = "message hidden";
  messageBox.textContent = "";
  syncMemoryListHeight();

  setTimeout(() => {
    syncMemoryListHeight();
  }, 50);
}

function getMainColumnContentHeight() {
  if (!mainColumn) return 0;

  return [...mainColumn.children].reduce((total, child) => {
    if (child.classList.contains("hidden")) return total;

    const styles = window.getComputedStyle(child);
    const height = child.getBoundingClientRect().height;
    const marginTop = Number.parseFloat(styles.marginTop) || 0;
    const marginBottom = Number.parseFloat(styles.marginBottom) || 0;

    return total + height + marginTop + marginBottom;
  }, 0);
}

function syncMemoryListHeight() {
  if (!mainColumn || !savedCard) return;

  if (window.innerWidth <= 980) {
    savedCard.style.height = "";
    savedCard.style.maxHeight = "";
    return;
  }

  requestAnimationFrame(() => {
    const mainHeight = Math.round(getMainColumnContentHeight());
    savedCard.style.height = `${mainHeight}px`;
    savedCard.style.maxHeight = `${mainHeight}px`;
  });
}

function showFeedbackStatus(text, type = "info") {
  if (!feedbackStatus) return;

  feedbackStatus.textContent = text;
  feedbackStatus.className = `feedback-status ${type}`;
}

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9']/g, "")
    .trim();
}

function normalizeAnswer(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9']/g, "")
    .trim();
}

function cleanVerseText(text) {
  return text
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s+/g, "")
    .trim();
}

function getVerseOnly(text) {
  const lines = text.split("\n");

  // Remove API reference line if it appears as the first line.
  const withoutReference = lines.filter(line => {
    const clean = line.trim();
    if (!clean) return false;
    if (clean === currentReference) return false;
    if (clean.includes("Scripture quotations are from")) return false;
    if (clean.includes("Used by permission")) return false;
    return true;
  });

  return withoutReference
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}


function getPracticeVerseText(text) {
  if (currentVerseHtml) {
    return getPracticeVerseTextFromHtml(currentVerseHtml);
  }

  return getVerseOnly(text)
    // Remove verse numbers like [25], [26], [27]
    .replace(/\[[^\]]+\]/g, " ")
    // Remove standalone numbers
    .replace(/\b\d+\b/g, " ")
    // Clean spacing
    .replace(/\s+/g, " ")
    .trim();
}

function getPracticeVerseTextFromHtml(html) {
  const container = document.createElement("div");
  container.innerHTML = html || "";

  const selectorsToRemove = [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    ".heading",
    ".section-heading",
    ".chapter-heading",
    ".subheading",
    ".verse-heading",
    ".passage-heading",
    ".extra_text",
    ".chapter-num",
    ".chapter-number",
    ".footnotes",
    ".crossrefs"
  ];

  selectorsToRemove.forEach(selector => {
    container.querySelectorAll(selector).forEach(element => element.remove());
  });


  return container.textContent
    .replace(/\[[^\]]+\]/g, " ")
    .replace(/\b\d+\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeVerse(text) {
  const tokens = text.match(/[A-Za-z’'-]+|[^\sA-Za-z’'-]+|\s+/g) || [];
  return tokens.map((token, index) => ({
    token,
    index,
    isWord: /[A-Za-z]/.test(token)
  }));
}

function chooseBlankIndexes(tokens, ratio) {
  const wordTokens = tokens.filter(t => t.isWord);
  const count = Math.max(1, Math.round(wordTokens.length * ratio));
  const selected = new Set();

  while (selected.size < count && selected.size < wordTokens.length) {
    const randomWord = wordTokens[Math.floor(Math.random() * wordTokens.length)];
    selected.add(randomWord.index);
  }

  return [...selected];
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(text) {
  return escapeHtml(text).replaceAll('"', "&quot;");
}

function formatVerseNumbers(html) {
  return String(html || "").replace(/\[(\d+)\]/g, '<sup class="verse-number">$1</sup>');
}

function renderLoadedVerseText() {
  if (!verseText) return;

  if (currentVerseHtml) {
    verseText.innerHTML = currentVerseHtml;
  } else {
    verseText.innerHTML = formatVerseNumbers(escapeHtml(currentVerse));
  }
}


function loadSavedVerses() {
  try {
    savedVerses = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(savedVerses)) savedVerses = [];
  } catch {
    savedVerses = [];
  }
  renderSavedVerses();
  migrateSavedVersesToLatestHtml();
}

function persistSavedVerses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedVerses));
}

async function migrateSavedVersesToLatestHtml() {
  const versesToUpdate = savedVerses.filter(item => item.htmlVersion !== SAVED_VERSE_HTML_VERSION);

  if (!versesToUpdate.length) return;

  let updatedAnyVerse = false;

  for (const item of versesToUpdate) {
    try {
      const response = await fetch(`/api/verse?reference=${encodeURIComponent(item.reference)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not refresh saved verse.");
      }

      item.reference = data.reference || item.reference;
      item.text = cleanVerseText(data.text || item.text || "");
      item.html = data.html || item.html || "";
      item.htmlVersion = SAVED_VERSE_HTML_VERSION;
      updatedAnyVerse = true;
    } catch (error) {
      console.error(`Could not refresh saved verse: ${item.reference}`, error);
    }
  }

  if (!updatedAnyVerse) return;

  persistSavedVerses();
  renderSavedVerses();

  if (currentReference) {
    const currentSavedVerse = getCurrentSavedVerse();

    if (currentSavedVerse) {
      currentReference = currentSavedVerse.reference;
      currentVerse = currentSavedVerse.text;
      currentVerseHtml = currentSavedVerse.html || "";
      verseReference.textContent = currentReference;
      renderLoadedVerseText();
      updateSavePracticeButton();
    }
  }
}

function isCurrentVerseSaved() {
  return savedVerses.some(v => v.reference.toLowerCase() === currentReference.toLowerCase());
}

function updateSavePracticeButton() {
  if (!saveBtn) return;

  if (currentVerse && currentReference && isCurrentVerseSaved()) {
    saveBtn.textContent = "Practice";
  } else {
    saveBtn.textContent = "Save Verse";
  }
}

function getScoreClass(score) {
  if (score === null || score === undefined) return "score-neutral";
  if (score < 50) return "score-low";
  if (score < 70) return "score-mid";
  return "score-high";
}

function getAttemptsLabel(attempts) {
  if (attempts < 10) return "Just started";
  if (attempts < 50) return "Building consistency";
  return "Well practised";
}

function getScoreColor(score) {
  if (score < 50) return "#b42318";
  if (score < 70) return "#d97706";
  return "#137a4d";
}

function getDefaultDifficultyProgress() {
  return {
    bestScore: null,
    attempts: 0,
    scoreHistory: []
  };
}

function ensureDifficultyProgress(item) {
  if (!item.progressByDifficulty || typeof item.progressByDifficulty !== "object") {
    item.progressByDifficulty = {};
  }

  Object.keys(difficultyMap).forEach(difficulty => {
    if (!item.progressByDifficulty[difficulty]) {
      item.progressByDifficulty[difficulty] = getDefaultDifficultyProgress();
    }

    const progress = item.progressByDifficulty[difficulty];
    progress.bestScore = progress.bestScore === undefined ? null : progress.bestScore;
    progress.attempts = progress.attempts || 0;
    progress.scoreHistory = Array.isArray(progress.scoreHistory) ? progress.scoreHistory : [];
  });

  if (Array.isArray(item.scoreHistory) && item.scoreHistory.length && !item.progressByDifficulty.medium.scoreHistory.length) {
    item.progressByDifficulty.medium.scoreHistory = [...item.scoreHistory];
    item.progressByDifficulty.medium.attempts = item.attempts || item.scoreHistory.length;
    item.progressByDifficulty.medium.bestScore = item.bestScore === undefined ? null : item.bestScore;
  }

  return item.progressByDifficulty;
}

function getDifficultyProgress(item, difficulty = getSelectedDifficulty()) {
  const progressByDifficulty = ensureDifficultyProgress(item);
  return progressByDifficulty[difficulty] || getDefaultDifficultyProgress();
}
function drawProgressChart(scoreHistory = []) {
  if (!progressChart || !progressChartEmpty) return;

  const scores = scoreHistory.filter(score => Number.isFinite(Number(score))).map(Number);
  const caption = document.querySelector(".progress-chart-caption");
  if (caption) {
    caption.textContent = `${getSelectedDifficultyLabel()} difficulty · Attempt number vs score`;
  }

  if (!scores.length) {
    progressChart.classList.add("hidden");
    progressChartEmpty.classList.remove("hidden");
    return;
  }

  progressChart.classList.remove("hidden");
  progressChartEmpty.classList.add("hidden");

  const ctx = progressChart.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const chartWrap = progressChart.parentElement;
  const availableWidth = chartWrap ? chartWrap.clientWidth - 28 : 640;
  const width = Math.max(320, Math.round(availableWidth));
  const height = 220;

  progressChart.width = width * dpr;
  progressChart.height = height * dpr;
  progressChart.style.width = `${width}px`;
  progressChart.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const padding = { top: 18, right: 18, bottom: 34, left: 42 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  ctx.font = "12px Arial, Helvetica, sans-serif";
  ctx.lineWidth = 1;

  [0, 50, 100].forEach(value => {
    const y = padding.top + chartHeight - (value / 100) * chartHeight;
    ctx.strokeStyle = "#eadcc9";
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    ctx.fillStyle = "#786c5f";
    ctx.fillText(`${value}%`, 8, y + 4);
  });

  const getX = index => {
    if (scores.length === 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (scores.length - 1)) * chartWidth;
  };

  const getY = score => padding.top + chartHeight - (score / 100) * chartHeight;

  ctx.strokeStyle = "#6f4e37";
  ctx.lineWidth = 3;
  ctx.beginPath();
  scores.forEach((score, index) => {
    const x = getX(index);
    const y = getY(score);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  scores.forEach((score, index) => {
    const x = getX(index);
    const y = getY(score);
    ctx.fillStyle = getScoreColor(score);
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#786c5f";
    ctx.fillText(String(index + 1), x - 4, height - 10);
  });
}

function getProgressAttemptsLabelElement() {
  let label = document.getElementById("progressAttemptsLabel");

  if (!label && progressAttempts && progressAttempts.parentElement) {
    label = document.createElement("span");
    label.id = "progressAttemptsLabel";
    label.className = "progress-attempts-label";
    progressAttempts.parentElement.appendChild(label);
  }

  return label;
}

function getCurrentSavedVerse() {
  if (!currentReference) return null;
  return savedVerses.find(v => v.reference.toLowerCase() === currentReference.toLowerCase()) || null;
}

function showProgressForCurrentVerse() {
  if (!progressCard) return;

  const savedVerse = getCurrentSavedVerse();

  if (!savedVerse) {
    hideProgressCard();
    return;
  }

  progressReference.textContent = savedVerse.reference;

  const difficultyProgress = getDifficultyProgress(savedVerse);
  const bestScore = difficultyProgress.bestScore;
  progressBestScore.textContent = bestScore === null || bestScore === undefined
    ? "No score yet"
    : `${bestScore}%`;
  progressBestScore.classList.remove("score-neutral", "score-low", "score-mid", "score-high");
  progressBestScore.classList.add(getScoreClass(bestScore));

  const attempts = savedVerse.attempts || 0;
  progressAttempts.textContent = String(attempts);

  const attemptsLabel = getProgressAttemptsLabelElement();
  if (attemptsLabel) {
    attemptsLabel.textContent = getAttemptsLabel(attempts);
  }

  progressCard.classList.remove("hidden");

  requestAnimationFrame(() => {
    drawProgressChart(difficultyProgress.scoreHistory || []);
  });
}

function hideProgressCard() {
  if (!progressCard) return;
  progressCard.classList.add("hidden");
}

function handleSaveOrPracticeButton() {
  if (currentVerse && currentReference && isCurrentVerseSaved()) {
    currentVerseSaved = true;
    verseCard.classList.add("hidden");
    practiceOptionsCard.classList.remove("hidden");
    hideProgressCard();
    practiceCard.classList.add("hidden");
    resultCard.classList.add("hidden");
    scorePill.textContent = "Not checked yet";
    showMessage("Choose a difficulty, then press Start Practice.", "info");
    syncMemoryListHeight();
    return;
  }

  saveCurrentVerse();
}

function clearLoadedVerse() {
  currentVerse = "";
  currentVerseHtml = "";
  currentReference = "";
  currentWords = [];
  blankIndexes = [];
  hintCount = 0;
  attemptRecordedThisRound = false;
  currentVerseSaved = false;

  referenceInput.value = "";
  verseReference.textContent = "Reference";
  verseText.textContent = "";
  scorePill.textContent = "Not checked yet";

  verseCard.classList.add("hidden");
  practiceOptionsCard.classList.add("hidden");
  hideProgressCard();
  practiceCard.classList.add("hidden");
  resultCard.classList.add("hidden");

  hideMessage();
  updateSavePracticeButton();
  syncMemoryListHeight();
}

function clearPractice() {
  practiceCard.classList.add("hidden");
  resultCard.classList.add("hidden");
  hideProgressCard();
  practiceArea.innerHTML = "";
  scorePill.textContent = "Not checked yet";
  hintCount = 0;
  attemptRecordedThisRound = false;
  checkBtn.disabled = false;
  syncMemoryListHeight();
}

function saveCurrentVerse() {
  if (!currentVerse || !currentReference) {
    showMessage("Load a verse before saving.", "error");
    return;
  }

  const key = currentReference.toLowerCase();
  const existingIndex = savedVerses.findIndex(v => v.reference.toLowerCase() === key);

  const verseRecord = {
    id: existingIndex >= 0 ? savedVerses[existingIndex].id : crypto.randomUUID(),
    reference: currentReference,
    text: currentVerse,
    html: currentVerseHtml,
    savedAt: new Date().toISOString(),
    bestScore: existingIndex >= 0 ? savedVerses[existingIndex].bestScore || null : null,
    attempts: existingIndex >= 0 ? savedVerses[existingIndex].attempts || 0 : 0,
    scoreHistory: existingIndex >= 0 ? savedVerses[existingIndex].scoreHistory || [] : [],
    progressByDifficulty: existingIndex >= 0 ? savedVerses[existingIndex].progressByDifficulty || {} : {},
    htmlVersion: SAVED_VERSE_HTML_VERSION
  };

  ensureDifficultyProgress(verseRecord);

  if (existingIndex >= 0) {
    savedVerses[existingIndex] = verseRecord;
    showMessage(`${currentReference} updated in your saved verses. Practice options are now available.`, "info");
  } else {
    savedVerses.unshift(verseRecord);
    showMessage(`${currentReference} saved. Choose your practice options below.`, "info");
  }

  currentVerseSaved = true;
  practiceOptionsCard.classList.add("hidden");
  persistSavedVerses();
  renderSavedVerses();
  updateSavePracticeButton();
  hideProgressCard();
  syncMemoryListHeight();
}

function renderSavedVerses() {
  const query = normalize(savedSearch.value || "");
  const filtered = savedVerses.filter(item => {
    if (!query) return true;
    return normalize(item.reference).includes(query) || normalize(item.text).includes(query);
  });

  emptySavedText.classList.toggle("hidden", filtered.length > 0);
  savedVersesList.innerHTML = "";

  sortVersesBibleOrder(filtered).forEach(item => {
    const div = document.createElement("div");
    div.className = "saved-item";

    const preview = getVerseOnlyFromSaved(item).slice(0, 130);
    const difficultyProgress = getDifficultyProgress(item);
    const scoreText = difficultyProgress.bestScore === null || difficultyProgress.bestScore === undefined
      ? "No score yet"
      : `Best: ${difficultyProgress.bestScore}%`;
    const attemptsText = item.attempts || 0;

    div.innerHTML = `
      <div class="saved-ref">${escapeHtml(item.reference)}</div>
      <div class="saved-preview">${escapeHtml(preview)}${preview.length >= 130 ? "..." : ""}</div>
      <div class="saved-preview">${scoreText} · Attempts: ${attemptsText}</div>
      <div class="saved-actions">
        <button data-action="practice" data-id="${escapeAttr(item.id)}">Practice</button>
        <button data-action="load" data-id="${escapeAttr(item.id)}">Load</button>
        <button data-action="delete" data-id="${escapeAttr(item.id)}" class="danger">Delete</button>
      </div>
    `;

    savedVersesList.appendChild(div);
  });
}

function getVerseOnlyFromSaved(item) {
  const oldRef = currentReference;
  currentReference = item.reference;
  const verseOnly = getVerseOnly(item.text);
  currentReference = oldRef;
  return verseOnly;
}

function loadSavedVerse(id, shouldStartPractice = true) {
  const item = savedVerses.find(v => v.id === id);
  if (!item) return;

  currentReference = item.reference;
  currentVerse = item.text;
  currentVerseHtml = item.html || "";
  currentVerseSaved = true;
  referenceInput.value = item.reference;
  verseReference.textContent = currentReference;
  renderLoadedVerseText();
  verseCard.classList.remove("hidden");
  updateSavePracticeButton();

  practiceOptionsCard.classList.add("hidden");
  hideProgressCard();
  practiceCard.classList.add("hidden");
  resultCard.classList.add("hidden");

  if (shouldStartPractice) {
    verseCard.classList.add("hidden");
    practiceOptionsCard.classList.remove("hidden");
    hideProgressCard();
    practiceCard.classList.add("hidden");
    resultCard.classList.add("hidden");
    scorePill.textContent = "Not checked yet";
    showMessage(`${currentReference} loaded. Choose a difficulty, then press Start Practice.`, "info");
    syncMemoryListHeight();
  } else {
    showMessage(`${currentReference} loaded from saved verses.`, "info");
    syncMemoryListHeight();
  }
}

function deleteSavedVerse(id) {
  savedVerses = savedVerses.filter(v => v.id !== id);
  persistSavedVerses();
  renderSavedVerses();
  showMessage("Verse removed from saved list.", "info");
  syncMemoryListHeight();
}

function updateSavedVerseScore(percent) {
  if (!currentReference) return;

  const index = savedVerses.findIndex(v => v.reference.toLowerCase() === currentReference.toLowerCase());
  if (index < 0) return;

  const item = savedVerses[index];
  item.attempts = (item.attempts || 0) + 1;
  item.bestScore = Math.max(item.bestScore || 0, percent);
  item.scoreHistory = Array.isArray(item.scoreHistory) ? item.scoreHistory : [];
  item.scoreHistory.push(percent);

  const difficulty = getSelectedDifficulty();
  const difficultyProgress = getDifficultyProgress(item, difficulty);
  difficultyProgress.attempts = (difficultyProgress.attempts || 0) + 1;
  difficultyProgress.bestScore = Math.max(difficultyProgress.bestScore || 0, percent);
  difficultyProgress.scoreHistory.push(percent);
  item.progressByDifficulty[difficulty] = difficultyProgress;

  savedVerses[index] = item;
  persistSavedVerses();
  renderSavedVerses();
  showProgressForCurrentVerse();
}

function createTest() {
  if (!currentVerseSaved && !isCurrentVerseSaved()) {
    showMessage("Save the verse first before starting practice.", "error");
    return;
  }

  verseCard.classList.add("hidden");
  practiceOptionsCard.classList.add("hidden");
  hideProgressCard();
  resultCard.classList.add("hidden");
  practiceCard.classList.remove("hidden");
  scorePill.textContent = "Not checked yet";
  hintCount = 0;
  attemptRecordedThisRound = false;
  checkBtn.disabled = false;

  const mode = getPracticeMode();
  const memoryText = getPracticeVerseText(currentVerse);
  currentWords = tokenizeVerse(memoryText);

  if (mode === "blank") {
    practiceTitle.textContent = "Fill in the missing words";
    const ratio = difficultyMap[difficultySelect.value] || 0.4;
    blankIndexes = chooseBlankIndexes(currentWords, ratio);

    practiceArea.innerHTML = currentWords.map(part => {
      if (!part.isWord) return escapeHtml(part.token);

      if (blankIndexes.includes(part.index)) {
        const width = Math.max(70, Math.min(180, part.token.length * 16));
        return `<input class="blank-input" data-answer="${escapeAttr(part.token)}" style="width:${width}px" autocomplete="off" />`;
      }

      return escapeHtml(part.token);
    }).join("");
  }

  if (mode === "first-letter") {
    practiceTitle.textContent = "Use the first-letter hints";
    const hintLine = currentWords.map(part => {
      if (!part.isWord) return part.token;
      return part.token[0];
    }).join("");

    practiceArea.innerHTML = `
      <span class="first-letter-line">${escapeHtml(hintLine)}</span>
      <textarea id="fullRecallInput" class="full-recall-box" placeholder="Type the verse from memory, without the reference..."></textarea>
    `;
  }

  if (mode === "full-recall") {
    practiceTitle.textContent = "Type the verse from memory";
    practiceArea.innerHTML = `
      <textarea id="fullRecallInput" class="full-recall-box" placeholder="Type the verse from memory, without the reference..."></textarea>
    `;
  }

  syncMemoryListHeight();
}

async function loadVerse() {
  const reference = referenceInput.value.trim();

  if (!reference) {
    showMessage("Enter a Bible reference first, for example John 3:16.", "error");
    return;
  }

  loadBtn.disabled = true;
  loadBtn.textContent = "Loading...";
  hideMessage();

  try {
    const response = await fetch(`/api/verse?reference=${encodeURIComponent(reference)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not load verse.");
    }

    currentVerse = cleanVerseText(data.text);
    currentVerseHtml = data.html || "";
    currentReference = data.reference || reference;
    currentVerseSaved = false;

    verseReference.textContent = currentReference;
    renderLoadedVerseText();

    verseCard.classList.remove("hidden");
    practiceOptionsCard.classList.add("hidden");
    hideProgressCard();
    practiceCard.classList.add("hidden");
    resultCard.classList.add("hidden");
    updateSavePracticeButton();

    if (isCurrentVerseSaved()) {
      currentVerseSaved = true;
      practiceOptionsCard.classList.add("hidden");
      hideProgressCard();
      updateSavePracticeButton();
      showMessage("This verse is already saved. Press Practice when you are ready.", "info");
    } else {
      hideProgressCard();
      showMessage("Verse loaded. Save it first before practising.", "info");
    }

    syncMemoryListHeight();
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    loadBtn.disabled = false;
    loadBtn.textContent = "Load Verse";
  }
}

function checkBlankAnswers() {
  const inputs = [...practiceArea.querySelectorAll(".blank-input")];
  if (attemptRecordedThisRound) {
    showMessage("This attempt has already been recorded. Click New Test to try again.", "info");
    return;
  }
  let correct = 0;

  inputs.forEach(input => {
    const expected = normalizeAnswer(input.dataset.answer);
    const actual = normalizeAnswer(input.value);

    input.classList.remove("correct", "wrong", "revealed", "corrected");

    if (actual && actual === expected) {
      input.classList.add("correct");
      correct++;
    } else {
      input.value = input.dataset.answer || "";
      input.classList.add("corrected");
    }

    input.disabled = true;
  });

  attemptRecordedThisRound = true;
  checkBtn.disabled = true;

  const percent = Math.round((correct / inputs.length) * 100);
  showResult(percent, `${correct} out of ${inputs.length} blanks correct.`);
}

function checkFullRecall() {
  const input = document.getElementById("fullRecallInput");
  if (attemptRecordedThisRound) {
    showMessage("This attempt has already been recorded. Click New Test to try again.", "info");
    return;
  }
  const expectedWords = getPracticeVerseText(currentVerse).split(/\s+/).filter(Boolean);
  const actualWords = input.value.split(/\s+/).filter(Boolean);

  let correct = 0;
  const max = expectedWords.length;

  const comparison = expectedWords.map((word, i) => {
    const actual = actualWords[i] || "";
    const ok = normalizeAnswer(actual) === normalizeAnswer(word);

    if (ok) correct++;

    return `<span class="word ${ok ? "correct" : "missing"}">${escapeHtml(word)}</span>`;
  }).join(" ");

  attemptRecordedThisRound = true;
  checkBtn.disabled = true;

  const percent = Math.round((correct / max) * 100);
  showResult(percent, `${correct} out of ${max} words matched in order.`);
  resultDetails.innerHTML += `
    <div style="margin-top:14px">
      <strong>Verse answer:</strong>
      <p style="line-height:1.9">${comparison}</p>
    </div>
  `;
}

function showResult(percent, detail) {
  resultCard.classList.remove("hidden");
  bigScore.textContent = `${percent}%`;
  scorePill.textContent = `${percent}%`;
  resultTitle.textContent = percent >= 90 ? "Strong memory!" : percent >= 70 ? "Almost there" : "Keep practising";
  resultDetails.innerHTML = `
    <p>${escapeHtml(detail)}</p>
    <p>${percent >= 90 ? "Great job — you reached the 90% mastery target." : "Try again, use hints, or reduce the difficulty for one round."}</p>
  `;
  updateSavedVerseScore(percent);
  syncMemoryListHeight();
}

function revealVerse() {
  const mode = getPracticeMode();

  if (mode === "blank") {
    const inputs = [...practiceArea.querySelectorAll(".blank-input")];

    inputs.forEach(input => {
      input.value = input.dataset.answer || "";
      input.classList.remove("correct", "wrong", "corrected");
      input.classList.add("revealed");
      input.disabled = true;
    });

    scorePill.textContent = "Revealed";
    resultCard.classList.add("hidden");
    checkBtn.disabled = true;
    syncMemoryListHeight();
    return;
  }

  const input = document.getElementById("fullRecallInput");
  if (input) {
    input.value = getPracticeVerseText(currentVerse);
    input.classList.add("revealed");
    input.disabled = true;
  }

  scorePill.textContent = "Revealed";
  resultCard.classList.add("hidden");
  checkBtn.disabled = true;
}

function showHint() {
  const mode = getPracticeMode();

  if (mode === "blank") {
    const inputs = [...practiceArea.querySelectorAll(".blank-input")];
    const emptyInputs = inputs.filter(input => !input.value.trim());

    if (emptyInputs.length === 0) {
      showMessage("No empty blanks left for a hint.", "info");
      return;
    }

    const input = emptyInputs[0];
    const answer = input.dataset.answer || "";
    input.value = answer;
    input.classList.remove("correct", "wrong", "corrected");
    input.classList.add("revealed");
    input.disabled = true;
    hintCount++;
    showMessage(`Hint used: one word revealed. Hints used this round: ${hintCount}.`, "info");
    return;
  }

  const input = document.getElementById("fullRecallInput");
  const words = getPracticeVerseText(currentVerse).split(/\s+/);
  const typedCount = input.value.trim() ? input.value.trim().split(/\s+/).length : 0;
  const nextWord = words[typedCount];

  if (!nextWord) {
    showMessage("No more hint words available.", "info");
    return;
  }

  input.value = `${input.value}${input.value.trim() ? " " : ""}${nextWord}`;
  input.focus();
  hintCount++;
  showMessage(`Hint used: one word revealed. Hints used this round: ${hintCount}.`, "info");
}

function checkAnswer() {
  if (!currentVerse) {
    showMessage("Load and save a verse first.", "error");
    return;
  }

  checkBlankAnswers();
}

async function copyVerse() {
  if (!currentVerse) return;
  await navigator.clipboard.writeText(`${currentReference}\n${currentVerse}`);
  showMessage("Verse copied to clipboard.", "info");
}

loadBtn.addEventListener("click", loadVerse);
referenceInput.addEventListener("keydown", event => {
  if (event.key === "Enter") loadVerse();
});
saveBtn.addEventListener("click", handleSaveOrPracticeButton);
if (clearLoadedBtn) {
  clearLoadedBtn.addEventListener("click", clearLoadedVerse);
}
startPracticeBtn.addEventListener("click", createTest);
if (clearPracticeBtn) {
  clearPracticeBtn.addEventListener("click", clearPractice);
}
checkBtn.addEventListener("click", checkAnswer);
hintBtn.addEventListener("click", showHint);
revealBtn.addEventListener("click", revealVerse);
newTestBtn.addEventListener("click", createTest);
copyBtn.addEventListener("click", copyVerse);
savedSearch.addEventListener("input", renderSavedVerses);

savedVersesList.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;

  if (action === "practice") loadSavedVerse(id, true);
  if (action === "load") loadSavedVerse(id, false);
  if (action === "delete") deleteSavedVerse(id);
});

if (clearSavedBtn) {
  clearSavedBtn.addEventListener("click", () => {
    if (!confirm("Clear all saved verses?")) return;
    savedVerses = [];
    persistSavedVerses();
    renderSavedVerses();
    showMessage("All saved verses cleared.", "info");
    syncMemoryListHeight();
  });
}

difficultySelect.addEventListener("change", () => {
  syncDifficultyPicker();
  resultCard.classList.add("hidden");
  hideProgressCard();
  practiceCard.classList.add("hidden");
  syncMemoryListHeight();
});

if (difficultyPicker) {
  difficultyPicker.addEventListener("click", event => {
    const button = event.target.closest("[data-difficulty]");
    if (!button) return;

    difficultySelect.value = button.dataset.difficulty;
    difficultySelect.dispatchEvent(new Event("change"));
  });
}

if (modeSelect) {
  modeSelect.addEventListener("change", () => {
    practiceCard.classList.add("hidden");
    resultCard.classList.add("hidden");
  });
}

async function loadFeedbacks() {
  if (!feedbackList) return;

  try {
    const response = await fetch(`${window.location.origin}/api/feedback`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not load feedback.");
    }

    renderFeedbacks(data.feedbacks || []);
  } catch (error) {
    console.error(error);
    feedbackList.innerHTML = `
      <div class="feedback-item">
        <div class="feedback-message">Could not load feedback.</div>
      </div>
    `;
  }
}

function renderFeedbacks(feedbacks) {
  if (!feedbackList) return;

  if (!feedbacks.length) {
    feedbackList.innerHTML = `
      <div class="feedback-item">
        <div class="feedback-message">No feedback yet.</div>
      </div>
    `;
    return;
  }

  feedbackList.innerHTML = feedbacks.map(item => {
    const date = new Date(item.createdAt).toLocaleString();

    return `
      <div class="feedback-item">
        <div class="feedback-name">${escapeHtml(item.name)}</div>
        <div class="feedback-message">${escapeHtml(item.message)}</div>
        <div class="feedback-date">${escapeHtml(date)}</div>
      </div>
    `;
  }).join("");
}

async function submitFeedback() {
  if (!feedbackName || !feedbackMessage || !submitFeedbackBtn) return;

  const name = feedbackName.value.trim();
  const message = feedbackMessage.value.trim();

  if (!message) {
    showFeedbackStatus("Please type your feedback before submitting.", "error");
    return;
  }

  submitFeedbackBtn.disabled = true;
  submitFeedbackBtn.textContent = "Submitting...";

  try {
    const response = await fetch(`${window.location.origin}/api/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, message })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not submit feedback.");
    }

    feedbackMessage.value = "";
    feedbackName.value = "";
    showFeedbackStatus("Feedback submitted. Thank you!", "info");
    loadFeedbacks();
  } catch (error) {
    console.error(error);
    showFeedbackStatus("Feedback could not be submitted. Please check the feedback API setup.", "error");
  } finally {
    submitFeedbackBtn.disabled = false;
    submitFeedbackBtn.textContent = "Submit Feedback";
  }
}

async function clearFeedbacks() {
  if (!clearFeedbackBtn) return;

  if (!confirm("Clear all submitted feedback?")) return;

  clearFeedbackBtn.disabled = true;
  clearFeedbackBtn.textContent = "Clearing...";

  try {
    const response = await fetch(`${window.location.origin}/api/feedback/clear`, {
      method: "POST"
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not clear feedback.");
    }

    showFeedbackStatus("All feedback cleared.", "info");
    loadFeedbacks();
  } catch (error) {
    console.error(error);
    showFeedbackStatus("Feedback could not be cleared. Please check the feedback API setup.", "error");
  } finally {
    clearFeedbackBtn.disabled = false;
    clearFeedbackBtn.textContent = "Clear Feedback";
  }
}

if (submitFeedbackBtn) {
  submitFeedbackBtn.addEventListener("click", submitFeedback);
}

if (clearFeedbackBtn) {
  clearFeedbackBtn.addEventListener("click", clearFeedbacks);
}

window.addEventListener("resize", syncMemoryListHeight);

referenceInput.value = "";
syncDifficultyPicker();
loadSavedVerses();
loadFeedbacks();
syncMemoryListHeight();
