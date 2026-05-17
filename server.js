import express from "express";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { Resend } from "resend";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const ESV_API_KEY = process.env.ESV_API_KEY;
const YOUVERSION_API_KEY = process.env.YOUVERSION_API_KEY;
const API_BIBLE_KEY = process.env.API_BIBLE_KEY;
const API_BIBLE_BASE_URL = process.env.API_BIBLE_BASE_URL || "https://rest.api.bible/v1";
const YOUVERSION_BIBLES_URL = process.env.YOUVERSION_BIBLES_URL || "https://api.youversion.com/v1/bibles";
const YOUVERSION_API_BASE_URL = process.env.YOUVERSION_API_BASE_URL || "https://api.youversion.com/v1";
const YOUVERSION_LANGUAGE_RANGES = process.env.YOUVERSION_LANGUAGE_RANGES || "eng";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FEEDBACK_TO_EMAIL = process.env.FEEDBACK_TO_EMAIL;
const FEEDBACK_FROM_EMAIL = process.env.FEEDBACK_FROM_EMAIL || "Memory Verse Helper <onboarding@resend.dev>";
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

let youVersionBiblesCache = null;
let youVersionBiblesCacheLoadedAt = 0;
const YOUVERSION_BIBLES_CACHE_TTL_MS = 1000 * 60 * 60;

const API_BIBLE_VERSIONS = [
  {
    id: "78a9f6124f344018-01",
    abbreviation: "NIV",
    displayAbbreviation: "NIV",
    title: "New International Version 2011"
  },
  {
    id: "d6e14a625393b4da-01",
    abbreviation: "NLT",
    displayAbbreviation: "NLT",
    title: "New Living Translation"
  },
  {
    id: "63097d2a0a2f7db3-01",
    abbreviation: "NKJV",
    displayAbbreviation: "NKJV",
    title: "New King James Version"
  }
];

const BIBLE_CODE_NAMES = {
  GEN: "Genesis",
  EXO: "Exodus",
  LEV: "Leviticus",
  NUM: "Numbers",
  DEU: "Deuteronomy",
  JOS: "Joshua",
  JDG: "Judges",
  RUT: "Ruth",
  "1SA": "1 Samuel",
  "2SA": "2 Samuel",
  "1KI": "1 Kings",
  "2KI": "2 Kings",
  "1CH": "1 Chronicles",
  "2CH": "2 Chronicles",
  EZR: "Ezra",
  NEH: "Nehemiah",
  EST: "Esther",
  JOB: "Job",
  PSA: "Psalms",
  PRO: "Proverbs",
  ECC: "Ecclesiastes",
  SNG: "Song of Solomon",
  ISA: "Isaiah",
  JER: "Jeremiah",
  LAM: "Lamentations",
  EZK: "Ezekiel",
  DAN: "Daniel",
  HOS: "Hosea",
  JOL: "Joel",
  AMO: "Amos",
  OBA: "Obadiah",
  JON: "Jonah",
  MIC: "Micah",
  NAM: "Nahum",
  HAB: "Habakkuk",
  ZEP: "Zephaniah",
  HAG: "Haggai",
  ZEC: "Zechariah",
  MAL: "Malachi",
  MAT: "Matthew",
  MRK: "Mark",
  LUK: "Luke",
  JHN: "John",
  ACT: "Acts",
  ROM: "Romans",
  "1CO": "1 Corinthians",
  "2CO": "2 Corinthians",
  GAL: "Galatians",
  EPH: "Ephesians",
  PHP: "Philippians",
  COL: "Colossians",
  "1TH": "1 Thessalonians",
  "2TH": "2 Thessalonians",
  "1TI": "1 Timothy",
  "2TI": "2 Timothy",
  TIT: "Titus",
  PHM: "Philemon",
  HEB: "Hebrews",
  JAS: "James",
  "1PE": "1 Peter",
  "2PE": "2 Peter",
  "1JN": "1 John",
  "2JN": "2 John",
  "3JN": "3 John",
  JUD: "Jude",
  REV: "Revelation"
};

