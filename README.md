# ESV Bible Memory Trainer

ESV Bible Memory Trainer is a Bible memory web app that helps users load, save, and practise Bible verses using the ESV API. The app is designed to make Scripture memorisation more interactive through saved verse lists, fill-in-the-blank practice, hints, reveal tools, score tracking, progress charts, and feedback collection.

## Current User Flow

1. Enter a Bible reference.
2. Click `Load Verse`.
3. The app displays only the loaded verse.
4. Click `Save Verse` to save it into the Memory List.
5. If the verse is already saved, the main button changes to `Practice`.
6. Click `Practice` to show the practice options.
7. Choose a difficulty.
8. Click `Start Practice`.
9. The practice options disappear and the fill-in-the-blank memory test appears.
10. Complete the blanks and click `Check Answer`.
11. The app shows the result and updates the saved verse progress.

The memory test only tests the verse words. It does not test the Bible reference, verse numbers, chapter numbers, or punctuation.

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

Start the app:

```bash
npm start
```

Open:

```txt
http://localhost:3000
```

If your `.env` uses `PORT=300`, open:

```txt
http://localhost:300
```

## Features

### Load Bible Verses

Users can enter a Bible reference such as:

- `John 3:16`
- `Psalm 23:1-3`
- `Romans 8:28`
- `Proverbs 6:25-26`

The app fetches the passage using the ESV API and displays it in the loaded verse section.

### ESV HTML Formatting

The app fetches both plain text and HTML from the ESV API.

The plain text is used for practice logic, while the HTML is used for the displayed verse so that headings, verse numbers, and ESV-style structure can be preserved more cleanly.

The loaded verse display now supports:

- ESV-style passage headings
- Italic section headings
- Hidden chapter numbers
- Styled verse numbers
- A more book-like serif reading font
- Better line spacing and reading layout

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
- ESV HTML
- Best score
- Number of attempts
- Score history
- Difficulty-specific progress
- HTML formatting version

### Silent Saved-Verse Migration

Older saved verses are automatically refreshed in the background when the app loads.

This allows saved verses to receive the latest ESV HTML formatting without requiring the user to delete and save them again.

The migration keeps the user’s progress data, including:

- Best score
- Attempts
- Score history
- Difficulty-specific progress

### Saved Verse List

Saved verses appear in a side Memory List panel.

Users can:

- Search saved verses
- Load a saved verse
- Practise a saved verse
- Delete a saved verse
- Clear all saved verses

Saved verses are sorted in Bible order, from Old Testament to New Testament.

The Memory List dynamically resizes based on the visible centre content, while the saved verse list inside remains scrollable.

### Practice Flow

The app currently uses fill-in-the-blank practice only.

Practice does not appear immediately after loading a verse. Instead:

1. Load or save a verse.
2. Press `Practice`.
3. Choose a difficulty.
4. Press `Start Practice`.
5. The practice options disappear and the memory test appears.

Difficulty options:

- Easy: 25% blanks
- Medium: 40% blanks
- Hard: 60% blanks
- Extreme: 80% blanks

### Custom Difficulty Picker

The difficulty selector has been changed from a normal dropdown into a custom button-style picker.

The active difficulty is highlighted, and the layout works responsively on smaller screens.

### Fill-in-the-Blank Testing

The app hides selected words from the verse and asks the user to fill them in.

The test does not include:

- Verse numbers
- Chapter numbers
- Bible references
- Punctuation-only tokens

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

### Checking Answers

When the user clicks `Check Answer`:

- Correct answers are marked green.
- Wrong answers are flagged but not replaced.
- Wrong answers remain editable.
- The first score is preserved.
- Later corrections do not overwrite the first score.

This allows users to correct themselves while still keeping the original attempt score accurate.

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
- Score history
- Progress by difficulty

The best score is colour-coded:

- Below 50%: red
- 50% to 69%: orange
- 70% to 100%: green

### Attempt Labels

The app gives an encouraging label based on the number of attempts:

- 0–9 attempts: `Just started`
- 10–49 attempts: `Building consistency`
- 50+ attempts: `Well practised`

### Progress Section

The Progress section does not appear when a verse is first loaded.

It only appears after the user completes a practice attempt and receives a score.

The Progress section shows:

- Bible reference
- Best score
- Number of attempts
- Attempt label
- Score progress chart

### Score Progress Chart

Each saved verse has a score progress chart.

The chart shows the user’s score across attempts.

Progress is tracked separately for each difficulty level:

- Easy
- Medium
- Hard
- Extreme

The chart uses colour-coded points:

- Red: below 50%
- Orange: 50% to 69%
- Green: 70% and above

### Practice Button Behaviour

If a verse is not saved, the main button says:

```txt
Save Verse
```

If a verse is already saved, the button changes to:

```txt
Practice
```

Pressing `Practice` shows the practice options only. The memory test appears only after pressing `Start Practice`.

### Clear Buttons

The app includes clear buttons for better control:

- `Clear Loaded`: clears the loaded verse section
- `Clear Practice`: clears the current memory test
- `Clear Feedback`: removes submitted feedback
- Memory List `Clear`: clears all saved verses

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

### Email Feedback Support

