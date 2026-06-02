# JobReady NZ — Development Log

> A personal web app project built for NZ IT job seekers. Designed for a recent CS/Maths graduate holding a Post Study Work Visa (PSWV).

---

## Project Overview

| Item | Detail |
|------|--------|
| Project Name | JobReady NZ |
| Purpose | All-in-one job search dashboard for NZ IT graduates |
| Target User | Recent graduate with no IT work experience, PSWV visa holder |
| Development Approach | AI-assisted feature-by-feature development → componentisation → integrated product |

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | CSS (CSS Variables, dark theme) |
| Data Storage | localStorage (MVP stage) |
| AI | OpenAI API (gpt-4o-mini) — via local Express server |
| Job Data | Adzuna API (free, NZ included, 20+ countries) |
| Automation | n8n (local, auto news refresh daily at 8am) |
| Dev Tools | Claude Code (terminal), WebStorm |
| Deployment | Vercel (planned) |

---

## Project Structure

```
jobreadynz/
├── index.html                  # Vite HTML entry point (font loading)
├── vite.config.ts              # Vite + React plugin + /api proxy (→ localhost:3001)
├── tsconfig.json               # TypeScript config (react-jsx, ESNext)
├── tsconfig.node.json          # TypeScript config for vite.config.ts
├── package.json                # Dependencies + "server" script
├── server.ts                   # Express server (port 3001) — OpenAI & Adzuna API handling
├── .env                        # API keys (excluded from git)
├── .gitignore
├── data/
│   ├── jobs.json               # Adzuna job results cache (excluded from git)
│   └── news.json               # News results cache (excluded from git)
├── _reference/
│   └── JobReadyNZ.html         # Initial prototype (design reference)
└── src/
    ├── main.tsx                # React root mount (createRoot)
    ├── App.tsx                 # Root component (type definitions, toast, page routing)
    ├── index.css               # Global styles (CSS variables, dark theme)
    ├── vite-env.d.ts           # Vite type declarations
    ├── api/
    │   └── chat.ts             # Fetch wrappers: chat(prompt), chatWithHistory(messages, system?)
    ├── components/
    │   └── Sidebar.tsx         # Fixed sidebar (navigation + PSWV visa badge)
    └── pages/
        ├── Dashboard.tsx       # Stats cards, quote card, task preview, news feed
        ├── Todo.tsx            # Notebook-style time planner (colour picker, 3-day navigation)
        ├── Diary.tsx           # Mood picker, diary entries, date-based storage, delete confirm
        ├── AITools.tsx         # CV analysis, cover letter, LinkedIn summary, skills gap
        ├── Interview.tsx       # AI mock interview agent (chat format, NZ IT focused)
        ├── Jobs.tsx            # Adzuna job cards + real-time SSE progress bar
        └── Wellness.tsx        # Cat petting, stress buster game, music, breathing, kind note
```

---

## Features

### ✅ Implemented

| Feature | Description | File |
|---------|-------------|------|
| Dashboard | Date display, quote card, task/diary/job stats, news feed, page navigation | `pages/Dashboard.tsx` |
| Daily Planner | Notebook-style timetable, colour picker, yesterday/today/tomorrow navigation, inline edit | `pages/Todo.tsx` |
| Diary | Mood tracking, date-based entries, past entry viewer, inline delete confirmation | `pages/Diary.tsx` |
| AI Tools | CV analysis / cover letter / LinkedIn About / skills gap — OpenAI powered | `pages/AITools.tsx` |
| Interview Prep | OpenAI interviewer agent (one question at a time + feedback, NZ IT focused) | `pages/Interview.tsx` |
| Job Finder | Adzuna API NZ job filtering, real-time SSE progress bar, direct job links | `pages/Jobs.tsx` |
| Wellness | Cat petting, stress buster game, music link, breathing exercise, kind note | `pages/Wellness.tsx` |
| News Automation | n8n schedules daily 8am AI & NZ job market news, displayed on Dashboard | `pages/Dashboard.tsx` |
| Random Toast | Motivational message popup on app open | `App.tsx` |

### 🔜 Planned