const BIBLE_BOOK_CODES = {
  genesis: "GEN", gen: "GEN",
  exodus: "EXO", exo: "EXO",
  leviticus: "LEV", lev: "LEV",
  numbers: "NUM", num: "NUM",
  deuteronomy: "DEU", deut: "DEU", deuter: "DEU",
  joshua: "JOS", josh: "JOS",
  judges: "JDG", judg: "JDG",
  ruth: "RUT",
  "1 samuel": "1SA", "1samuel": "1SA", "1 sam": "1SA", "1sam": "1SA",
  "2 samuel": "2SA", "2samuel": "2SA", "2 sam": "2SA", "2sam": "2SA",
  "1 kings": "1KI", "1kings": "1KI", "1 king": "1KI",
  "2 kings": "2KI", "2kings": "2KI", "2 king": "2KI",
  "1 chronicles": "1CH", "1chronicles": "1CH", "1 chron": "1CH", "1chr": "1CH",
  "2 chronicles": "2CH", "2chronicles": "2CH", "2 chron": "2CH", "2chr": "2CH",
  ezra: "EZR", ezr: "EZR",
  nehemiah: "NEH", neh: "NEH",
  esther: "EST", est: "EST",
  job: "JOB",
  psalms: "PSA", psalm: "PSA", psa: "PSA",
  proverbs: "PRO", proverb: "PRO", prov: "PRO",
  ecclesiastes: "ECC", eccl: "ECC",
  song: "SNG", "song of solomon": "SNG", "song of songs": "SNG", canticles: "SNG",
  isaiah: "ISA", isa: "ISA",
  jeremiah: "JER", jer: "JER",
  lamentations: "LAM", lam: "LAM",
  ezekiel: "EZK", ezek: "EZK",
  daniel: "DAN", dan: "DAN",
  hosea: "HOS", hos: "HOS",
  joel: "JOL", jol: "JOL",
  amos: "AMO", amo: "AMO",
  obadiah: "OBA", obad: "OBA",
  jonah: "JON", jon: "JON",
  micah: "MIC", mic: "MIC",
  nahum: "NAM", nah: "NAM",
  habakkuk: "HAB", hab: "HAB",
  zephaniah: "ZEP", zeph: "ZEP",
  haggai: "HAG", hag: "HAG",
  zechariah: "ZEC", zech: "ZEC",
  malachi: "MAL", mal: "MAL",
  matthew: "MAT", matt: "MAT", mat: "MAT",
  mark: "MRK", mrk: "MRK",
  luke: "LUK", luk: "LUK",
  john: "JHN", jhn: "JHN",
  acts: "ACT", act: "ACT",
  romans: "ROM", roman: "ROM", rom: "ROM",
  "1 corinthians": "1CO", "1corinthians": "1CO", "1 cor": "1CO", "1cor": "1CO",
  "2 corinthians": "2CO", "2corinthians": "2CO", "2 cor": "2CO", "2cor": "2CO",
  galatians: "GAL", gal: "GAL",
  ephesians: "EPH", eph: "EPH",
  philippians: "PHP", phil: "PHP", php: "PHP",
  colossians: "COL", col: "COL",
  "1 thessalonians": "1TH", "1thessalonians": "1TH", "1 thess": "1TH", "1thess": "1TH",
  "2 thessalonians": "2TH", "2thessalonians": "2TH", "2 thess": "2TH", "2thess": "2TH",
  "1 timothy": "1TI", "1timothy": "1TI", "1 tim": "1TI", "1tim": "1TI",
  "2 timothy": "2TI", "2timothy": "2TI", "2 tim": "2TI", "2tim": "2TI",
  titus: "TIT", tit: "TIT",
  philemon: "PHM", phlm: "PHM", phm: "PHM",
  hebrews: "HEB", hebrew: "HEB", heb: "HEB",
  james: "JAS", jas: "JAS",
  "1 peter": "1PE", "1peter": "1PE", "1 pet": "1PE", "1pet": "1PE",
  "2 peter": "2PE", "2peter": "2PE", "2 pet": "2PE", "2pet": "2PE",
  "1 john": "1JN", "1john": "1JN", "1 jn": "1JN", "1jn": "1JN",
  "2 john": "2JN", "2john": "2JN", "2 jn": "2JN", "2jn": "2JN",
  "3 john": "3JN", "3john": "3JN", "3 jn": "3JN", "3jn": "3JN",
  jude: "JUD", jud: "JUD",
  revelation: "REV", revelations: "REV", rev: "REV"
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/verse", async (req, res) => {
  try {
    const reference = String(req.query.reference || "").trim();
    const requestedVersion = String(req.query.version || "ESV").trim();
    const requestedVersionUpper = requestedVersion.toUpperCase();

    if (!reference) {
      return res.status(400).json({ error: "Please enter a Bible reference." });
    }

    if (requestedVersionUpper === "ESV") {
      return loadEsvPassage(reference, req, res);
    }

    const apiBibleVersion = resolveApiBibleVersion(requestedVersion);
    if (apiBibleVersion) {
      return loadApiBiblePassage(reference, apiBibleVersion, req, res);
    }

    return loadYouVersionPassage(reference, requestedVersion, req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong while loading the verse."
    });
  }
});

