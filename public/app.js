const referenceInput = document.getElementById("referenceInput");
const bookSelect = document.getElementById("bookSelect");
const versionSelect = document.getElementById("versionSelect");
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
const scorePill = document.getElementById("scorePill");
const copyBtn = document.getElementById("copyBtn");
const saveBtn = document.getElementById("saveBtn");
const saveSelectionBtn = document.getElementById("saveSelectionBtn");
const selectionSaveHint = document.getElementById("selectionSaveHint");
const clearLoadedBtn = document.getElementById("clearLoadedBtn");
const savedVersesList = document.getElementById("savedVersesList");
const emptySavedText = document.getElementById("emptySavedText");
const savedSearch = document.getElementById("savedSearch");
const clearSavedBtn = document.getElementById("clearSavedBtn");
const mainColumn = document.querySelector(".main-column");
const savedCard = document.querySelector(".saved-card");
const dashboardCard = document.getElementById("dashboardCard");
const dashboardFocusReference = document.getElementById("dashboardFocusReference");
const dashboardFocusMessage = document.getElementById("dashboardFocusMessage");
const dashboardPracticeBtn = document.getElementById("dashboardPracticeBtn");
const dashboardSavedCount = document.getElementById("dashboardSavedCount");
const dashboardTotalAttempts = document.getElementById("dashboardTotalAttempts");
const dashboardAverageScore = document.getElementById("dashboardAverageScore");
const dashboardUnpractisedCount = document.getElementById("dashboardUnpractisedCount");

const verseOfTheDayReference = document.getElementById("verseOfTheDayReference");
const verseOfTheDayText = document.getElementById("verseOfTheDayText");
const saveVerseOfTheDayBtn = document.getElementById("saveVerseOfTheDayBtn");
const loadVerseOfTheDayBtn = document.getElementById("loadVerseOfTheDayBtn");

const feedbackName = document.getElementById("feedbackName");
const feedbackMessage = document.getElementById("feedbackMessage");
const submitFeedbackBtn = document.getElementById("submitFeedbackBtn");
const feedbackList = document.getElementById("feedbackList");
const feedbackStatus = document.getElementById("feedbackStatus");
const clearFeedbackBtn = document.getElementById("clearFeedbackBtn");
const newTestBtn = document.getElementById("newTestBtn");

const selectedVerseCount = document.getElementById("selectedVerseCount");
const startSequenceBtn = document.getElementById("startSequenceBtn");
const clearSequenceSelectionBtn = document.getElementById("clearSequenceSelectionBtn");
const sequenceStatus = document.getElementById("sequenceStatus");
const nextSequenceBtn = document.getElementById("nextSequenceBtn");
const endSequenceBtn = document.getElementById("endSequenceBtn");

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

function shuffleArray(items) {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function getVersionDisplayForSavedItem(item) {
  return item.version || item.versionLabel || "ESV";
}

// Helper to check if sequence practice is currently active
function isSequencePracticeActive() {
  return sequenceQueue.length > 0 && sequenceIndex >= 0;
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
let selectedVerseReferences = [];
let verseOfTheDayData = null;
let selectedSavedVerseIds = new Set();
let sequenceQueue = [];
let sequenceIndex = -1;
let sequenceScores = [];


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
    savedCard.style.removeProperty("height");
    savedCard.style.removeProperty("max-height");
    savedCard.style.removeProperty("--memory-list-height");
    return;
  }

  requestAnimationFrame(() => {
    const mainContentHeight = Math.round(getMainColumnContentHeight());
    const targetHeight = `${Math.max(mainContentHeight, 360)}px`;

    savedCard.style.setProperty("--memory-list-height", targetHeight);
    savedCard.style.height = targetHeight;
    savedCard.style.maxHeight = targetHeight;
  });
}

