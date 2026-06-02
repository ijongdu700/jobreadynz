# JobReady NZ — Claude Code Prompt Log

> A record of key prompts used to build this project with Claude Code.
> Useful for reference, debugging, and future development.

---

## Phase 2 — Project Setup

### Convert to Vite + React + TypeScript
```
I have an existing TypeScript project that I want to convert into a proper React + TypeScript app using Vite.

Current structure:
- src/index.ts
- JobReadyNZ.html (reference UI — this is what the final app should look like)
- package.json, tsconfig.json, .gitignore

Please:
1. Set up this project as a React + TypeScript + Vite app
2. Keep all existing files safe
3. Create this component structure inside src/:
   - components/Sidebar.tsx
   - pages/Dashboard.tsx
   - pages/Todo.tsx
   - pages/Diary.tsx
   - pages/AITools.tsx
   - pages/Interview.tsx
   - pages/Jobs.tsx
   - pages/Wellness.tsx
   - App.tsx
   - main.tsx
4. Use the JobReadyNZ.html as visual reference for the design and features
5. Use localStorage for Todo and Diary data persistence
```

### Clean up placeholder files
```
Please clean up the project files:
1. Delete `src/index.ts` — it's an empty placeholder file that's no longer needed
2. Move `JobReadyNZ.html` from the project root into a new folder called `_reference/`
Don't touch any other files.
```

---

## Phase 3 — OpenAI Backend

### Set up Express server + OpenAI proxy
```
I want to call the OpenAI API locally for personal use only (no deployment yet).

Please:
1. Update `vite.config.ts` to add a proxy so `/api/chat` routes to OpenAI during local dev

2. Create `src/api/chat.ts` — a simple fetch wrapper that:
   - POSTs to `/api/chat`
   - Sends { prompt } in the body
   - Returns the text response

3. Create a local Express server `server.ts` in the project root that:
   - Runs on port 3001
   - Has a POST `/api/chat` endpoint
   - Reads OPENAI_API_KEY from .env
   - Calls OpenAI API (gpt-4o-mini) and returns the response

4. Update `src/pages/AITools.tsx` to call `/api/chat` instead of Anthropic directly

5. Create `.env` file with placeholder:
   OPENAI_API_KEY=paste_your_key_here

6. Install required packages: openai, express, dotenv, cors, @types/express, @types/cors, tsx

7. Add to package.json scripts:
   "server": "tsx watch server.ts"
```

---

## Phase 4 — Daily Planner Redesign

### Rewrite Todo.tsx as notebook-style planner
```
Please rewrite src/pages/Todo.tsx completely with the following new design and features:

DESIGN — notebook/planner style:
- Left column: time (narrow, ~56px wide)
- Middle column: task text with a small coloured bullet point (flex: 1, takes most space)
- Right column: check button + delete button (~56px wide)
- A thin horizontal line separates each row (like a notebook)
- Checked tasks get a strikethrough on the text

DAY NAVIGATION:
- Show 3 days: yesterday, today, tomorrow
- Prev / Next buttons to navigate between days
- Display "Yesterday" / "Today" / "Tomorrow" as the heading label, with the actual date shown smaller below
- Clamp navigation so it never goes beyond yesterday (-1) or tomorrow (+1)

ADD TASK ROW (above the notebook):
- Time input: width 56px (keep it narrow)
- Text input: flex: 1 (takes up as much space as possible)
- Colour picker: a small circle swatch that opens a palette of 15 colours on click. Clicking outside closes it.
  Available colours:
  '#378ADD','#1D9E75','#BA7517','#D4537E','#7F77DD',
  '#D85A30','#639922','#E24B4A','#888780','#0F6E56',
  '#185FA5','#993556','#3B6D11','#854F0B','#533AB7'
- Add button
- Pressing Enter in the text input also adds the task

PROGRESS BAR:
- Thin bar (3–4px) showing done/total for the current day
- Small "X / Y done" label next to it

DATA:
- Each task has: id (number), time (string "HH:MM"), text (string), color (hex string), done (boolean)
- Store all days in localStorage under key 'jr_planner' as an object keyed by date string "YYYY-MM-DD"
- Tasks are sorted by time when rendered
- Todo.tsx manages its own state internally via localStorage — no props needed

TYPES:
- Define a PlannerTask interface inside Todo.tsx
- Remove the old TodoItem-based props — this component takes no props

Also update src/App.tsx:
- Remove the todos state and setTodos from App.tsx
- Remove the TodoItem import if no longer used elsewhere
- Update the renderPage case for 'todo' to just be <Todo /> with no props
```

### Replace time input with dropdowns
```
In src/pages/Todo.tsx, replace the time <input type="time"> in the add-task row with two separate <select> dropdowns side by side:
- First select: hours 06 to 22 (formatted as "06", "07", ... "22"), default "09"
- Second select: minutes, only two options "00" and "30", default "00"
- Display a ":" label between them
- The combined value passed to the task should still be "HH:MM" string format
Keep everything else exactly the same.
```