| Feature | Description | Priority |
|---------|-------------|----------|
| Application Tracker | Log company / position / date / status manually, Gmail integration later | 🔥 Next |
| Skill Tracker | Soft & technical skills log with context (where learned, how used) | 📅 Further dev |
| Vercel Deployment | Deploy to a public URL when ready | 📅 Further dev |
| Database | Upgrade from localStorage to Supabase or similar | 📅 Further dev |

---

## Where AI Is Used

| Location | AI Role | Model | Route |
|----------|---------|-------|-------|
| `pages/AITools.tsx` | CV analysis, cover letter, LinkedIn summary, skills gap | gpt-4o-mini | `chat(prompt)` → `/api/chat` → `server.ts` |
| `pages/Interview.tsx` | NZ IT mock interview agent (Q&A + feedback) | gpt-4o-mini | `chatWithHistory(messages, system)` → `/api/chat` → `server.ts` |
| `pages/Jobs.tsx` | Adzuna job JD analysis & PSWV suitability filtering | gpt-4o-mini | `/api/jobs/refresh` → `server.ts` |
| `pages/Dashboard.tsx` | Daily AI & NZ job market news web search + summary | gpt-4o-mini (web_search_preview) | n8n → `/api/news/refresh` → `server.ts` |

**API Request Flow:**
```
UI (React) → src/api/chat.ts → Vite proxy → server.ts (Express:3001) → OpenAI API
n8n scheduler (daily 8am) → POST /api/news/refresh → server.ts → OpenAI web search
```

---

## Dev Commands

```bash
# Two terminals required to run the app

# Terminal 1 — Express server (reads API keys, port 3001)
npm run server

# Terminal 2 — Vite dev server (http://localhost:5173)
npm run dev

# n8n automation (separate terminal or background)
n8n start   # → http://localhost:5678

# Production build
npm run build

# TypeScript type check
npx tsc --noEmit
```

> ⚠️ The following keys are required in `.env` (never committed to git):
> ```
> OPENAI_API_KEY=sk-...
> ADZUNA_APP_ID=...
> ADZUNA_API_KEY=...
> ```

---

## Development History

### Phase 1 — Prototype (2025-05-19)
- Built a full UI prototype as a single HTML file in claude.ai chat (`JobReadyNZ.html`)
- Established design concept: dark theme, DM Sans + DM Serif Display fonts
- Implemented all features in one file using React via CDN
- Confirmed MVP worked directly in the browser with no build step

### Phase 2 — Project Restructure (2025-05-19)
- Converted to a proper Vite + React + TypeScript project using Claude Code
- Separated into components: `Sidebar`, `Dashboard`, `Todo`, `Diary`, `AITools`, `Interview`, `Jobs`, `Wellness`
- Fixed TypeScript configuration errors (`tsconfig.json` references removed)
- Confirmed clean build (`npm run build` passed)
- Deleted `src/index.ts`, moved `JobReadyNZ.html` to `_reference/`

### Phase 3 — OpenAI Backend Integration (2025-05-19)
- **Problem:** Direct browser API calls blocked by CORS + API key exposure risk
- **Solution:** Introduced local Express server (`server.ts`) to keep API keys server-side only
- Created `server.ts` — Express server (port 3001), `/api/chat` endpoint
  - `{ prompt }` format: single-message calls for AITools
  - `{ messages, system }` format: conversation history for Interview
- Created `src/api/chat.ts` — two fetch wrapper functions
  - `chat(prompt)` — simple call for AITools
  - `chatWithHistory(messages, system?)` — history-aware call for Interview
- Updated `vite.config.ts` — proxies `/api` requests to `localhost:3001`
- Switched AI model: Anthropic Claude → **OpenAI gpt-4o-mini**

### Phase 4 — Daily Planner Redesign (2025-05-20)
- Rewrote `Todo.tsx` completely — category tags → notebook-style time planner
- Component now manages its own state independently via localStorage
- localStorage key changed: `jr_todos` → `jr_planner` (structure: `{ "YYYY-MM-DD": PlannerTask[] }`)
- 3-column notebook layout: time (56px) · bullet + text (flex:1) · check/edit/delete (56px)
- Colour picker: 15-colour palette, one per task, always visible edit button
- Day navigation: yesterday / today / tomorrow
- Inline edit: modify time, text, and colour without leaving the row
- Progress bar (3px) + "X / Y done" label
- `Dashboard.tsx` reads today's tasks directly from `jr_planner` via `getTodayTasks()`

