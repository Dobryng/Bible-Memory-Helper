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