// Scroll to top of app helper
function scrollToTopOfApp() {
  requestAnimationFrame(() => {
    referenceInput.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
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
    ".s",
    ".s1",
    ".s2",
    ".s3",
    ".r",
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

function getPracticeReferenceParts(reference) {
  const cleanReference = String(reference || "").trim();
  const match = cleanReference.match(/^(.*?)(\d+[:\d\s,–—-]*)$/);

  if (!match) {
    return {
      book: cleanReference,
      numbers: ""
    };
  }

  return {
    book: match[1].trim(),
    numbers: match[2].trim()
  };
}

function getReferenceNumbersAnswer(referenceNumbers) {
  return String(referenceNumbers || "").replace(/\D/g, "");
}

function buildReferenceNumberPracticeHtml(referenceNumbers) {
  return String(referenceNumbers || "")
    .split(/(\d+)/g)
    .filter(part => part.length > 0)
    .map(part => {
      if (/^\d+$/.test(part)) {
        const width = Math.max(64, Math.min(180, part.length * 34 + 16));
        return `<input class="blank-input reference-blank-input" data-answer="${escapeAttr(part)}" style="width:${width}px" autocomplete="off" inputmode="numeric" />`;
      }

      return `<span class="reference-punctuation">${escapeHtml(part)}</span>`;
    })
    .join("");
}

function removePassageHeadingsFromHtml(html) {
  const container = document.createElement("div");
  container.innerHTML = html || "";

  const headingSelectors = [
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
    ".s",
    ".s1",
    ".s2",
    ".s3",
    ".r"
  ];

  headingSelectors.forEach(selector => {
    container.querySelectorAll(selector).forEach(element => element.remove());
  });

  return container.innerHTML.trim();
}

function removeKnownHeadingText(text) {
  const headingTexts = [];

  savedVerses.forEach(item => {
    if (getVerseVersionKey(item) !== String(getSelectedVersion() || "ESV").trim().toUpperCase()) return;
    if (!item.html) return;

    const container = document.createElement("div");
    container.innerHTML = item.html;

    const headingSelectors = [
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
      ".s",
      ".s1",
      ".s2",
      ".s3",
      ".r"
    ];

    headingSelectors.forEach(selector => {
      container.querySelectorAll(selector).forEach(element => {
        const heading = element.textContent.trim().replace(/\s+/g, " ");
        if (heading) headingTexts.push(heading);
      });
    });
  });

  return headingTexts.reduce((cleanText, heading) => {
    return cleanText.replaceAll(heading, " ");
  }, text).replace(/\s+/g, " ").trim();
}

function tokenizeVerse(text) {
  const tokens = text.match(/[A-Za-z0-9:–—-]+|[^\sA-Za-z0-9:–—-]+|\s+/g) || [];
  return tokens.map((token, index) => ({
    token,
    index,
    isWord: /[A-Za-z0-9]/.test(token)
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

// Helper functions for blank input navigation
function moveBlankFocus(currentInput, direction) {
  const inputs = [...practiceArea.querySelectorAll(".blank-input")];
  const currentIndex = inputs.indexOf(currentInput);

  if (currentIndex === -1) return;

  const nextIndex = currentIndex + direction;
  const nextInput = inputs[nextIndex];

  if (!nextInput || nextInput.disabled) return;

  nextInput.focus();
  nextInput.select();
}

function handleBlankInputKeydown(event) {
  const input = event.target;

  if (!input.classList.contains("blank-input")) return;

  if (event.key === " " || event.key === "Spacebar") {
    event.preventDefault();
    moveBlankFocus(input, 1);
    return;
  }

  if (event.key === "Backspace" && input.selectionStart === 0 && input.selectionEnd === 0) {
    event.preventDefault();
    moveBlankFocus(input, -1);
  }
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

function getSelectedVersion() {
  return versionSelect ? String(versionSelect.value || "ESV").trim() : "ESV";
}

async function loadBibleVersions() {
  if (!versionSelect) return;

  try {
    const response = await fetch("/api/bible-versions");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not load Bible versions.");
    }

    const versions = Array.isArray(data.versions) ? data.versions : [];

    versionSelect.innerHTML = versions.map(version => {
      const value = version.source === "esv" ? "ESV" : version.id;
      const abbreviation = version.displayAbbreviation || version.abbreviation || value;
      const title = version.title || abbreviation;
      const selected = value === "ESV" ? " selected" : "";

      return `<option value="${escapeAttr(value)}"${selected}>${escapeHtml(abbreviation)} — ${escapeHtml(title)}</option>`;
    }).join("");
    loadVerseOfTheDay();
  } catch (error) {
    console.error(error);
    versionSelect.innerHTML = `<option value="ESV" selected>ESV — English Standard Version</option>`;
  }
}

function getVerseVersionKey(data) {
  return String(data?.versionId || data?.version || "ESV").trim().toUpperCase();
}

function findSavedVerseIndexByReferenceAndVersion(reference, versionKey) {
  const cleanReference = String(reference || "").toLowerCase();
  const cleanVersionKey = String(versionKey || "ESV").trim().toUpperCase();

  return savedVerses.findIndex(item => {
    const itemReference = String(item.reference || "").toLowerCase();
    const itemVersionKey = getVerseVersionKey(item);
    return itemReference === cleanReference && itemVersionKey === cleanVersionKey;
  });
}

function isVerseDataSaved(data) {
  if (!data?.reference) return false;
  return findSavedVerseIndexByReferenceAndVersion(data.reference, getVerseVersionKey(data)) >= 0;
}

function createSavedVerseRecordFromData(data, existingItem = null) {
  return {
    id: existingItem?.id || crypto.randomUUID(),
    reference: data.reference,
    version: data.version || "ESV",
    versionId: data.versionId || data.version || "ESV",
    versionLabel: data.versionLabel || data.version || "English Standard Version",
    text: cleanVerseText(data.text || ""),
    html: data.html || "",
    savedAt: existingItem?.savedAt || new Date().toISOString(),
    bestScore: existingItem?.bestScore || null,
    attempts: existingItem?.attempts || 0,
    scoreHistory: existingItem?.scoreHistory || [],
    progressByDifficulty: existingItem?.progressByDifficulty || {},
    htmlVersion: SAVED_VERSE_HTML_VERSION
  };
}

function upsertSavedVerseFromData(data) {
  if (!data?.reference || !data?.text) return false;

  const existingIndex = findSavedVerseIndexByReferenceAndVersion(data.reference, getVerseVersionKey(data));
  const existingItem = existingIndex >= 0 ? savedVerses[existingIndex] : null;
  const verseRecord = createSavedVerseRecordFromData(data, existingItem);

  ensureDifficultyProgress(verseRecord);

  if (existingIndex >= 0) {
    savedVerses[existingIndex] = verseRecord;
  } else {
    savedVerses.unshift(verseRecord);
  }

  persistSavedVerses();
  renderSavedVerses();
  updateDashboard();
  return true;
}

function renderVerseOfTheDay() {
  if (!verseOfTheDayReference || !verseOfTheDayText) return;

  if (!verseOfTheDayData) {
    verseOfTheDayReference.textContent = "Loading today’s verse...";
    verseOfTheDayText.textContent = "Preparing a verse for today.";
    if (saveVerseOfTheDayBtn) saveVerseOfTheDayBtn.classList.add("hidden");
    if (loadVerseOfTheDayBtn) loadVerseOfTheDayBtn.classList.add("hidden");
    return;
  }

  verseOfTheDayReference.textContent = `${verseOfTheDayData.reference} · ${verseOfTheDayData.version || "ESV"}`;
  const verseOfTheDayHtml = verseOfTheDayData.html
    ? removePassageHeadingsFromHtml(verseOfTheDayData.html)
    : "";

  verseOfTheDayText.innerHTML = verseOfTheDayHtml
    ? formatVerseNumbers(verseOfTheDayHtml)
    : formatVerseNumbers(escapeHtml(verseOfTheDayData.text || ""));

  const alreadySaved = isVerseDataSaved(verseOfTheDayData);

  if (saveVerseOfTheDayBtn) {
    saveVerseOfTheDayBtn.classList.toggle("hidden", alreadySaved);
    saveVerseOfTheDayBtn.textContent = alreadySaved ? "Saved" : "Save Verse of the Day";
  }

  if (loadVerseOfTheDayBtn) {
    loadVerseOfTheDayBtn.classList.remove("hidden");
  }
}

async function loadVerseOfTheDay() {
  if (!verseOfTheDayReference || !verseOfTheDayText) return;

  try {
    verseOfTheDayReference.textContent = "Loading today’s verse...";
    verseOfTheDayText.textContent = "Preparing a verse for today.";

    const selectedVersion = getSelectedVersion();
    const response = await fetch(`/api/verse-of-the-day?version=${encodeURIComponent(selectedVersion)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not load verse of the day.");
    }

    verseOfTheDayData = data;
    renderVerseOfTheDay();
    syncMemoryListHeight();
  } catch (error) {
    console.error(error);
    verseOfTheDayReference.textContent = "Verse of the Day unavailable";
    verseOfTheDayText.textContent = error.message;
    if (saveVerseOfTheDayBtn) saveVerseOfTheDayBtn.classList.add("hidden");
    if (loadVerseOfTheDayBtn) loadVerseOfTheDayBtn.classList.add("hidden");
    syncMemoryListHeight();
  }
}

function saveVerseOfTheDay() {
  if (!verseOfTheDayData) {
    showMessage("Verse of the Day is still loading.", "error");
    return;
  }

  const saved = upsertSavedVerseFromData(verseOfTheDayData);

  if (saved) {
    showMessage(`${verseOfTheDayData.reference} saved from Verse of the Day.`, "info");
    renderVerseOfTheDay();
    syncMemoryListHeight();
  }
}

function loadVerseOfTheDayIntoMainView() {
  if (!verseOfTheDayData) {
    showMessage("Verse of the Day is still loading.", "error");
    return;
  }

  currentVerse = cleanVerseText(verseOfTheDayData.text || "");
  currentVerseHtml = verseOfTheDayData.html || "";
  currentReference = verseOfTheDayData.reference || "";
  currentVerseSaved = isVerseDataSaved(verseOfTheDayData);

  if (referenceInput) referenceInput.value = currentReference;
  if (versionSelect && verseOfTheDayData.versionId) versionSelect.value = verseOfTheDayData.versionId;

  verseReference.textContent = currentReference;
  renderLoadedVerseText();

  verseCard.classList.remove("hidden");
  practiceOptionsCard.classList.add("hidden");
  hideProgressCard();
  practiceCard.classList.add("hidden");
  updateDashboardVisibility();
  updateSavePracticeButton();
  showMessage("Verse of the Day loaded.", "info");
  syncMemoryListHeight();
}

function formatVerseNumbers(html) {
  return String(html || "").replace(/\[(\d+)\]/g, '<sup class="verse-number">$1</sup>');
}

// --- Helper functions for verse marker selection and highlighting ---
function getVerseMarkerElements() {
  if (!verseText) return [];
  return [...verseText.querySelectorAll(".verse-number, .verse-num, .verse-num__verse")];
}

function getReferenceBookAndChapter(reference) {
  const cleanReference = String(reference || "").trim();
  const match = cleanReference.match(/^(.*?\D)\s+(\d+)/);

  if (!match) {
    return null;
  }

  return {
    book: match[1].trim(),
    chapter: match[2].trim()
  };
}

function getVerseNumbersFromReference(reference, expectedChapter) {
  const cleanReference = String(reference || "").trim();
  const chapterPattern = expectedChapter
    ? new RegExp(`\\b${expectedChapter}:(.+)$`)
    : /\b\d+:(.+)$/;
  const match = cleanReference.match(chapterPattern);

  if (!match) return [];

  const versePart = match[1].trim();
  const verseNumbers = new Set();

  versePart.split(",").forEach(part => {
    const rangeMatch = part.trim().match(/(\d+)\s*[–—-]?\s*(\d+)?/);
    if (!rangeMatch) return;

    const start = Number(rangeMatch[1]);
    const end = rangeMatch[2] ? Number(rangeMatch[2]) : start;

    if (!Number.isFinite(start) || !Number.isFinite(end)) return;

    const lower = Math.min(start, end);
    const upper = Math.max(start, end);

    for (let verse = lower; verse <= upper; verse++) {
      verseNumbers.add(String(verse));
    }
  });

  return [...verseNumbers];
}

// --- Helper function to get first verse number from reference
function getFirstVerseNumberFromReference(reference) {
  const cleanReference = String(reference || "").trim();

  const verseMatch = cleanReference.match(/:\s*(\d+)/);
  if (verseMatch) return verseMatch[1];

  const chapterOnlyMatch = cleanReference.match(/\b\d+$/);
  if (chapterOnlyMatch) return "1";

  return "";
}

// --- Helper to add missing first verse marker if needed
function addMissingFirstVerseMarker() {
  if (!verseText || !currentReference) return;

  const firstVerseNumber = getFirstVerseNumberFromReference(currentReference);
  if (!firstVerseNumber) return;

  const existingFirstMarker = getVerseMarkerElements()[0];
  if (existingFirstMarker && getVerseNumberFromMarker(existingFirstMarker) === firstVerseNumber) return;
  if (verseText.querySelector(".injected-verse-number")) return;

  const headingsAndRemovedItems = [
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

  const walker = document.createTreeWalker(
    verseText,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
        if (node.parentElement?.closest(headingsAndRemovedItems.join(","))) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const firstTextNode = walker.nextNode();
  if (!firstTextNode || !firstTextNode.parentNode) return;

  const marker = document.createElement("sup");
  marker.className = "verse-number injected-verse-number";
  marker.textContent = firstVerseNumber;
  firstTextNode.parentNode.insertBefore(marker, firstTextNode);
}

function buildVerseReference(verseNumber) {
  const parts = getReferenceBookAndChapter(currentReference);
  if (!parts || !verseNumber) return "";
  return `${parts.book} ${parts.chapter}:${verseNumber}`;
}

function combineSelectedVerseReferences(references) {
  if (!Array.isArray(references) || references.length === 0) return [];

  const groups = new Map();
  const passthroughReferences = [];

  references.forEach(reference => {
    const cleanReference = String(reference || "").trim();
    const match = cleanReference.match(/^(.*?)\s+(\d+):(\d+)(?:[–—-](\d+))?$/);

    if (!match) {
      if (cleanReference) passthroughReferences.push(cleanReference);
      return;
    }

    const book = match[1].trim();
    const chapter = match[2];
    const startVerse = Number(match[3]);
    const endVerse = match[4] ? Number(match[4]) : startVerse;

    if (!book || !chapter || !Number.isFinite(startVerse) || !Number.isFinite(endVerse)) {
      passthroughReferences.push(cleanReference);
      return;
    }

    const key = `${book} ${chapter}`;

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    const lower = Math.min(startVerse, endVerse);
    const upper = Math.max(startVerse, endVerse);

    for (let verse = lower; verse <= upper; verse++) {
      groups.get(key).push(verse);
    }
  });

  const combinedReferences = [...groups.entries()].map(([bookChapter, verses]) => {
    const sortedVerses = [...new Set(verses)].sort((a, b) => a - b);

    if (sortedVerses.length === 1) {
      return `${bookChapter}:${sortedVerses[0]}`;
    }

    return `${bookChapter}:${sortedVerses[0]}-${sortedVerses[sortedVerses.length - 1]}`;
  });

  return [...new Set([...combinedReferences, ...passthroughReferences])];
}

function getVerseNumberFromMarker(marker) {
  return String(marker?.textContent || "").replace(/\D/g, "");
}

function getTextNodesBetweenVerseMarkers(marker, nextMarker) {
  if (!verseText || !marker) return [];

  const textNodes = [];
  const walker = document.createTreeWalker(
    verseText,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.textContent.trim()) {
          return NodeFilter.FILTER_REJECT;
        }
        if (node.parentElement?.closest("h1, h2, h3, h4, h5, h6, .heading, .section-heading, .chapter-heading, .subheading, .verse-heading, .passage-heading, .extra_text, .s, .s1, .s2, .s3, .r, .footnotes, .crossrefs")) {
          return NodeFilter.FILTER_REJECT;
        }

        const isAfterMarker = Boolean(
          marker.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING
        );

        if (!isAfterMarker) {
          return NodeFilter.FILTER_REJECT;
        }

        if (nextMarker) {
          const isBeforeNextMarker = Boolean(
            node.compareDocumentPosition(nextMarker) & Node.DOCUMENT_POSITION_FOLLOWING
          );

          if (!isBeforeNextMarker) {
            return NodeFilter.FILTER_REJECT;
          }
        }

        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  return textNodes;
}

function getSelectedVerseReferences() {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0 || !verseText || selection.isCollapsed) {
    return [];
  }

  const range = selection.getRangeAt(0);

  if (!verseText.contains(range.commonAncestorContainer)) {
    return [];
  }

  const markers = getVerseMarkerElements();
  const selectedMarkers = markers.filter((marker, index) => {
    const markerVerseNumber = getVerseNumberFromMarker(marker);
    if (!markerVerseNumber) return false;

    try {
      if (range.intersectsNode(marker)) return true;
    } catch {
      // Continue checking the verse text nodes.
    }

    const nextMarker = markers[index + 1] || null;
    const verseTextNodes = getTextNodesBetweenVerseMarkers(marker, nextMarker);

    return verseTextNodes.some(textNode => {
      try {
        return range.intersectsNode(textNode);
      } catch {
        return false;
      }
    });
  });

  return [...new Set(selectedMarkers
    .map(marker => buildVerseReference(getVerseNumberFromMarker(marker)))
    .filter(Boolean))];
}

function updateSaveSelectionButton() {
  if (!saveSelectionBtn) return;

  const selectedReferences = combineSelectedVerseReferences([...new Set(getSelectedVerseReferences())]);
  const unsavedReferences = selectedReferences.filter(reference => !isReferenceSaved(reference));
  selectedVerseReferences = unsavedReferences;

  const hasUnsavedSelection = unsavedReferences.length > 0;

  saveSelectionBtn.classList.toggle("hidden", !hasUnsavedSelection);

  if (selectionSaveHint) {
    selectionSaveHint.classList.toggle("hidden", hasUnsavedSelection || !currentReference || !currentVerse);
  }

  if (hasUnsavedSelection) {
    saveSelectionBtn.textContent = unsavedReferences.length === 1
      ? `Save ${unsavedReferences[0]}`
      : `Save ${unsavedReferences.length} selected passages`;
    positionSaveSelectionButton();
  } else {
    saveSelectionBtn.style.top = "";
    saveSelectionBtn.style.left = "";
  }
}

function positionSaveSelectionButton() {
  if (!saveSelectionBtn || saveSelectionBtn.classList.contains("hidden")) return;

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  if (!rect || rect.width === 0 || rect.height === 0) return;

  const buttonRect = saveSelectionBtn.getBoundingClientRect();
  const top = Math.max(12, rect.top - buttonRect.height - 10);
  const left = Math.min(
    window.innerWidth - buttonRect.width - 12,
    Math.max(12, rect.left + rect.width / 2 - buttonRect.width / 2)
  );

  saveSelectionBtn.style.top = `${top}px`;
  saveSelectionBtn.style.left = `${left}px`;
}

function markSavedVersesInLoadedPassage() {
  if (!verseText || !currentReference) return;

  const parts = getReferenceBookAndChapter(currentReference);
  if (!parts) return;

  const savedVerseNumbers = new Set();

  const currentVersionKey = String(getSelectedVersion() || "ESV").trim().toUpperCase();

  savedVerses.forEach(item => {
    if (getVerseVersionKey(item) !== currentVersionKey) return;

    const itemParts = getReferenceBookAndChapter(item.reference);
    if (!itemParts) return;
    if (itemParts.book.toLowerCase() !== parts.book.toLowerCase()) return;
    if (itemParts.chapter !== parts.chapter) return;

    getVerseNumbersFromReference(item.reference, parts.chapter).forEach(verseNumber => {
      savedVerseNumbers.add(verseNumber);
    });
  });

  if (!savedVerseNumbers.size) return;

  const markers = getVerseMarkerElements();

  markers.forEach((marker, index) => {
    const verseNumber = getVerseNumberFromMarker(marker);
    if (!savedVerseNumbers.has(verseNumber)) return;

    marker.classList.add("saved-verse-marker");

    const nextMarker = markers[index + 1] || null;
    const textNodes = getTextNodesBetweenVerseMarkers(marker, nextMarker);

    textNodes.forEach(textNode => {
      if (textNode.parentElement?.classList.contains("saved-verse-highlight")) return;

      const wrapper = document.createElement("span");
      wrapper.className = "saved-verse-highlight";
      textNode.parentNode.insertBefore(wrapper, textNode);
      wrapper.appendChild(textNode);
    });
  });
}

function renderLoadedVerseText() {
  if (!verseText) return;

  if (currentVerseHtml) {
    verseText.innerHTML = currentVerseHtml;
  } else {
    verseText.innerHTML = formatVerseNumbers(escapeHtml(currentVerse));
  }

  addMissingFirstVerseMarker();
  markSavedVersesInLoadedPassage();
  updateSaveSelectionButton();
}
async function saveSelectedVerses() {
  const selectedVersion = getSelectedVersion();
  const referencesToSave = [...new Set(selectedVerseReferences)].filter(reference => findSavedVerseIndexByReferenceAndVersion(reference, selectedVersion) < 0);

  if (!referencesToSave.length) {
    showMessage("Highlight a verse in the loaded passage first.", "error");
    return;
  }

  if (saveSelectionBtn) {
    saveSelectionBtn.disabled = true;
    saveSelectionBtn.textContent = "Saving...";
  }

  try {
    for (const reference of referencesToSave) {
      const response = await fetch(`/api/verse?reference=${encodeURIComponent(reference)}&version=${encodeURIComponent(selectedVersion)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Could not save ${reference}.`);
      }

      const cleanReference = data.reference || reference;
      const existingIndex = findSavedVerseIndexByReferenceAndVersion(
        cleanReference,
        data.versionId || data.version || selectedVersion
      );

      const verseRecord = {
        id: existingIndex >= 0 ? savedVerses[existingIndex].id : crypto.randomUUID(),
        reference: cleanReference,
        version: data.version || selectedVersion,
        versionId: data.versionId || selectedVersion,
        versionLabel: data.versionLabel || "",
        text: cleanVerseText(data.text || ""),
        html: data.html || "",
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
      } else {
        savedVerses.unshift(verseRecord);
      }
    }

    persistSavedVerses();
    renderSavedVerses();
    updateDashboard();

    renderLoadedVerseText();
    updateSavePracticeButton();
    showMessage(`${referencesToSave.length} selected passage${referencesToSave.length === 1 ? "" : "s"} saved.`, "info");
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    selectedVerseReferences = [];
    window.getSelection()?.removeAllRanges();
    updateSaveSelectionButton();

    if (saveSelectionBtn) {
      saveSelectionBtn.disabled = false;
    }
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
  updateDashboard();

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
      const versionToRefresh = item.versionId || item.version || "ESV";
      const response = await fetch(`/api/verse?reference=${encodeURIComponent(item.reference)}&version=${encodeURIComponent(versionToRefresh)}`);
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
  updateDashboard();


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
  if (!currentReference) return false;
  return findSavedVerseIndexByReferenceAndVersion(currentReference, getSelectedVersion()) >= 0;
}

function isReferenceSaved(reference) {
  return findSavedVerseIndexByReferenceAndVersion(reference, getSelectedVersion()) >= 0;
}

function updateSavePracticeButton() {
  if (!saveBtn) return;

  if (currentVerse && currentReference && isCurrentVerseSaved()) {
    saveBtn.textContent = "Practice";
  } else {
    saveBtn.textContent = "Save Verse";
  }
}

function updateSequenceSelectionUi() {
  const selectedCount = selectedSavedVerseIds.size;

  if (selectedVerseCount) {
    selectedVerseCount.textContent = selectedCount === 1
      ? "1 verse selected"
      : `${selectedCount} verses selected`;
  }

  if (startSequenceBtn) {
    startSequenceBtn.disabled = selectedCount < 2;
  }

  if (clearSequenceSelectionBtn) {
    clearSequenceSelectionBtn.disabled = selectedCount === 0;
  }
}

function clearSequenceSelection() {
  selectedSavedVerseIds.clear();
  renderSavedVerses();
  updateSequenceSelectionUi();
}

function getSelectedSavedVersesForSequence() {
  return savedVerses.filter(item => selectedSavedVerseIds.has(item.id));
}

function updateSequenceControls() {
  const sequenceActive = sequenceQueue.length > 0 && sequenceIndex >= 0;

  if (sequenceStatus) {
    sequenceStatus.classList.toggle("hidden", !sequenceActive);
    sequenceStatus.textContent = sequenceActive
      ? `Round ${sequenceIndex + 1} of ${sequenceQueue.length} · ${currentReference}`
      : "Round 1 of 1";
  }

  if (nextSequenceBtn) {
    nextSequenceBtn.classList.toggle("hidden", !sequenceActive);
    nextSequenceBtn.textContent = sequenceIndex >= sequenceQueue.length - 1
      ? "Finish Sequence"
      : "Next Verse";
  }

  if (endSequenceBtn) {
    endSequenceBtn.classList.toggle("hidden", !sequenceActive);
  }

  if (newTestBtn) {
    newTestBtn.classList.toggle("hidden", sequenceActive);
  }
}

function loadSequenceVerse(index) {
  const item = sequenceQueue[index];
  if (!item) return;

  loadSavedVerse(item.id, false);
  createTest();
  updateSequenceControls();
}

function startSequencePractice() {
  const selectedVerses = getSelectedSavedVersesForSequence();

  if (selectedVerses.length < 2) {
    showMessage("Select at least 2 saved verses for sequence practice.", "error");
    return;
  }

  sequenceQueue = shuffleArray(selectedVerses);
  sequenceIndex = 0;
  sequenceScores = [];
  loadSequenceVerse(sequenceIndex);
  showMessage(`Sequence practice started with ${sequenceQueue.length} verses.`, "info");
}

function endSequencePractice(showSummary = true) {
  const completedCount = sequenceScores.length;
  const averageScore = completedCount
    ? Math.round(sequenceScores.reduce((sum, score) => sum + score, 0) / completedCount)
    : null;

  sequenceQueue = [];
  sequenceIndex = -1;
  updateSequenceControls();

  if (showSummary) {
    showMessage(
      averageScore === null
        ? "Sequence ended."
        : `Sequence complete! Average score: ${averageScore}% across ${completedCount} round${completedCount === 1 ? "" : "s"}.`,
      "info"
    );
  }
}

function goToNextSequenceVerse() {
  if (!sequenceQueue.length || sequenceIndex < 0) return;

  if (!attemptRecordedThisRound) {
    showMessage("Check your answer before moving to the next verse.", "error");
    return;
  }

  if (sequenceIndex >= sequenceQueue.length - 1) {
    endSequencePractice(true);
    return;
  }

  sequenceIndex++;
  loadSequenceVerse(sequenceIndex);
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

function getScoreEncouragement(score) {
  if (score === null || score === undefined) return "Complete a practice round to see your progress.";
  if (score === 100) return "Perfect recall — amazing work!";
  if (score >= 80) return "Great job — you are really close!";
  if (score >= 60) return "Good progress — keep practising.";
  if (score >= 40) return "You are building familiarity. Try again!";
  return "Good start — every attempt helps.";
}


function getScoreColor(score) {
  if (score < 50) return "#b42318";
  if (score < 70) return "#d97706";
  return "#137a4d";
}

function getLastScore(item) {
  const history = Array.isArray(item.scoreHistory) ? item.scoreHistory : [];
  if (!history.length) return null;
  const lastScore = Number(history[history.length - 1]);
  return Number.isFinite(lastScore) ? lastScore : null;
}

function getDashboardFocusVerse() {
  if (!savedVerses.length) return null;

  const unpractisedVerse = savedVerses.find(item => (item.attempts || 0) === 0);
  if (unpractisedVerse) return unpractisedVerse;

  const versesWithScores = savedVerses
    .map(item => ({ item, lastScore: getLastScore(item) }))
    .filter(entry => entry.lastScore !== null && entry.lastScore !== undefined);

  if (versesWithScores.length) {
    return versesWithScores.sort((a, b) => a.lastScore - b.lastScore)[0].item;
  }

  return savedVerses[0];
}

function getDashboardFocusMessage(item) {
  if (!item) {
    return "Load and save a verse to start tracking your practice progress.";
  }

  const attempts = item.attempts || 0;
  const lastScore = getLastScore(item);

  if (attempts === 0) {
    return "This saved verse has not been practised yet. Start here to build momentum.";
  }

  if (lastScore !== null && lastScore < 70) {
    return "This verse may need a little review. Try one more round to strengthen it.";
  }

  return "Keep this verse fresh with another practice round.";
}

function updateDashboard() {
  if (!dashboardCard) return;

  renderVerseOfTheDay();

  const focusVerse = getDashboardFocusVerse();
  const totalAttempts = savedVerses.reduce((sum, item) => sum + (item.attempts || 0), 0);
  const unpractisedCount = savedVerses.filter(item => (item.attempts || 0) === 0).length;

  const latestScores = savedVerses
    .map(item => getLastScore(item))
    .filter(score => score !== null && score !== undefined);

  const averageScore = latestScores.length
    ? Math.round(latestScores.reduce((sum, score) => sum + score, 0) / latestScores.length)
    : null;

  if (dashboardFocusReference) {
    dashboardFocusReference.textContent = focusVerse ? focusVerse.reference : "Start your memory journey";
  }

  if (dashboardFocusMessage) {
    dashboardFocusMessage.textContent = getDashboardFocusMessage(focusVerse);
  }

  if (dashboardSavedCount) dashboardSavedCount.textContent = String(savedVerses.length);
  if (dashboardTotalAttempts) dashboardTotalAttempts.textContent = String(totalAttempts);
  if (dashboardAverageScore) dashboardAverageScore.textContent = averageScore === null ? "No score yet" : `${averageScore}%`;
  if (dashboardUnpractisedCount) dashboardUnpractisedCount.textContent = String(unpractisedCount);

  if (dashboardPracticeBtn) {
    dashboardPracticeBtn.classList.toggle("hidden", !focusVerse);
    dashboardPracticeBtn.dataset.id = focusVerse ? focusVerse.id : "";
  }

  updateDashboardVisibility();
}

function updateDashboardVisibility() {
  if (!dashboardCard) return;

  const hasActiveCentreContent = [
    verseCard,
    practiceOptionsCard,
    progressCard,
    practiceCard
  ].some(card => card && !card.classList.contains("hidden"));

  dashboardCard.classList.toggle("hidden", hasActiveCentreContent);
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
    caption.textContent = "All attempts · Attempt number vs score";
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

function getProgressCurrentScoreElement() {
  let value = document.getElementById("progressCurrentScore");

  if (
    !value &&
    progressBestScore &&
    progressBestScore.parentElement &&
    progressBestScore.parentElement.parentElement
  ) {
    const progressStatsRow = progressBestScore.parentElement.parentElement;
    progressStatsRow.classList.add("progress-three-column-row");

    const bestScoreCard = progressBestScore.parentElement;
    const labelTemplate = bestScoreCard.querySelector(".progress-label");
    const card = bestScoreCard.cloneNode(false);

    const label = document.createElement("div");
    label.className = labelTemplate ? labelTemplate.className : "progress-label";
    label.textContent = "Current score";

    value = progressBestScore.cloneNode(false);
    value.id = "progressCurrentScore";
    value.textContent = "No score yet";
    value.className = progressBestScore.className;
    value.classList.remove("score-low", "score-mid", "score-high");
    value.classList.add("score-neutral");

    const message = document.createElement("span");
    message.id = "progressCurrentScoreMessage";
    message.className = "progress-current-score-message";

    card.appendChild(label);
    card.appendChild(value);
    card.appendChild(message);
    progressStatsRow.insertBefore(card, progressAttempts.parentElement);
  }

  return value;
}

function getCurrentSavedVerse() {
  if (!currentReference) return null;
  const index = findSavedVerseIndexByReferenceAndVersion(currentReference, getSelectedVersion());
  return index >= 0 ? savedVerses[index] : null;
}

function showProgressForCurrentVerse() {
  if (!progressCard) return;

  const savedVerse = getCurrentSavedVerse();

  if (!savedVerse) {
    hideProgressCard();
    return;
  }

  progressReference.textContent = savedVerse.reference;

  const bestScore = savedVerse.bestScore;
  progressBestScore.textContent = bestScore === null || bestScore === undefined
    ? "No score yet"
    : `${bestScore}%`;
  progressBestScore.classList.remove("score-neutral", "score-low", "score-mid", "score-high");
  progressBestScore.classList.add(getScoreClass(bestScore));

  const lastScore = getLastScore(savedVerse);
  const currentScoreValue = getProgressCurrentScoreElement();
  if (currentScoreValue) {
    currentScoreValue.textContent = lastScore === null || lastScore === undefined
      ? "No score yet"
      : `${lastScore}%`;
    currentScoreValue.classList.remove("score-neutral", "score-low", "score-mid", "score-high");
    currentScoreValue.classList.add(getScoreClass(lastScore));
  }

  const currentScoreMessage = document.getElementById("progressCurrentScoreMessage");
  if (currentScoreMessage) {
    currentScoreMessage.textContent = getScoreEncouragement(lastScore);
  }

  const attempts = savedVerse.attempts || 0;
  progressAttempts.textContent = String(attempts);

  const attemptsLabel = getProgressAttemptsLabelElement();
  if (attemptsLabel) {
    attemptsLabel.textContent = getAttemptsLabel(attempts);
  }

  progressCard.classList.remove("hidden");
  updateDashboardVisibility();

  requestAnimationFrame(() => {
    drawProgressChart(savedVerse.scoreHistory || []);
  });
}

function hideProgressCard() {
  if (!progressCard) return;
  progressCard.classList.add("hidden");
  updateDashboardVisibility();
}

function handleSaveOrPracticeButton() {
  if (currentVerse && currentReference && isCurrentVerseSaved()) {
    currentVerseSaved = true;
    verseCard.classList.add("hidden");
    updateDashboardVisibility();
    practiceOptionsCard.classList.remove("hidden");
    updateDashboardVisibility();
    hideProgressCard();
    practiceCard.classList.add("hidden");
    updateDashboardVisibility();
    endSequencePractice(false);
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
  selectedVerseReferences = [];
  updateSaveSelectionButton();

  referenceInput.value = "";
  verseReference.textContent = "Reference";
  verseText.textContent = "";
  scorePill.textContent = "Not checked yet";

  verseCard.classList.add("hidden");
  updateDashboardVisibility();
  practiceOptionsCard.classList.add("hidden");
  hideProgressCard();
  practiceCard.classList.add("hidden");
  updateDashboardVisibility();
  
  endSequencePractice(false);
  hideMessage();
  updateSavePracticeButton();
  syncMemoryListHeight();
}

function clearPractice() {
  practiceCard.classList.add("hidden");
  updateDashboardVisibility();
  
  hideProgressCard();
  practiceArea.innerHTML = "";
  scorePill.textContent = "Not checked yet";
  hintCount = 0;
  attemptRecordedThisRound = false;
  checkBtn.disabled = false;
  endSequencePractice(false);
  syncMemoryListHeight();
}

function saveCurrentVerse() {
  if (!currentVerse || !currentReference) {
    showMessage("Load a verse before saving.", "error");
    return;
  }

  const selectedVersionId = getSelectedVersion();
  const selectedVersionText = versionSelect?.selectedOptions?.[0]?.textContent || "ESV — English Standard Version";
  const selectedVersion = selectedVersionText.split(" — ")[0] || "ESV";
  const selectedVersionLabel = selectedVersionText.includes(" — ")
    ? selectedVersionText.split(" — ").slice(1).join(" — ")
    : selectedVersionText;

  const existingIndex = findSavedVerseIndexByReferenceAndVersion(currentReference, selectedVersionId);

  const verseRecord = {
    id: existingIndex >= 0 ? savedVerses[existingIndex].id : crypto.randomUUID(),
    reference: currentReference,
    version: selectedVersion,
    versionId: selectedVersionId,
    versionLabel: selectedVersionLabel,
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
  updateDashboard();

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

    const previewHtml = getSavedVersePreviewHtml(item);
    const lastScore = getLastScore(item);
    const scoreText = lastScore === null || lastScore === undefined
      ? "No score yet"
      : `Last: ${lastScore}%`;
    const attemptsText = item.attempts || 0;

    div.innerHTML = `
      <label class="saved-sequence-select">
        <input type="checkbox" data-action="toggle-sequence" data-id="${escapeAttr(item.id)}" ${selectedSavedVerseIds.has(item.id) ? "checked" : ""} />
        <span>Select</span>
      </label>
      <div class="saved-ref">${escapeHtml(item.reference)} <span class="saved-version">${escapeHtml(getVersionDisplayForSavedItem(item))}</span></div>
      <div class="saved-preview saved-verse-preview">${previewHtml}</div>
      <div class="saved-preview">${scoreText} · Attempts: ${attemptsText}</div>
      <div class="saved-actions">
        <button data-action="practice" data-id="${escapeAttr(item.id)}">Practice</button>
        <button data-action="load" data-id="${escapeAttr(item.id)}">Load</button>
        <button data-action="delete" data-id="${escapeAttr(item.id)}" class="danger">Delete</button>
      </div>
    `;

    savedVersesList.appendChild(div);
  });
  updateSequenceSelectionUi();
}

function getVerseOnlyFromSaved(item) {
  const oldRef = currentReference;
  currentReference = item.reference;
  const verseOnly = getVerseOnly(item.text);
  currentReference = oldRef;
  return verseOnly;
}

function getSavedVersePreviewHtml(item) {
  const previewSource = removeKnownHeadingText(getVerseOnlyFromSaved(item));
  const preview = previewSource.slice(0, 130);
  const suffix = previewSource.length > 130 ? "..." : "";
  return `${formatVerseNumbers(escapeHtml(preview))}${suffix}`;
}

function loadSavedVerse(id, shouldStartPractice = true) {
  const item = savedVerses.find(v => v.id === id);
  if (!item) return;

  currentReference = item.reference;
  currentVerse = item.text;
  currentVerseHtml = item.html || "";
  currentVerseSaved = true;

  if (referenceInput) referenceInput.value = item.reference;
  if (versionSelect) versionSelect.value = item.versionId || item.version || "ESV";

  verseReference.textContent = currentReference;
  renderLoadedVerseText();

  verseCard.classList.remove("hidden");
  practiceOptionsCard.classList.add("hidden");
  hideProgressCard();
  practiceCard.classList.add("hidden");
  updateDashboardVisibility();
  updateSavePracticeButton();

  if (shouldStartPractice) {
    verseCard.classList.add("hidden");
    practiceOptionsCard.classList.remove("hidden");
    practiceCard.classList.add("hidden");
    hideProgressCard();
    updateDashboardVisibility();

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
  updateDashboard();

  showMessage("Verse removed from saved list.", "info");
  syncMemoryListHeight();
}

function updateSavedVerseScore(percent) {
  if (!currentReference) return;

  const index = findSavedVerseIndexByReferenceAndVersion(currentReference, getSelectedVersion());
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
  updateDashboard();

  showProgressForCurrentVerse();
}

function createTest() {
  if (!currentVerseSaved && !isCurrentVerseSaved()) {
    showMessage("Save the verse first before starting practice.", "error");
    return;
  }

  verseCard.classList.add("hidden");
  updateDashboardVisibility();
  practiceOptionsCard.classList.add("hidden");
  hideProgressCard();
  
  practiceCard.classList.remove("hidden");
  updateDashboardVisibility();
  scorePill.textContent = "Not checked yet";
  hintCount = 0;
  attemptRecordedThisRound = false;
  checkBtn.disabled = false;

  const mode = getPracticeMode();
  const practiceReference = getPracticeReferenceParts(currentReference);
  const versePracticeText = getPracticeVerseText(currentVerse);
  currentWords = tokenizeVerse(versePracticeText);

  if (mode === "blank") {
    practiceTitle.textContent = "Fill in the missing words";
    const ratio = difficultyMap[difficultySelect.value] || 0.4;
    blankIndexes = chooseBlankIndexes(currentWords, ratio);

    const referenceHtml = currentReference
      ? `<div class="practice-reference-heading">
          ${isSequencePracticeActive()
            ? `<span>${escapeHtml(currentReference)}</span>`
            : `<span>${escapeHtml(practiceReference.book)}</span>
               ${practiceReference.numbers ? buildReferenceNumberPracticeHtml(practiceReference.numbers) : ""}`
          }
        </div>`
      : "";

    practiceArea.innerHTML = referenceHtml + currentWords.map(part => {
      if (!part.isWord) return escapeHtml(part.token);

      if (blankIndexes.includes(part.index)) {
        const width = Math.max(78, Math.min(260, part.token.length * 22 + 24));
        return `<input class="blank-input" data-answer="${escapeAttr(part.token)}" style="width:${width}px" autocomplete="off" />`;
      }

      return escapeHtml(part.token);
    }).join("");

    practiceArea.querySelectorAll(".blank-input").forEach(input => {
      input.addEventListener("keydown", handleBlankInputKeydown);
    });
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

  scrollToTopOfApp();
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
    const selectedVersion = getSelectedVersion();
    const response = await fetch(`/api/verse?reference=${encodeURIComponent(reference)}&version=${encodeURIComponent(selectedVersion)}`);
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
    updateDashboardVisibility();
    
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

    input.classList.remove("correct", "wrong", "corrected");

    if (input.dataset.usedHint === "true") {
      input.classList.add("revealed");
    } else if (actual && actual === expected) {
      input.classList.add("correct");
      correct++;
    } else {
      input.classList.add("wrong");
    }
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
}

function showResult(percent, detail) {
  scorePill.textContent = `${percent}%`;
  if (sequenceQueue.length && sequenceIndex >= 0) {
    sequenceScores[sequenceIndex] = percent;
  }
  updateSavedVerseScore(percent);
  showProgressForCurrentVerse();
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
    input.dataset.usedHint = "true";
    input.classList.remove("correct", "wrong", "corrected");
    input.classList.add("revealed");
    hintCount++;
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
if (saveSelectionBtn) {
  saveSelectionBtn.addEventListener("click", saveSelectedVerses);
}
if (verseText) {
  verseText.addEventListener("mouseup", () => setTimeout(updateSaveSelectionButton, 0));
  verseText.addEventListener("keyup", () => setTimeout(updateSaveSelectionButton, 0));
  verseText.addEventListener("touchend", () => setTimeout(updateSaveSelectionButton, 0));

  document.addEventListener("selectionchange", () => {
    if (!currentReference || !currentVerse) return;
    setTimeout(updateSaveSelectionButton, 0);
  });
}
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

if (dashboardPracticeBtn) {
  dashboardPracticeBtn.addEventListener("click", () => {
    const focusId = dashboardPracticeBtn.dataset.id;
    if (!focusId) return;
    loadSavedVerse(focusId, true);
  });
}

if (saveVerseOfTheDayBtn) {
  saveVerseOfTheDayBtn.addEventListener("click", saveVerseOfTheDay);
}

if (loadVerseOfTheDayBtn) {
  loadVerseOfTheDayBtn.addEventListener("click", loadVerseOfTheDayIntoMainView);
}

if (versionSelect) {
  versionSelect.addEventListener("change", loadVerseOfTheDay);
}

if (bookSelect) {
  bookSelect.addEventListener("change", () => {
    const selectedBook = bookSelect.value;
    if (!selectedBook || !referenceInput) return;

    const currentReference = referenceInput.value.trim();
    const chapterAndVerseMatch = currentReference.match(/\b\d+(?::[\d,\s-]+)?\s*$/);

    if (chapterAndVerseMatch) {
      referenceInput.value = `${selectedBook} ${chapterAndVerseMatch[0].trim()}`;
    } else {
      referenceInput.value = `${selectedBook} 1`;
    }

    referenceInput.focus();
    referenceInput.setSelectionRange(referenceInput.value.length, referenceInput.value.length);
    loadVerse();
  });
}

savedVersesList.addEventListener("click", event => {
  const sequenceToggle = event.target.closest('[data-action="toggle-sequence"]');
  if (sequenceToggle) {
    const id = sequenceToggle.dataset.id;

    if (sequenceToggle.checked) {
      selectedSavedVerseIds.add(id);
    } else {
      selectedSavedVerseIds.delete(id);
    }

    updateSequenceSelectionUi();
    return;
  }

  const button = event.target.closest("button");
  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;

  if (action === "practice") loadSavedVerse(id, true);
  if (action === "load") loadSavedVerse(id, false);
  if (action === "delete") deleteSavedVerse(id);
});

if (startSequenceBtn) {
  startSequenceBtn.addEventListener("click", startSequencePractice);
}

if (clearSequenceSelectionBtn) {
  clearSequenceSelectionBtn.addEventListener("click", clearSequenceSelection);
}

if (nextSequenceBtn) {
  nextSequenceBtn.addEventListener("click", goToNextSequenceVerse);
}

if (endSequenceBtn) {
  endSequenceBtn.addEventListener("click", () => endSequencePractice(true));
}

if (clearSavedBtn) {
  clearSavedBtn.addEventListener("click", () => {
    if (!confirm("Clear all saved verses?")) return;
    savedVerses = [];
    persistSavedVerses();
    renderSavedVerses();
    updateDashboard();

    showMessage("All saved verses cleared.", "info");
    syncMemoryListHeight();
  });
}

difficultySelect.addEventListener("change", () => {
  syncDifficultyPicker();
  
  hideProgressCard();
  practiceCard.classList.add("hidden");
  updateDashboardVisibility();
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
    updateDashboardVisibility();
    
  });
}

document.addEventListener("click", event => {

  const clickedButton = event.target.closest("button");

  if (!clickedButton) return;

  if (clickedButton === saveSelectionBtn) return;

  scrollToTopOfApp();

});

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

const memoryListResizeObserver = "ResizeObserver" in window
  ? new ResizeObserver(() => requestAnimationFrame(syncMemoryListHeight))
  : null;

if (memoryListResizeObserver && mainColumn) {
  [...mainColumn.children].forEach(child => memoryListResizeObserver.observe(child));
}

syncDifficultyPicker();
loadBibleVersions();
loadSavedVerses();
updateDashboard();
updateDashboardVisibility();
loadFeedbacks();
syncMemoryListHeight();
