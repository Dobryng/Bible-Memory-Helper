const referenceInput = document.getElementById("referenceInput");
const difficultySelect = document.getElementById("difficultySelect");
const modeSelect = document.getElementById("modeSelect");
const loadBtn = document.getElementById("loadBtn");
const messageBox = document.getElementById("messageBox");
const verseCard = document.getElementById("verseCard");
const verseReference = document.getElementById("verseReference");
const verseText = document.getElementById("verseText");
const practiceOptionsCard = document.getElementById("practiceOptionsCard");
const startPracticeBtn = document.getElementById("startPracticeBtn");
const clearPracticeBtn = document.getElementById("clearPracticeBtn");
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

const feedbackName = document.getElementById("feedbackName");
const feedbackMessage = document.getElementById("feedbackMessage");
const submitFeedbackBtn = document.getElementById("submitFeedbackBtn");
const feedbackList = document.getElementById("feedbackList");
const feedbackStatus = document.getElementById("feedbackStatus");
const clearFeedbackBtn = document.getElementById("clearFeedbackBtn");

const STORAGE_KEY = "esvMemoryTrainerSavedVerses";

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

let currentVerse = "";
let currentVerseHtml = "";
let currentReference = "";
let currentWords = [];
let blankIndexes = [];
let hintCount = 0;
let savedVerses = [];
let currentVerseSaved = false;

const difficultyMap = {
  easy: 0.25,
  medium: 0.4,
  hard: 0.6,
  extreme: 0.8
};

function showMessage(text, type = "info") {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
}