### Add inline edit to task rows
```
In src/pages/Todo.tsx, add an edit feature to each task row.

1. Add an edit button (pencil icon) to each task row, always visible, between the check circle and delete button
   Order: check circle → edit → delete
   Edit button icon color: white (var(--text)) so it's visible on dark background

2. When edit is clicked, that task row transforms inline into edit mode:
   - Time: becomes the same hour/minute select dropdowns as the add row
   - Text: becomes an input field pre-filled with current text
   - Color: becomes the color picker swatch pre-filled with current color
   - Two buttons: [Save] and [Cancel]
   - Only one row can be in edit mode at a time

3. Save updates the task in state and localStorage
   Cancel reverts back to normal view with no changes

4. Keep all existing styles and functionality exactly the same.
```

---

## Phase 5 — Wellness Redesign

### Full Wellness rewrite
```
Please rewrite src/pages/Wellness.tsx with the following changes:

1. CAT PETTING:
   - Large cat emoji changes based on click count:
     0: 🐱 "Click to pet!", 1–4: 😺 "Purring...", 5–9: 😸 "So happy!",
     10–14: 😻 "I love you!!", 15+: 😹 "Too much!!!"
   - Each click triggers a floating heart animation (❤️) that rises and fades
   - Cat bounces slightly on each click

2. STRESS BUSTER GAME:
   - Input field to type something stressful, press Enter or click "Launch it!"
   - Text appears as a floating bubble
   - Click bubble to explode it with CSS animation (scale up + fade + 6 fragments)
   - Show "💥 Gone! That stress is history." after explosion
   - Count of stresses destroyed saved to localStorage as 'jr_stresses_destroyed'

3. MUSIC (replaces Breathe card):
   - Card opens https://youtu.be/UMcqpEuMUrs?si=3jfVaDm-ee1rwYTE in a new tab
   - Below the grid: editable link field saved to localStorage as 'jr_music_link'
   - Default: Animal Crossing BGM link above

4. BREATHING (fixed timer bug):
   - 'in' (4s) → 'hold' (4s) → 'out' (4s) × 3 rounds then 'done'
   - useRef to store all timer IDs, stopBreathing() clears them all on Stop
   - Round counter: "Round X of 3"
   - Completion message: "Well done! 3 rounds complete."

5. PROGRESS — shows stats from localStorage:
   - Today's tasks from jr_planner
   - Total diary entries + streak from jr_diaries
   - Total stresses destroyed from jr_stresses_destroyed
   - Back button to return to wellness grid

Remove the green "Remember:" card at the bottom.
Keep the Kind Note card and onToast prop.
```

### Fix breathing timer bug (standalone)
```
In src/pages/Wellness.tsx, fix the breathing exercise timer bug.

The problem: clicking Stop doesn't cancel already-scheduled setTimeout calls,
so phases keep firing after the user stops.

Rewrite only the breathing logic using useRef to store timer IDs and cancel them all on Stop:
- Store every setTimeout return value in a ref array (timerRefs)
- Add a stopBreathing() function that calls clearTimeout() on every stored timer ID
- Stop button calls stopBreathing() instead of just setBreathPhase(null)
- Each full cycle: 'in' (4s) → 'hold' (4s) → 'out' (4s), repeated 3 times, then 'done'
- Round counter: "Round X of 3"
- On component unmount, also clear all timers

Do not change anything else in the file.
```

---

## Phase 5 — Diary Improvement

### Add inline delete confirmation
```
In src/pages/Diary.tsx, add a delete button to each past diary entry with a confirmation step:

1. Each entry in the past entries list gets a small delete button on the right side, visible on hover

2. When delete is clicked, DO NOT delete immediately. Show inline confirmation inside that entry:
   "Delete this entry?" with two buttons: [Yes, delete] and [Cancel]
   - No browser alert() or confirm() — keep it inline in the UI
   - Only one confirmation open at a time

3. [Yes, delete] removes the entry from state and localStorage
   [Cancel] closes confirmation, does nothing

Keep all existing diary functionality exactly the same.
```

---

## Phase 6 — Job Agent

### Adzuna API job refresh endpoint
```
Add a Job Agent feature to the existing Express server and Jobs page.

In server.ts, add:

GET /api/jobs — reads and returns data/jobs.json

POST /api/jobs/refresh using Adzuna API:
- Base URL: https://api.adzuna.com/v1/api/jobs/nz/search/1
- Params: app_id, app_key (from .env), results_per_page=20, what=[keyword]
- Use encodeURIComponent for keywords
- Add Content-Type: application/json as a fetch header (NOT query param)
- Keywords: 'graduate IT', 'junior developer', 'data analyst graduate',
  'computer science graduate', 'mathematics graduate', 'junior analyst',
  'trader', 'graduate', 'entry level', 'IT support', 'data analyst',
  'software engineer', 'systems analyst', 'ai'
- Fetch page 1 and page 2 for each keyword
- Deduplicate by job ID

For each unique job, send title + description (first 500 chars) to OpenAI:
  "You are a job filter for a recent CS/Maths graduate in NZ with a PSWV.
   Return JSON only: { suitable: boolean, reason: string }
   Exclude: NZ citizenship/PR required, 1+ years experience, senior/intermediate level.
   Include: entry level, graduate, no experience required, work visa ok, CS/Maths relevant."

Save to data/jobs.json: { lastUpdated: string, jobs: [...] }
Create data/ directory, add to .gitignore.
Install: rss-parser (if needed), node-fetch

In src/pages/Jobs.tsx:
- Load jobs from GET /api/jobs on mount
- "Refresh Jobs" button calls POST /api/jobs/refresh with SSE progress bar
- Show "Last updated: [time]"
- Job cards: title, company, location, source badge, AI reason, "Apply →" link
- If no data: "Click Refresh to find jobs"
```