async function loadEsvPassage(reference, req, res, metadata = {}) {
  if (!ESV_API_KEY || ESV_API_KEY === "put_your_esv_api_key_here") {
    return res.status(500).json({
      error: "Missing ESV_API_KEY. Add your API key to a .env file first."
    });
  }

  const params = new URLSearchParams({
    q: reference,
    "include-passage-references": "false",
    "include-verse-numbers": "true",
    "include-first-verse-numbers": "true",
    "include-footnotes": "false",
    "include-footnote-body": "false",
    "include-headings": "true",
    "include-short-copyright": "false",
    "include-copyright": "false",
    "indent-using": "space"
  });

  const [textResponse, htmlResponse] = await Promise.all([
    fetch(`https://api.esv.org/v3/passage/text/?${params}`, {
      headers: { Authorization: `Token ${ESV_API_KEY}` }
    }),
    fetch(`https://api.esv.org/v3/passage/html/?${params}`, {
      headers: { Authorization: `Token ${ESV_API_KEY}` }
    })
  ]);

  const data = await textResponse.json();
  const htmlData = await htmlResponse.json();

  if (!textResponse.ok) {
    return res.status(textResponse.status).json({
      error: data?.detail || "The ESV API request failed."
    });
  }

  if (!htmlResponse.ok) {
    return res.status(htmlResponse.status).json({
      error: htmlData?.detail || "The ESV HTML API request failed."
    });
  }

  const rawPassages = Array.isArray(data.passages) ? data.passages : [];
  const rawHtmlPassages = Array.isArray(htmlData.passages) ? htmlData.passages : [];
  const passageText = rawPassages.join("\n").trim();
  const passageHtml = rawHtmlPassages.join("\n").trim();
  const canonicalReference = cleanReferenceText(data.canonical || htmlData.canonical || "");

  if (!passageText) {
    return res.status(404).json({
      error: "No verse found. Check your reference, for example John 3:16."
    });
  }

  return res.json({
    reference: canonicalReference || reference,
    text: passageText,
    html: passageHtml,
    query: reference,
    version: "ESV",
    versionId: "ESV",
    versionLabel: "English Standard Version",
    source: "esv",
    ...metadata
  });
}
app.get("/api/verse-of-the-day", async (req, res) => {
  try {
    if (!YOUVERSION_API_KEY) {
      return res.status(500).json({
        error: "Missing YOUVERSION_API_KEY. Add it to your .env file first."
      });
    }

    const requestedVersion = String(req.query.version || "ESV").trim();
    const requestedVersionUpper = requestedVersion.toUpperCase();
    const votdList = await fetchYouVersionVerseOfTheDayList();
    const day = getCurrentDayOfYear();
    const verseOfTheDay = votdList.find(item => Number(item.day) === day) || votdList[0];

    if (!verseOfTheDay?.passage_id) {
      return res.status(404).json({
        error: "No verse of the day found."
      });
    }

    const humanReference = passageIdToHumanReference(verseOfTheDay.passage_id);
    const metadata = {
      feature: "verse-of-the-day",
      passageId: verseOfTheDay.passage_id,
      day
    };

    if (requestedVersionUpper === "ESV") {
      return loadEsvPassage(humanReference, req, res, metadata);
    }

    const apiBibleVersion = resolveApiBibleVersion(requestedVersion);
    if (apiBibleVersion) {
      return loadApiBiblePassage(humanReference, apiBibleVersion, req, res, metadata);
    }

    return loadYouVersionPassage(humanReference, requestedVersion, req, res, metadata);
  } catch (error) {
    console.error("Verse of the day loading error:", error);
    res.status(500).json({
      error: error.message || "Something went wrong while loading the verse of the day."
    });
  }
});
async function fetchYouVersionVerseOfTheDayList() {
  const votdUrl = new URL(`${YOUVERSION_API_BASE_URL}/verse_of_the_days`);
  votdUrl.searchParams.append("language_tag", "en");

  const response = await fetch(votdUrl, {
    headers: {
      Accept: "application/json",
      "x-yvp-app-key": YOUVERSION_API_KEY
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.detail?.[0]?.msg || data?.fault?.faultstring || "Could not load YouVersion verse of the day list.");
  }

  return Array.isArray(data?.data) ? data.data : [];
}

function getCurrentDayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function passageIdToHumanReference(passageId) {
  const cleanPassageId = String(passageId || "").trim();
  const match = cleanPassageId.match(/^([1-3]?[A-Z]{2,3})\.(\d+)\.(.+)$/);

  if (!match) {
    throw new Error(`Could not read verse of the day passage ID: ${cleanPassageId}`);
  }

  const bookCode = match[1];
  const chapter = match[2];
  const versePart = match[3];
  const bookName = BIBLE_CODE_NAMES[bookCode];

  if (!bookName) {
    throw new Error(`Could not recognise verse of the day book code: ${bookCode}`);
  }

  return `${bookName} ${chapter}:${versePart}`;
}

app.get("/api/youversion/status", (req, res) => {
  res.json({
    configured: Boolean(YOUVERSION_API_KEY),
    message: YOUVERSION_API_KEY
      ? "YOUVERSION_API_KEY is configured on the server."
      : "Missing YOUVERSION_API_KEY. Add it to your .env file first."
  });
});

app.get("/api/youversion/bibles-test", async (req, res) => {
  try {
    if (!YOUVERSION_API_KEY) {
      return res.status(500).json({
        error: "Missing YOUVERSION_API_KEY. Add it to your .env file first."
      });
    }

    const biblesUrl = new URL(YOUVERSION_BIBLES_URL);
    biblesUrl.searchParams.append("language_ranges[]", YOUVERSION_LANGUAGE_RANGES);

    const response = await fetch(biblesUrl, {
      headers: {
        Accept: "application/json",
        "x-yvp-app-key": YOUVERSION_API_KEY
      }
    });

    const contentType = response.headers.get("content-type") || "";
    const rawBody = await response.text();

    let body;
    try {
      body = contentType.includes("application/json") ? JSON.parse(rawBody) : rawBody;
    } catch {
      body = rawBody;
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: "YouVersion bibles test request failed.",
        status: response.status,
        statusText: response.statusText,
        endpoint: biblesUrl.toString(),
        responsePreview: typeof body === "string"
          ? body.slice(0, 500)
          : body
      });
    }

    const sample = Array.isArray(body)
      ? body.slice(0, 5)
      : Array.isArray(body?.data)
        ? body.data.slice(0, 5)
        : body;

    res.json({
      success: true,
      endpoint: biblesUrl.toString(),
      sample
    });
  } catch (error) {
    console.error("YouVersion bibles test error:", error);
    res.status(500).json({
      error: "Something went wrong while testing the YouVersion bibles endpoint.",
      details: error.message
    });
  }
});


