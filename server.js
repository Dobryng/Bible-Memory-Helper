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
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FEEDBACK_TO_EMAIL = process.env.FEEDBACK_TO_EMAIL;
const FEEDBACK_FROM_EMAIL = process.env.FEEDBACK_FROM_EMAIL || "Memory Verse Helper <onboarding@resend.dev>";
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/verse", async (req, res) => {
  try {
    const reference = String(req.query.reference || "").trim();

    if (!reference) {
      return res.status(400).json({ error: "Please enter a Bible reference." });
    }

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

    const normalisedUserReference = normaliseReference(reference);
    const normalisedApiReference = normaliseReference(canonicalReference);
    const userEnteredBookOnly = isBookOnlyReference(reference);
    const bookOnlyMatch = userEnteredBookOnly && (
      normalisedApiReference === normalisedUserReference ||
      normalisedApiReference.startsWith(`${normalisedUserReference} `)
    );

    if (normalisedApiReference && normalisedUserReference !== normalisedApiReference && !bookOnlyMatch) {
      return res.status(400).json({
        error: `Did you mean ${canonicalReference}?`
      });
    }

    res.json({
      reference: canonicalReference || reference,
      text: passageText,
      html: passageHtml,
      query: reference
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong while loading the verse."
    });
  }
});


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

app.listen(PORT, () => {
  console.log(`Bible Memory Trainer running at http://localhost:${PORT}`);
});