The project has support for sending feedback to an email address using Resend, depending on the configured server setup and environment variables.

### Responsive Layout

The app is designed to work on both desktop and mobile screens.

On smaller screens:

- Layout stacks vertically
- Buttons resize
- Saved verse list moves below the main section
- Difficulty picker becomes easier to use on narrow screens

## Tech Stack

- HTML
- CSS
- JavaScript
- Node.js
- Express
- ESV API
- Browser `localStorage`
- Optional Resend email integration

## Project Structure

```txt
Memory_verse
├── public
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── data
│   └── feedback.json
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

If using email feedback with Resend, include the required Resend-related environment variables based on your `server.js` setup.

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

## Important Development Note

If you edit files inside `public`, such as:

- `public/index.html`
- `public/styles.css`
- `public/app.js`

refreshing the browser is usually enough.

If you edit `server.js`, restart the backend server:

```bash
Ctrl + C
npm start
```

Then refresh the browser.

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

If using email feedback, also add the required email service environment variables in Render.

After changing `server.js`, commit and push to GitHub so Render can redeploy:

```bash
git add .
git commit -m "Update app"
git push
```

## Changelog

### Initial Version

- Set up the basic ESV Bible Memory Trainer web app.
- Added Bible reference input and verse loading through the ESV API.
- Added saved verse support using browser `localStorage`.
- Added a basic memory practice flow.
- Added the first fill-in-the-blank memory test.

### Saved Verse and Practice Flow Updates

- Changed the app so users must save a verse before practising it.
- Added a main button that changes from `Save Verse` to `Practice` when a verse is already saved.
- Updated the practice flow so loading a verse only shows the verse first.
- Updated the `Practice` button so it shows practice options before starting the test.
- Updated `Start Practice` so the practice options disappear and the test appears.
- Added a `Clear Loaded` button for the loaded verse section.
- Added a `Clear Practice` button for the practice section.
- Added saved verse actions for loading, practising, deleting, and clearing saved verses.

### Reference Validation Updates

- Added validation so invalid chapters or verses do not silently load a different passage.
- Prevented cases like `Hebrews 14` from loading `Hebrews 13`.
- Added support for book-only searches, such as `John` or `Hebrews`.
- Added handling for common naming differences, such as `Hebrew` to `Hebrews`, `Psalm` to `Psalms`, and `Revelations` to `Revelation`.

### Practice Test Updates

- Made fill-in-the-blank the main practice mode.
- Added difficulty levels: Easy, Medium, Hard, and Extreme.
- Replaced the original difficulty dropdown with a custom button-style difficulty picker.
- Updated answer checking so it is not case-sensitive.
- Updated answer checking so punctuation is not tested.
- Updated the practice test so verse numbers, chapter numbers, references, and punctuation-only tokens are not tested.
- Updated wrong answers so they are flagged instead of being replaced immediately.
- Allowed users to edit wrong answers after checking.
- Preserved the first attempt score so later corrections do not overwrite the original result.
- Changed hints so each hint reveals one full word instead of letters.
- Updated `Reveal Verse` so answers fill into the blanks directly and appear highlighted.

### Progress and Scoring Updates

- Added best score tracking for saved verses.
- Added attempt tracking for saved verses.
- Added score colour coding: red below 50%, orange below 70%, and green from 70% upward.
- Added attempt labels: `Just started`, `Building consistency`, and `Well practised`.
- Added a Progress section that appears after a completed practice attempt.
- Added a score progress chart inspired by Monkeytype-style progress tracking.
- Updated score charts so progress is tracked separately for each difficulty level.
- Added chart point colours based on score range.

### ESV Formatting Updates

- Updated the server to fetch both ESV plain text and ESV HTML.
- Used ESV HTML for the displayed verse so headings and verse structure can be preserved more cleanly.
- Added ESV-style passage headings.
- Styled headings as italic and placed them above the verse text.
- Hid chapter numbers from the displayed passage.
- Styled verse numbers to look closer to ESV-style superscript numbers.
- Updated the verse display font to a more book-like serif style.
- Added a silent one-time migration so older saved verses are refreshed with the latest ESV HTML formatting without losing progress data.

### Layout and Styling Updates

- Improved the overall visual design with warmer colours and rounded cards.
- Improved button styling and hover states.
- Added smoother message fade-out behaviour.
- Updated the Memory List so it resizes based on the visible centre content.
- Kept saved verses scrollable inside the Memory List.
- Improved the layout so the Feedback section moves up or down depending on what is visible above it.
- Improved responsive behaviour for laptop and mobile views.

### Feedback Updates

- Added a feedback form.
- Added submitted feedback display.
- Added a `Clear Feedback` button.
- Added server-side feedback storage using `data/feedback.json`.
- Added support for sending feedback by email using Resend, depending on the configured environment variables.

### Deployment and Documentation Updates

- Added setup instructions for `.env`, `npm install`, and `npm start`.
- Added Render deployment notes.
- Added development notes explaining when to refresh the browser and when to restart the Node server.
- Updated the README to document the current app flow, features, environment variables, project structure, and hosting notes.

## Notes

The ESV API is used for verse loading. The app should be used according to the ESV API terms and for non-commercial purposes.