app.get("/api/bible-versions", async (req, res) => {
  try {
    const versions = [
      {
        id: "ESV",
        abbreviation: "ESV",
        displayAbbreviation: "ESV",
        title: "English Standard Version",
        source: "esv"
      }
    ];

    if (API_BIBLE_KEY) {
      versions.push(...API_BIBLE_VERSIONS.map(bible => ({
        id: bible.id,
        abbreviation: bible.abbreviation,
        displayAbbreviation: bible.displayAbbreviation,
        title: bible.title,
        source: "api-bible"
      })));
    }

    res.json({ versions });
  } catch (error) {
    console.error("Bible versions loading error:", error);
    res.status(500).json({
      error: error.message || "Could not load Bible versions."
    });
  }
});

// --- API.Bible bibles test route ---
app.get("/api/api-bible/bibles-test", async (req, res) => {
  try {
    if (!API_BIBLE_KEY) {
      return res.status(500).json({
        error: "Missing API_BIBLE_KEY. Add it to your .env file first."
      });
    }

    const biblesUrl = new URL(`${API_BIBLE_BASE_URL.replace(/\/$/, "")}/bibles`);
    biblesUrl.searchParams.append("language", String(req.query.language || "eng"));

    const response = await fetch(biblesUrl, {
      headers: {
        Accept: "application/json",
        "api-key": API_BIBLE_KEY
      }
    });

    const contentType = response.headers.get("content-type") || "";
    const rawBody = await response.text();

    let body;
    try {
      body = contentType.includes("application/json") ? JSON.parse(rawBody) : rawBody;
    } catch {
      body = rawBody;
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: "API.Bible bibles test request failed.",
        status: response.status,
        statusText: response.statusText,
        endpoint: biblesUrl.toString(),
        responsePreview: typeof body === "string"
          ? body.slice(0, 800)
          : body
      });
    }

    const bibles = Array.isArray(body?.data) ? body.data : [];

    res.json({
      success: true,
      endpoint: biblesUrl.toString(),
      count: bibles.length,
      sample: bibles.slice(0, 10)
    });
  } catch (error) {
    console.error("API.Bible bibles test error:", error);
    res.status(500).json({
      error: "Something went wrong while testing the API.Bible bibles endpoint.",
      details: error.message
    });
  }
});

app.get("/api/api-bible/passage-test", async (req, res) => {
  try {
    if (!API_BIBLE_KEY) {
      return res.status(500).json({
        error: "Missing API_BIBLE_KEY. Add it to your .env file first."
      });
    }

    const bibleId = String(req.query.bibleId || "78a9f6124f344018-01").trim();
    const passageId = String(req.query.passageId || "JHN.3.16").trim();
    const passageUrl = new URL(`${API_BIBLE_BASE_URL.replace(/\/$/, "")}/bibles/${encodeURIComponent(bibleId)}/passages/${encodeURIComponent(passageId)}`);

    passageUrl.searchParams.append("content-type", "html");
    passageUrl.searchParams.append("include-notes", "false");
    passageUrl.searchParams.append("include-titles", "true");
    passageUrl.searchParams.append("include-chapter-numbers", "false");
    passageUrl.searchParams.append("include-verse-numbers", "true");
    passageUrl.searchParams.append("include-verse-spans", "false");

    const response = await fetch(passageUrl, {
      headers: {
        Accept: "application/json",
        "api-key": API_BIBLE_KEY
      }
    });

    const contentType = response.headers.get("content-type") || "";
    const rawBody = await response.text();

    let body;
    try {
      body = contentType.includes("application/json") ? JSON.parse(rawBody) : rawBody;
    } catch {
      body = rawBody;
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: "API.Bible passage test request failed.",
        status: response.status,
        statusText: response.statusText,
        endpoint: passageUrl.toString(),
        responsePreview: typeof body === "string"
          ? body.slice(0, 800)
          : body
      });
    }

    res.json({
      success: true,
      endpoint: passageUrl.toString(),
      response: body
    });
  } catch (error) {
    console.error("API.Bible passage test error:", error);
    res.status(500).json({
      error: "Something went wrong while testing the API.Bible passage endpoint.",
      details: error.message
    });
  }
});

