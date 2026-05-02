# ESV Bible Memory Trainer — Save First Version

## New flow

1. Enter a Bible reference.
2. Click `Load Verse`.
3. The app displays the verse only.
4. Click `Save Verse`.
5. Practice options appear only after the verse is saved.
6. Click `Start Practice`.

The memory test only tests the verse text itself, not the reference.

## Setup

Create a `.env` file in this project folder:

```env
ESV_API_KEY=your_actual_esv_api_key_here
PORT=3000
```

Install packages:

```bash
npm install
```

Start:

```bash
npm start
```

Open:

```txt
http://localhost:3000
```

If your `.env` uses `PORT=300`, open `http://localhost:300`.

# Memory Verse Helper

Memory Verse Helper is a Bible memory web app that helps users load, save, and practise Bible verses using the ESV API. The app is designed to make Scripture memorisation more interactive through saved verse lists, fill-in-the-blank tests, hints, reveal tools, and feedback collection.

## Features

### Load Bible Verses

Users can enter a Bible reference such as:

- `John 3:16`
- `Psalm 23:1-3`
- `Romans 8:28`
- `Proverbs 6:25-26`

The app fetches the passage using the ESV API and displays it in the loaded verse section.

### Reference Validation

The app checks whether the reference entered by the user matches the passage returned by the ESV API. This helps prevent invalid references from accidentally loading a different passage.

For example:

- `Hebrews 14` will not silently load `Hebrews 13`
- Invalid chapters or verses are rejected
- Book-only searches such as `John` or `Hebrews` are allowed

The app also handles some common reference differences, such as:

- `Hebrew` → `Hebrews`
- `Psalm` → `Psalms`
- `Song of Songs` → `Song of Solomon`
- `Revelations` → `Revelation`

### Save Verses

Users can save loaded verses into a saved verse list.

Saved verses are stored in the browser using `localStorage`, so users can return to them later on the same device and browser.

Each saved verse stores:

- Bible reference
- Verse text
- Best score
- Number of attempts

### Saved Verse List

Saved verses appear in a side panel.

Users can:

- Search saved verses
- Load a saved verse
- Practise a saved verse
- Delete a saved verse
- Clear all saved verses

Saved verses are sorted in Bible order, from Old Testament to New Testament.

### Practice Mode

Saved verses can be practised using memory tests.

Users can choose a difficulty level and practice mode.

Difficulty options:

- Easy: 25% blanks
- Medium: 40% blanks
- Hard: 60% blanks
- Extreme: 80% blanks

Practice modes:

- Fill in blanks
- First-letter hints
- Full recall

### Fill-in-the-Blank Testing

The app hides selected words from the verse and asks the user to fill them in.

Answer checking is not case-sensitive and does not test punctuation.

For example, if the correct answer is:

```txt
Lord;
```

The user can type:

```txt
lord
```

and it will still be marked correct.

### Hints

The `Show Hint` button reveals one full missing word at a time.

Revealed hint words are highlighted in blue.

### Reveal Verse

The `Reveal Verse` button fills in all missing blanks directly inside the memory test.

Revealed answers are highlighted in blue.

### Score Tracking

After checking answers, the app displays a percentage score.

For saved verses, the app tracks:

- Best score
- Number of attempts

### Practice Button Behaviour

If a verse is not saved, the main button says:

```txt
Save Verse
```

If a verse is already saved, the button changes to:

```txt
Practice
```

Pressing `Practice` starts the memory test.

### Clear Buttons

The app includes clear buttons for better control:

- `Clear Loaded`: clears the loaded verse section
- `Clear Practice`: clears the current memory test
- `Clear Feedback`: removes submitted feedback

### Feedback Box

Users can submit feedback through a feedback form.

The feedback section includes:

- Name field
- Feedback message box
- Submit Feedback button
- Submitted feedback display
- Clear Feedback button

Feedback is saved on the server in:

```txt
data/feedback.json
```

Note: On hosted services such as Render, file-based feedback storage may not be permanent after redeploys or server restarts.

### Mobile-Friendly Layout

The app is designed to work on both desktop and mobile screens.

On smaller screens:

- Layout stacks vertically
- Buttons resize
- Saved verse list moves below the main section

## Tech Stack

- HTML
- CSS
- JavaScript
- Node.js
- Express
- ESV API
- Browser `localStorage`

## Project Structure

```txt
Memory_verse
├── public
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── server.js
├── package.json
├── package-lock.json
├── README.md
├── .gitignore
└── .env
```

## Environment Variables

Create a `.env` file in the root folder:

```env
ESV_API_KEY=your_esv_api_key_here
PORT=3000
```

Do not upload `.env` to GitHub.

## Recommended `.gitignore`

```txt
.env
node_modules
.DS_Store
data/feedback.json
```

## Running Locally

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm start
```

Open in browser:

```txt
http://localhost:3000
```

If your `.env` uses `PORT=300`, open:

```txt
http://localhost:300
```

## Hosting on Render

This app can be hosted on Render as a Node/Express web service.

Render settings:

```txt
Build Command: npm install
Start Command: npm start
```

Add the ESV API key in Render Environment Variables:

```txt
ESV_API_KEY = your_esv_api_key_here
```

## Notes

The ESV API is used for verse loading. The app should be used according to the ESV API terms and for non-commercial purposes.

Saved verses are stored per browser/device using `localStorage`. They do not automatically sync across devices.