### Phase 5 — Wellness Redesign + Bug Fixes (2025-05-20)
- **Cat petting:** Expression changes by click count (`🐱→😺→😸→😻→😹`), floating heart animation on each click
- **Stress Buster game:** Type stress → bubble appears → click to explode 💥, destroy count saved to localStorage
- **Music:** Animal Crossing BGM as default link, user-editable, saved to localStorage
- **Breathing timer bug fix:** Replaced nested `setTimeout` with `useRef` timer tracking; Stop button now works immediately with no ghost phase firing
- **Progress → Breathe:** Removed Progress card (redundant with Dashboard), restored Breathe card
- Removed "Remember" motivational card, updated AI Tools subtitle
- **Diary delete confirmation:** Inline confirmation UI instead of browser `alert()`

### Phase 6 — Job Agent Development (2025-05-21)

**Original Goal:**
- AI Agent to automatically scan NZ IT jobs daily at 7pm NZT
- Targets: Seek NZ, LinkedIn, Trade Me
- OpenAI to read and filter JDs (experience required, citizenship/PR only, senior level)

**Attempt 1 — RSS / Scraping ❌**
- Tried fetching Seek NZ, Trade Me, and Indeed RSS feeds directly
- Claude Code autonomously switched to Indeed mid-session
- **Result:** All returned 403 Forbidden (bot detection)
- Used `/clear` to reset Claude Code memory and switched approach

**Attempt 2 — OpenAI Web Search ❌**
- Used `web_search_preview` tool to let OpenAI search for jobs directly
- No scraping required
- **Result:** URL hallucination — fabricated non-existent job URLs (e.g. `/job/12345678`)
- Tried fallback search links but couldn't reliably find the exact listing
- Used `/clear` to reset memory and switched approach

**Attempt 3 — Adzuna API ✅**
- Adzuna: official job data API provider (free, legitimate, NZ included, 20+ countries)
- Signed up at `developer.adzuna.com` → received `app_id` + `app_key`
- Debugging process:
  - `content-type` must be an HTTP header, not a query parameter (was causing 400 errors)
  - Removed unsupported `sort_by` and `days_old` params
  - Used `encodeURIComponent` for keyword encoding
- **Result:** Working correctly, returning real job URLs

**Search Keywords (current):**
`graduate IT`, `junior developer`, `data analyst graduate`, `computer science graduate`, `mathematics graduate`, `junior analyst`, `trader`, `graduate`, `entry level`, `IT support`, `data analyst`, `software engineer`, `systems analyst`, `ai`

**Final Architecture:**
```
POST /api/jobs/refresh
    ↓ Adzuna API (14 keywords × 2 pages = up to 560 jobs)
    ↓ Deduplicate by job ID
    ↓ OpenAI filters each JD (citizenship / experience / seniority)
    ↓ Save to data/jobs.json
    ↓ SSE streams real-time progress → Jobs.tsx progress bar
```

**Filter Criteria:**
- ❌ Exclude: NZ citizenship/PR required, 1+ years experience, senior/intermediate level
- ✅ Include: entry level/graduate, work visa accepted, CS or Maths degree relevant

**Decision:** Dropped daily auto-refresh in favour of manual Refresh button. n8n automation can be added later if needed.

### Phase 7 — News Automation + Dashboard Improvements (2025-05-22)

**News Automation:**
- Added `POST /api/news/refresh` endpoint to `server.ts`
- OpenAI `web_search_preview` tool fetches and summarises daily news
- Two categories: AI & Tech (3 articles) + NZ Job Market (2 articles)
- Results saved to `data/news.json`, displayed as clickable cards on Dashboard
- Clicking an article opens the original source in a new tab

**n8n Automation:**
- Installed n8n locally (`npm install -g n8n`)
- Built workflow: Schedule Trigger (daily 8am) → HTTP Request (`POST /api/news/refresh`)
- Published and activated — news now refreshes automatically every morning

**Dashboard Improvements:**
- Replaced "Jobs waiting" stat card with "Last job scan" (reads `lastUpdated` from `data/jobs.json`)
- Made stat cards clickable — each navigates to its corresponding page (Tasks→Todo, Diary→Diary, Last scan→Jobs)