app.get("/api/youversion/passage-test", async (req, res) => {
  try {
    if (!YOUVERSION_API_KEY) {
      return res.status(500).json({
        error: "Missing YOUVERSION_API_KEY. Add it to your .env file first."
      });
    }

    const bibleId = String(req.query.bibleId || "12").trim();
    const passageId = String(req.query.passageId || "GEN.1.1").trim();

    if (!bibleId || !passageId) {
      return res.status(400).json({
        error: "Please provide bibleId and passageId, for example bibleId=12&passageId=GEN.1.1."
      });
    }

    const passageUrl = new URL(`${YOUVERSION_API_BASE_URL}/bibles/${encodeURIComponent(bibleId)}/passages/${encodeURIComponent(passageId)}`);

    const response = await fetch(passageUrl, {
      headers: {
        Accept: "application/json",
        "x-yvp-app-key": YOUVERSION_API_KEY
      }
    });

    const contentType = response.headers.get("content-type") || "";
    const rawBody = await response.text();

    let body;
    try {
      body = contentType.includes("application/json") ? JSON.parse(rawBody) : rawBody;
    } catch {
      body = rawBody;
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: "YouVersion passage test request failed.",
        status: response.status,
        statusText: response.statusText,
        endpoint: passageUrl.toString(),
        responsePreview: typeof body === "string"
          ? body.slice(0, 800)
          : body
      });
    }

    res.json({
      success: true,
      endpoint: passageUrl.toString(),
      response: body
    });
  } catch (error) {
    console.error("YouVersion passage test error:", error);
    res.status(500).json({
      error: "Something went wrong while testing the YouVersion passage endpoint.",
      details: error.message
    });
  }
});

app.get("/api/youversion/votd-test", async (req, res) => {
  try {
    if (!YOUVERSION_API_KEY) {
      return res.status(500).json({
        error: "Missing YOUVERSION_API_KEY. Add it to your .env file first."
      });
    }

    const votdUrl = new URL(`${YOUVERSION_API_BASE_URL}/verse_of_the_days`);
    votdUrl.searchParams.append("language_tag", String(req.query.languageTag || "en"));

    const response = await fetch(votdUrl, {
      headers: {
        Accept: "application/json",
        "x-yvp-app-key": YOUVERSION_API_KEY
      }
    });

    const contentType = response.headers.get("content-type") || "";
    const rawBody = await response.text();

    let body;
    try {
      body = contentType.includes("application/json") ? JSON.parse(rawBody) : rawBody;
    } catch {
      body = rawBody;
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: "YouVersion verse of the day test request failed.",
        status: response.status,
        statusText: response.statusText,
        endpoint: votdUrl.toString(),
        responsePreview: typeof body === "string"
          ? body.slice(0, 800)
          : body
      });
    }

    res.json({
      success: true,
      endpoint: votdUrl.toString(),
      response: body
    });
  } catch (error) {
    console.error("YouVersion verse of the day test error:", error);
    res.status(500).json({
      error: "Something went wrong while testing the YouVersion verse of the day endpoint.",
      details: error.message
    });
  }
});