### Add SSE real-time progress
```
Add real-time progress updates to the job refresh feature using Server-Sent Events (SSE).

In server.ts, change POST /api/jobs/refresh to use SSE:
- Headers: Content-Type: text/event-stream, Cache-Control: no-cache, Connection: keep-alive
- Send progress events: data: JSON.stringify({ type, message, current, total })\n\n
- Events:
  * { type: 'start', message: 'Fetching jobs from Adzuna...' }
  * { type: 'fetch', message: 'Found X jobs, removing duplicates...' }
  * { type: 'analyse', message: 'Analysing job X of Y...', current: X, total: Y }
  * { type: 'done', message: 'Found X suitable jobs!', jobs: [...] }
  * { type: 'error', message: 'Something went wrong' }

In src/pages/Jobs.tsx:
- Use EventSource to connect to /api/jobs/refresh
- Progress bar fills based on current/total
- Show current message below bar
- type === 'done': close EventSource, update jobs state
- Show percentage: "Analysing... 45%"
- Replace any time estimate text with "This may take a while"
```

---

## Phase 7 — News Automation

### News endpoint + Dashboard card
```
Add a news feature to the app.

In server.ts, add:

GET /api/news — reads and returns data/news.json. If not exists: { lastUpdated: null, articles: [] }

POST /api/news/refresh:
- Call OpenAI with web_search_preview tool enabled
- Prompt:
  "Search for today's top news in these two categories:
   1. AI & Technology: latest AI developments, new models, tech industry news (3 articles)
   2. NZ Job Market: NZ employment trends, IT job market, graduate hiring news (2 articles)
   Return JSON array only:
   [{ title, summary (2-3 sentences), url (real URLs only, never fabricate), source, category: 'AI & Tech' | 'NZ Jobs' }]"
- Save to data/news.json: { lastUpdated: string, articles: [...] }

In src/pages/Dashboard.tsx:
- Fetch GET /api/news on mount
- News card titled "📰 Today's News" with lastUpdated time
- Each article: category badge (purple=AI, green=NZ Jobs), title, summary, source
- Click article → opens URL in new tab
- Hover effect on each article row
- "Refresh news" button in card header
- Loading state: "Fetching latest news..."
- Empty state: "No news yet — click Refresh to load"

Add data/news.json to .gitignore.
```

---

## Dashboard Improvements

### Replace Jobs Waiting with Last Job Scan
```
In src/pages/Dashboard.tsx, replace the "Jobs waiting" stat card with a "Last job scan" card.
- Read data/jobs.json via GET /api/jobs (already exists)
- Display lastUpdated formatted as "Today 3:45pm" / "Yesterday 7:12pm" / "May 19, 3:45pm"
- If no scan yet: show "Never — hit Refresh!"
- Keep card style exactly the same as other stat cards
```

### Make stat cards clickable
```
In src/pages/Dashboard.tsx, make the stat cards clickable to navigate to their pages.

Add { onNavigate }: { onNavigate: (page: PageId) => void } to Dashboard props.
Update App.tsx to pass onNavigate={setPage} to <Dashboard>.

Navigation:
- "Tasks today" → 'todo'
- "Diary entries" → 'diary'
- "Last job scan" → 'jobs'

Add cursor: pointer and subtle hover effect to each clickable card.
```

### Remove Today's Job Match card
```
In src/pages/Dashboard.tsx, remove the "Today's job match" card section completely.
Keep everything else exactly the same.
```

---

## Misc Fixes

### Fix .gitignore and remove tracked files
```
Update .gitignore to add:
.DS_Store
Thumbs.db
.idea/
/.vite
/build
logs/
*.log
.n8n/
.claude/

Then remove already-tracked files:
git rm --cached .DS_Store
git rm -r --cached .claude
git commit -m "Remove .DS_Store and .claude from tracking"
git push
```

---

## Notes on Claude Code Usage

- Use `/clear` to reset Claude Code memory between major approach changes
- If Claude Code goes in the wrong direction autonomously, use `/clear` and restart with a more specific prompt
- Keep prompts focused on one feature at a time
- Always specify "do not change anything else" to prevent unintended edits
- When debugging, ask Claude Code to log the exact values being used before fixing