### Phase 8 — Learning Path Page (2025-05-25)

**Background:**
- Difficult to know what to learn without real work experience
- Integrated a 10-month learning plan (created with ChatGPT + Claude) into the app
- Serves as a skill tracking tool and direction guide

**Design decisions:**
- Removed Phase 5 (Portfolio) — skills-only focus
- No time periods shown (removed "Month 1-2" etc.) — actively applying now, no deadline pressure
- 4 default phases fixed as a base, freely extendable with AI

**Default 4 phases:**
1. Cloud Fundamentals (Azure)
2. Docker + CI/CD
3. LLMs in Production
4. Agentic Systems + Architecture

**Core features:**
- Overall progress bar (completed / total skills)
- Collapsible phase cards
- Skill checklist with strikethrough on completion
- Individual skill delete (hover to reveal ×)
- Phase delete with inline confirmation
- Manual skill addition per phase
- Add new phase button

**AI Skill Planner:**
- "What do you want to learn?" input
- OpenAI generates specific, practical skills + resources
- Choose which phase to add skills to
- Pick individual skills to add (not forced to take all)
- "Try again" to regenerate

**Resources feature:**
- 1-2 learning resources per skill
- Click skill to expand resources
- Type badges: official (blue), free (green), paid (amber)
- Click to open in new tab
- AI-generated skills also include auto-generated resources
- Default phase skills pre-loaded with official docs and YouTube resources

**Data:**
- Stored in localStorage under `jr_learning`
- Structure: `{ phases: [{ id, name, description, skills: [{ id, text, done, resources }] }] }`
- Check state and custom skills persist across sessions

### Phase 9 — Application Tracker (2025-05-25)

**Core features:**
- Log company, role, date, status, note, URL, and JD for each application
- 6 status types: Applied, In Review, Interview, Offer, Rejected, Withdrawn
- Colour-coded status badges: blue / amber / purple / green / gray / gray
- 4 stat cards: total applied, interview rate, active applications, offers
- Filter bar: All / Applied / Interview / Offer / Rejected (with counts)
- Sorted by date descending (newest first)

**Per application:**
- Company name becomes a clickable link if URL is provided
- JD is collapsed by default — click "JD ▸" chip to expand (optional field)
- Note: single line, short
- Inline edit mode
- Delete with inline confirmation ("Delete this application? [Yes, delete] [Cancel]")

**Data:**
- Stored in localStorage under `jr_applications`
- Structure: `[{ id, company, role, date, status, note, jd, url }]`

### Phase 10 — Data Backup/Restore + Timezone Fix (2025-05-27)

**Background:**
- A forced Windows update shut down the app, wiping all localStorage data
- 65 job application records in the Application Tracker were permanently lost
- Added Export/Import backup feature to prevent recurrence

**Export/Import feature:**
- Export and Import buttons added to the bottom of the Sidebar
- Export: bundles all localStorage keys (`jr_planner`, `jr_diaries`, `jr_applications`, `jr_learning`, `jr_stresses_destroyed`, `jr_music_link`) into a single JSON file
- Filename format: `jobreadynz-backup-YYYY-MM-DD.json`
- Import: opens file picker → inline confirmation → restores all keys to localStorage → page refresh
- Import overwrites existing data — confirmation prompt prevents accidents
- Multiple backup files can coexist; user selects which one to restore

**Recommended backup habits:**
- After entering a lot of data
- Before Windows updates
- Before any major changes
→ Always Export first

**Timezone fix:**
- Problem: server ran on UTC, so before NZT noon the app showed yesterday's date
- Fix: unified all frontend files and server to NZT (Pacific/Auckland)
- Frontend: `toLocaleDateString('en-CA', { timeZone: 'Pacific/Auckland' })` pattern across all files
- Server: `process.env.TZ = 'Pacific/Auckland'` added at the top of server.ts
- Files updated: `Dashboard.tsx`, `Todo.tsx`, `Diary.tsx`, `Wellness.tsx`, `Tracker.tsx`, `server.ts`
- All localStorage keys now consistently generated in NZT

---

*This document is updated continuously as the project develops.*