async function fetchYouVersionBibles() {
  if (!YOUVERSION_API_KEY) {
    throw new Error("Missing YOUVERSION_API_KEY. Add it to your .env file first.");
  }

  const now = Date.now();
  if (youVersionBiblesCache && now - youVersionBiblesCacheLoadedAt < YOUVERSION_BIBLES_CACHE_TTL_MS) {
    return youVersionBiblesCache;
  }

  const biblesUrl = new URL(YOUVERSION_BIBLES_URL);
  biblesUrl.searchParams.append("language_ranges[]", YOUVERSION_LANGUAGE_RANGES);

  const response = await fetch(biblesUrl, {
    headers: {
      Accept: "application/json",
      "x-yvp-app-key": YOUVERSION_API_KEY
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.detail?.[0]?.msg || data?.fault?.faultstring || "Could not load YouVersion Bible versions.");
  }

  const bibles = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

  youVersionBiblesCache = bibles.map(bible => ({
    id: String(bible.id),
    abbreviation: String(bible.abbreviation || bible.localized_abbreviation || bible.id).toUpperCase(),
    displayAbbreviation: String(bible.localized_abbreviation || bible.abbreviation || bible.id),
    title: String(bible.localized_title || bible.title || bible.abbreviation || bible.id),
    languageTag: bible.language_tag || "",
    books: Array.isArray(bible.books) ? bible.books : [],
    youversionDeepLink: bible.youversion_deep_link || ""
  }));

  youVersionBiblesCacheLoadedAt = now;
  return youVersionBiblesCache;
}

async function resolveYouVersionBibleVersion(version) {
  const requestedVersion = String(version || "").trim();
  const requestedVersionUpper = requestedVersion.toUpperCase();
  const bibles = await fetchYouVersionBibles();

  return bibles.find(bible =>
    bible.abbreviation === requestedVersionUpper ||
    bible.displayAbbreviation.toUpperCase() === requestedVersionUpper ||
    bible.id === requestedVersion
  );
}

function resolveApiBibleVersion(version) {
  const requestedVersion = String(version || "").trim();
  const requestedVersionUpper = requestedVersion.toUpperCase();

  return API_BIBLE_VERSIONS.find(bible =>
    bible.id === requestedVersion ||
    bible.abbreviation.toUpperCase() === requestedVersionUpper ||
    bible.displayAbbreviation.toUpperCase() === requestedVersionUpper
  );
}

function cleanReferenceText(reference) {
  return String(reference || "")
    .replace(/^\.+\s*/, "")
    .replace(/\.+$/, "")
    .trim();
}

function isBookOnlyReference(reference) {
  const normalised = normaliseReference(reference);
  return normalised.length > 0 && !/\d/.test(normalised);
}

function normaliseReference(reference) {
  return String(reference || "")
    .toLowerCase()
    .replace(/–|—/g, "-")
    .replace(/\s+/g, " ")
    .replace(/\s*:\s*/g, ":")
    .replace(/\s*-\s*/g, "-")
    .replace(/^hebrew\b/, "hebrews")
    .replace(/^psalm\b/, "psalms")
    .replace(/^song of songs\b/, "song of solomon")
    .replace(/^canticles\b/, "song of solomon")
    .replace(/^revelations\b/, "revelation")
    .trim();
}

function normaliseBookNameForLookup(bookName) {
  return String(bookName || "")
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseYouVersionReference(reference) {
  const cleanReference = String(reference || "")
    .replace(/–|—/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  const match = cleanReference.match(/^(.+?)\s+(\d+)(?::([\d,\s-]+))?$/);

  if (!match) return null;

  const rawBookName = match[1].trim();
  const chapter = match[2];
  const hasExplicitVerse = Boolean(match[3]);
  const versePart = hasExplicitVerse ? match[3].replace(/\s+/g, "") : "";
  const bookCode = BIBLE_BOOK_CODES[normaliseBookNameForLookup(rawBookName)];

  if (!bookCode) return null;

  return {
    bookCode,
    chapter,
    versePart,
    hasExplicitVerse,
    passageId: hasExplicitVerse ? `${bookCode}.${chapter}.${versePart}` : `${bookCode}.${chapter}`
  };
}

// --- YouVersion verse helpers ---

function escapeHtmlForServer(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function expandYouVersionVersePart(versePart) {
  const cleanVersePart = String(versePart || "").replace(/\s+/g, "").trim();
  if (!cleanVersePart) return [];

  const verseNumbers = [];

  cleanVersePart.split(",").forEach(part => {
    const rangeMatch = part.match(/^(\d+)(?:-(\d+))?$/);
    if (!rangeMatch) return;

    const start = Number(rangeMatch[1]);
    const end = rangeMatch[2] ? Number(rangeMatch[2]) : start;
    if (!Number.isFinite(start) || !Number.isFinite(end)) return;

    const lower = Math.min(start, end);
    const upper = Math.max(start, end);

    for (let verse = lower; verse <= upper; verse++) {
      verseNumbers.push(verse);
    }
  });

  return [...new Set(verseNumbers)];
}

async function fetchYouVersionPassageJson(versionConfig, passageId) {
  const passageUrl = new URL(`${YOUVERSION_API_BASE_URL}/bibles/${encodeURIComponent(versionConfig.id)}/passages/${encodeURIComponent(passageId)}`);

  const response = await fetch(passageUrl, {
    headers: {
      Accept: "application/json",
      "x-yvp-app-key": YOUVERSION_API_KEY
    }
  });

  const contentType = response.headers.get("content-type") || "";
  const rawBody = await response.text();

  let body;
  try {
    body = contentType.includes("application/json") ? JSON.parse(rawBody) : rawBody;
  } catch {
    body = rawBody;
  }

  return {
    response,
    body,
    passageUrl
  };
}

async function loadYouVersionVerseSequence(versionConfig, parsedReference) {
  const explicitVerseNumbers = expandYouVersionVersePart(parsedReference.versePart);
  const verseNumbers = parsedReference.hasExplicitVerse ? explicitVerseNumbers : [];
  const verses = [];

  if (parsedReference.hasExplicitVerse && !verseNumbers.length) {
    throw new Error("Please enter a valid verse number or range, for example John 1:1-5.");
  }

  if (parsedReference.hasExplicitVerse) {
    for (const verseNumber of verseNumbers) {
      const passageId = `${parsedReference.bookCode}.${parsedReference.chapter}.${verseNumber}`;
      const { response, body, passageUrl } = await fetchYouVersionPassageJson(versionConfig, passageId);

      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          statusText: response.statusText,
          endpoint: passageUrl.toString(),
          body
        };
      }

      verses.push({
        number: verseNumber,
        reference: body?.reference || "",
        content: String(body?.content || "").trim()
      });
    }

    return { ok: true, verses };
  }

  const maxVersesToCheck = 200;
  let missedAfterStarted = 0;

  for (let verseNumber = 1; verseNumber <= maxVersesToCheck; verseNumber++) {
    const passageId = `${parsedReference.bookCode}.${parsedReference.chapter}.${verseNumber}`;
    const { response, body } = await fetchYouVersionPassageJson(versionConfig, passageId);

    if (!response.ok || !String(body?.content || "").trim()) {
      if (verses.length > 0) {
        missedAfterStarted++;
        if (missedAfterStarted >= 3) break;
      }
      continue;
    }

    missedAfterStarted = 0;
    verses.push({
      number: verseNumber,
      reference: body?.reference || "",
      content: String(body?.content || "").trim()
    });
  }

  return { ok: true, verses };
}

function buildYouVersionPassageFromVerses(verses) {
  const validVerses = Array.isArray(verses)
    ? verses.filter(verse => verse && String(verse.content || "").trim())
    : [];

  return {
    text: validVerses.map(verse => `[${verse.number}] ${verse.content}`).join("\n"),
    html: validVerses.map(verse => (
      `<sup class="verse-number">${escapeHtmlForServer(verse.number)}</sup> ${escapeHtmlForServer(verse.content)}`
    )).join(" ")
  };
}


const dataDir = path.join(__dirname, "data");
const feedbackFile = path.join(dataDir, "feedback.json");

function ensureFeedbackFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(feedbackFile)) {
    fs.writeFileSync(feedbackFile, JSON.stringify([], null, 2));
  }
}

