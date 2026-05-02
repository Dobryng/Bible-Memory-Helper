import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const ESV_API_KEY = process.env.ESV_API_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      "include-passage-references": "true",
      "include-verse-numbers": "false",
      "include-first-verse-numbers": "false",
      "include-footnotes": "false",
      "include-footnote-body": "false",
      "include-headings": "false",
      "include-short-copyright": "false",
      "include-copyright": "false",
      "indent-using": "space"
    });

    const response = await fetch(`https://api.esv.org/v3/passage/text/?${params}`, {
      headers: { Authorization: `Token ${ESV_API_KEY}` }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.detail || "The ESV API request failed."
      });
    }

    const rawPassages = Array.isArray(data.passages) ? data.passages : [];
    const passageText = rawPassages.join("\n").trim();

    if (!passageText) {
      return res.status(404).json({
        error: "No verse found. Check your reference, for example John 3:16."
      });
    }

    res.json({
      reference: data.canonical || reference,
      text: passageText,
      query: reference
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong while loading the verse."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Bible Memory Trainer running at http://localhost:${PORT}`);
});