function hideMessage() {
  messageBox.className = "message hidden";
  messageBox.textContent = "";
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

function tokenizeVerse(text) {
  const tokens = text.match(/[A-Za-z0-9’'-]+|[^\sA-Za-z0-9’'-]+|\s+/g) || [];
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

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(text) {
  return escapeHtml(text).replaceAll('"', "&quot;");
}

function renderLoadedVerseText() {
  if (!verseText) return;

  if (currentVerseHtml) {
    verseText.innerHTML = currentVerseHtml;
  } else {
    verseText.textContent = currentVerse;
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
}

function persistSavedVerses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedVerses));
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

function handleSaveOrPracticeButton() {
  if (currentVerse && currentReference && isCurrentVerseSaved()) {
    currentVerseSaved = true;
    practiceOptionsCard.classList.remove("hidden");
    createTest();
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
  currentVerseSaved = false;

  referenceInput.value = "";
  verseReference.textContent = "Reference";
  verseText.textContent = "";
  scorePill.textContent = "Not checked yet";

  verseCard.classList.add("hidden");
  practiceOptionsCard.classList.add("hidden");
  practiceCard.classList.add("hidden");
  resultCard.classList.add("hidden");

  hideMessage();
  updateSavePracticeButton();
}

function clearPractice() {
  practiceCard.classList.add("hidden");
  resultCard.classList.add("hidden");
  practiceArea.innerHTML = "";
  scorePill.textContent = "Not checked yet";
  hintCount = 0;
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
    attempts: existingIndex >= 0 ? savedVerses[existingIndex].attempts || 0 : 0
  };

  if (existingIndex >= 0) {
    savedVerses[existingIndex] = verseRecord;
    showMessage(`${currentReference} updated in your saved verses. Practice options are now available.`, "info");
  } else {
    savedVerses.unshift(verseRecord);
    showMessage(`${currentReference} saved. Choose your practice options below.`, "info");
  }

  currentVerseSaved = true;
  practiceOptionsCard.classList.remove("hidden");
  persistSavedVerses();
  renderSavedVerses();
  updateSavePracticeButton();
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
    const scoreText = item.bestScore === null || item.bestScore === undefined
      ? "No score yet"
      : `Best: ${item.bestScore}%`;

    div.innerHTML = `
      <div class="saved-ref">${escapeHtml(item.reference)}</div>
      <div class="saved-preview">${escapeHtml(preview)}${preview.length >= 130 ? "..." : ""}</div>
      <div class="saved-preview">${scoreText} · Attempts: ${item.attempts || 0}</div>
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

  practiceOptionsCard.classList.remove("hidden");
  practiceCard.classList.add("hidden");
  resultCard.classList.add("hidden");

  if (shouldStartPractice) {
    createTest();
    showMessage(`${currentReference} Practice loaded.`, "info");
  } else {
    showMessage(`${currentReference} loaded from saved verses.`, "info");
  }
}

function deleteSavedVerse(id) {
  savedVerses = savedVerses.filter(v => v.id !== id);
  persistSavedVerses();
  renderSavedVerses();
  showMessage("Verse removed from saved list.", "info");
}

function updateSavedVerseScore(percent) {
  if (!currentReference) return;

  const index = savedVerses.findIndex(v => v.reference.toLowerCase() === currentReference.toLowerCase());
  if (index < 0) return;

  const item = savedVerses[index];
  item.attempts = (item.attempts || 0) + 1;
  item.bestScore = Math.max(item.bestScore || 0, percent);
  savedVerses[index] = item;
  persistSavedVerses();
  renderSavedVerses();
}

function createTest() {
  if (!currentVerseSaved && !isCurrentVerseSaved()) {
    showMessage("Save the verse first before starting practice.", "error");
    return;
  }

  verseCard.classList.add("hidden");
  resultCard.classList.add("hidden");
  practiceCard.classList.remove("hidden");
  scorePill.textContent = "Not checked yet";
  hintCount = 0;

  const mode = modeSelect.value;
  const memoryText = getVerseOnly(currentVerse);
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
    practiceCard.classList.add("hidden");
    resultCard.classList.add("hidden");
    updateSavePracticeButton();

    if (isCurrentVerseSaved()) {
      currentVerseSaved = true;
      practiceOptionsCard.classList.remove("hidden");
      updateSavePracticeButton();
      showMessage("This verse is already saved. Practice options are available below.", "info");
    } else {
      showMessage("Verse loaded. Save it first before practising.", "info");
    }
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    loadBtn.disabled = false;
    loadBtn.textContent = "Load Verse";
  }
}

function checkBlankAnswers() {
  const inputs = [...practiceArea.querySelectorAll(".blank-input")];
  let correct = 0;

  inputs.forEach(input => {
    const expected = normalizeAnswer(input.dataset.answer);
    const actual = normalizeAnswer(input.value);

    input.classList.remove("correct", "wrong");

    if (actual && actual === expected) {
      input.classList.add("correct");
      correct++;
    } else {
      input.classList.add("wrong");
    }
  });

  const percent = Math.round((correct / inputs.length) * 100);
  showResult(percent, `${correct} out of ${inputs.length} blanks correct.`);
}

function checkFullRecall() {
  const input = document.getElementById("fullRecallInput");
  const expectedWords = getVerseOnly(currentVerse).split(/\s+/).filter(Boolean);
  const actualWords = input.value.split(/\s+/).filter(Boolean);

  let correct = 0;
  const max = expectedWords.length;

  const comparison = expectedWords.map((word, i) => {
    const actual = actualWords[i] || "";
    const ok = normalizeAnswer(actual) === normalizeAnswer(word);

    if (ok) correct++;

    return `<span class="word ${ok ? "correct" : "missing"}">${escapeHtml(word)}</span>`;
  }).join(" ");

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
}

function revealVerse() {
  const mode = modeSelect.value;

  if (mode === "blank") {
    const inputs = [...practiceArea.querySelectorAll(".blank-input")];

    inputs.forEach(input => {
      input.value = input.dataset.answer || "";
      input.classList.remove("correct", "wrong");
      input.classList.add("revealed");
      input.disabled = true;
    });

    scorePill.textContent = "Revealed";
    resultCard.classList.add("hidden");
    return;
  }

  const input = document.getElementById("fullRecallInput");
  if (input) {
    input.value = getVerseOnly(currentVerse);
    input.classList.add("revealed");
    input.disabled = true;
  }

  scorePill.textContent = "Revealed";
  resultCard.classList.add("hidden");
}

function showHint() {
  const mode = modeSelect.value;

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
    input.classList.remove("correct", "wrong");
    input.classList.add("revealed");
    input.disabled = true;
    hintCount++;
    showMessage(`Hint used: one word revealed. Hints used this round: ${hintCount}.`, "info");
    return;
  }

  const input = document.getElementById("fullRecallInput");
  const words = getVerseOnly(currentVerse).split(/\s+/);
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

  if (modeSelect.value === "blank") {
    checkBlankAnswers();
  } else {
    checkFullRecall();
  }
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

clearSavedBtn.addEventListener("click", () => {
  if (!confirm("Clear all saved verses?")) return;
  savedVerses = [];
  persistSavedVerses();
  renderSavedVerses();
  showMessage("All saved verses cleared.", "info");
});

difficultySelect.addEventListener("change", () => {
  practiceCard.classList.add("hidden");
  resultCard.classList.add("hidden");
});
modeSelect.addEventListener("change", () => {
  practiceCard.classList.add("hidden");
  resultCard.classList.add("hidden");
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

referenceInput.value = "";
loadSavedVerses();
loadFeedbacks();