function readFeedbacks() {
  ensureFeedbackFile();

  try {
    const raw = fs.readFileSync(feedbackFile, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not read feedback file:", error);
    return [];
  }
}

async function sendFeedbackEmail(feedback) {
  if (!resend || !FEEDBACK_TO_EMAIL) {
    console.warn("Feedback email not sent: missing RESEND_API_KEY or FEEDBACK_TO_EMAIL.");
    return;
  }

  const { data, error } = await resend.emails.send({
    from: FEEDBACK_FROM_EMAIL,
    to: FEEDBACK_TO_EMAIL,
    subject: `New Memory Verse Helper feedback from ${feedback.name}`,
    text: [
      "New feedback submitted from Memory Verse Helper.",
      "",
      `Name: ${feedback.name}`,
      `Submitted: ${feedback.createdAt}`,
      "",
      "Feedback:",
      feedback.message
    ].join("\n")
  });

  if (error) {
    console.error("Resend email error:", error);
    throw new Error(error.message || "Resend could not send the email.");
  }

  console.log("Feedback email sent:", data);
}

app.post("/api/feedback", async (req, res) => {
  try {
    const name = String(req.body.name || "Anonymous").trim();
    const message = String(req.body.message || "").trim();

    if (!message) {
      return res.status(400).json({ error: "Feedback message cannot be empty." });
    }

    const feedbacks = readFeedbacks();

    const newFeedback = {
      id: crypto.randomUUID(),
      name: name || "Anonymous",
      message,
      createdAt: new Date().toISOString()
    };

    feedbacks.unshift(newFeedback);
    fs.writeFileSync(feedbackFile, JSON.stringify(feedbacks, null, 2));

    await sendFeedbackEmail(newFeedback);

    res.json({ success: true, feedback: newFeedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not save or email feedback." });
  }
});

app.get("/api/feedback", (req, res) => {
  try {
    const feedbacks = readFeedbacks();
    res.json({ feedbacks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not load feedback." });
  }
});

function clearFeedbacks(req, res) {
  try {
    ensureFeedbackFile();
    fs.writeFileSync(feedbackFile, JSON.stringify([], null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not clear feedback." });
  }
}

app.delete("/api/feedback", clearFeedbacks);
app.post("/api/feedback/clear", clearFeedbacks);

function normaliseApiBibleHtml(html) {
  return String(html || "")
    .replace(/<span([^>]*?)class="([^"]*\bv\b[^"]*)"([^>]*)>(\d+)<\/span>/g, '<sup class="verse-number">$4</sup> ')
    .replace(/<span([^>]*?)class='([^"]*\bv\b[^']*)'([^>]*)>(\d+)<\/span>/g, '<sup class="verse-number">$4</sup> ')
    .replace(/\s+<\/p>/g, "</p>")
    .trim();
}

function extractPlainTextFromApiBibleHtml(html) {
  return String(html || "")
    .replace(/<p[^>]*class="[^"]*\bs\d*\b[^"]*"[^>]*>.*?<\/p>/g, " ")
    .replace(/<p[^>]*class='[^']*\bs\d*\b[^']*'[^>]*>.*?<\/p>/g, " ")
    .replace(/<span([^>]*?)class="([^"]*\bv\b[^"]*)"([^>]*)>\d+<\/span>/g, " ")
    .replace(/<span([^>]*?)class='([^']*\bv\b[^']*)'([^>]*)>\d+<\/span>/g, " ")
    .replace(/<sup([^>]*)class="([^"]*\bverse-number\b[^"]*)"([^>]*)>\d+<\/sup>/g, " ")
    .replace(/<sup([^>]*)class='([^']*\bverse-number\b[^']*)'([^>]*)>\d+<\/sup>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Helper to fetch a passage from API.Bible as JSON (single passageId)
async function fetchApiBiblePassageJson(versionConfig, passageId) {
  const passageUrl = new URL(`${API_BIBLE_BASE_URL.replace(/\/$/, "")}/bibles/${encodeURIComponent(versionConfig.id)}/passages/${encodeURIComponent(passageId)}`);

  passageUrl.searchParams.append("content-type", "html");
  passageUrl.searchParams.append("include-notes", "false");
  passageUrl.searchParams.append("include-titles", "true");
  passageUrl.searchParams.append("include-chapter-numbers", "false");
  passageUrl.searchParams.append("include-verse-numbers", "true");
  passageUrl.searchParams.append("include-verse-spans", "false");

  const response = await fetch(passageUrl, {
    headers: {
      Accept: "application/json",
      "api-key": API_BIBLE_KEY
    }
  });

  const contentType = response.headers.get("content-type") || "";
  const rawBody = await response.text();

  let body;
  try {
    body = contentType.includes("application/json") ? JSON.parse(rawBody) : rawBody;
  } catch {
    body = rawBody;
  }

  return {
    response,
    body,
    passageUrl
  };
}

async function loadApiBiblePassage(reference, versionConfig, req, res, metadata = {}) {
  try {
    if (!API_BIBLE_KEY) {
      return res.status(500).json({
        error: "Missing API_BIBLE_KEY. Add it to your .env file first."
      });
    }

    const parsedReference = parseYouVersionReference(reference);
    if (!parsedReference) {
      return res.status(400).json({
        error: "Please enter a specific passage, for example John 3:16 or Romans 12:1-2."
      });
    }

    const passageIds = parsedReference.hasExplicitVerse
      ? expandYouVersionVersePart(parsedReference.versePart).map(verseNumber => `${parsedReference.bookCode}.${parsedReference.chapter}.${verseNumber}`)
      : [`${parsedReference.bookCode}.${parsedReference.chapter}`];

    if (parsedReference.hasExplicitVerse && !passageIds.length) {
      return res.status(400).json({
        error: "Please enter a valid verse number or range, for example John 3:16 or Romans 12:1-2."
      });
    }

    const passageResponses = [];

    for (const passageId of passageIds) {
      const result = await fetchApiBiblePassageJson(versionConfig, passageId);

      if (!result.response.ok) {
        return res.status(result.response.status).json({
          error: "API.Bible passage request failed.",
          status: result.response.status,
          statusText: result.response.statusText,
          endpoint: result.passageUrl.toString(),
          responsePreview: typeof result.body === "string"
            ? result.body.slice(0, 800)
            : result.body
        });
      }

      passageResponses.push(result.body?.data);
    }

    const rawPassageHtml = passageResponses
      .map(passage => String(passage?.content || "").trim())
      .filter(Boolean)
      .join("\n");

    const passageHtml = normaliseApiBibleHtml(rawPassageHtml);
    const canonicalReference = cleanReferenceText(
      passageResponses.length === 1
        ? passageResponses[0]?.reference || reference
        : reference
    );

    if (!passageHtml) {
      return res.status(404).json({
        error: "No verse found. Check your reference, for example John 3:16."
      });
    }

    const plainText = extractPlainTextFromApiBibleHtml(rawPassageHtml);

    return res.json({
      reference: canonicalReference,
      text: plainText,
      html: passageHtml,
      query: reference,
      version: versionConfig.displayAbbreviation,
      versionId: versionConfig.id,
      versionLabel: versionConfig.title,
      source: "api-bible",
      ...metadata
    });
  } catch (error) {
    console.error("API.Bible passage load error:", error);
    return res.status(500).json({
      error: error.message || "Something went wrong while loading the API.Bible passage."
    });
  }
}

async function loadYouVersionPassage(reference, version, req, res, metadata = {}) {
  try {
    if (!YOUVERSION_API_KEY) {
      return res.status(500).json({
        error: "Missing YOUVERSION_API_KEY. Add it to your .env file first."
      });
    }

    const parsedReference = parseYouVersionReference(reference);
    if (!parsedReference) {
      return res.status(400).json({
        error: "Please enter a specific passage, for example John 3:16 or Romans 12:1-2."
      });
    }

    const versionConfig = await resolveYouVersionBibleVersion(version);

    if (!versionConfig) {
      return res.status(400).json({
        error: `Unsupported Bible version: ${version}. Try checking /api/bible-versions for supported versions.`
      });
    }

    if (Array.isArray(versionConfig.books) && versionConfig.books.length && !versionConfig.books.includes(parsedReference.bookCode)) {
      return res.status(400).json({
        error: `${versionConfig.displayAbbreviation || version} does not appear to include ${parsedReference.bookCode}.`
      });
    }

    // --- REPLACEMENT BLOCK STARTS HERE ---
    const sequenceResult = await loadYouVersionVerseSequence(versionConfig, parsedReference);

    if (!sequenceResult.ok) {
      return res.status(sequenceResult.status || 500).json({
        error: "YouVersion passage request failed.",
        status: sequenceResult.status,
        statusText: sequenceResult.statusText,
        endpoint: sequenceResult.endpoint,
        responsePreview: typeof sequenceResult.body === "string"
          ? sequenceResult.body.slice(0, 800)
          : sequenceResult.body
      });
    }

    const passageParts = buildYouVersionPassageFromVerses(sequenceResult.verses);
    const passageText = passageParts.text.trim();
    const passageHtml = passageParts.html.trim();
    const canonicalReference = cleanReferenceText(
      sequenceResult.verses.length === 1
        ? sequenceResult.verses[0].reference || reference
        : reference
    );

    if (!passageText) {
      return res.status(404).json({
        error: "No verse found. Check your reference, for example John 3:16."
      });
    }

    return res.json({
      reference: canonicalReference,
      text: passageText,
      html: passageHtml,
      query: reference,
      version: versionConfig.displayAbbreviation || versionConfig.abbreviation || version,
      versionId: versionConfig.id,
      versionLabel: versionConfig.title,
      source: "youversion",
      ...metadata
    });
    // --- REPLACEMENT BLOCK ENDS HERE ---
  } catch (error) {
    console.error("YouVersion passage load error:", error);
    return res.status(500).json({
      error: error.message || "Something went wrong while loading the YouVersion passage."
    });
  }
}

app.listen(PORT, () => {
  console.log(`Bible Memory Trainer running at http://localhost:${PORT}`);
});
