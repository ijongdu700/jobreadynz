# JobReady NZ — 개발 로그 (Dev Log)

> 취업준비생을 위한 웹앱 프로젝트. NZ IT graduate, PSWV 비자 보유자를 위해 설계됨.

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | JobReady NZ |
| 목적 | NZ IT 취업 준비를 위한 올인원 대시보드 |
| 대상 | IT 경험 없는 recent graduate, PSWV 비자 보유자 |
| 개발 방식 | AI로 기능 단위 코드 생성 → 컴포넌트화 → 하나의 앱으로 통합 |

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | React 18 + TypeScript |
| 빌드 도구 | Vite 5 |
| 스타일 | CSS (CSS Variables 기반 다크 테마) |
| 데이터 저장 | localStorage (MVP 단계) |
| AI | OpenAI API (gpt-4o-mini) — 로컬 Express 서버 경유 |
| 잡 데이터 | Adzuna API (무료, NZ 포함 20개국) |
| 자동화 | n8n (로컬, 뉴스 매일 8am 자동 갱신) |
| 개발 도구 | Claude Code (터미널), WebStorm |
| 배포 예정 | Vercel (미정) |

---

## 프로젝트 구조

```
jobreadynz/
├── index.html                  # Vite HTML 진입점 (폰트 로드 포함)
├── vite.config.ts              # Vite + React 플러그인 설정 + /api 프록시 (→ localhost:3001)
├── tsconfig.json               # TypeScript 설정 (react-jsx, ESNext)
├── tsconfig.node.json          # Vite config용 TS 설정
├── package.json                # 의존성 + "server" 스크립트
├── server.ts                   # Express 서버 (port 3001) — OpenAI, Adzuna API 처리
├── .env                        # API 키 저장 (git 제외)
├── .gitignore
├── data/
│   ├── jobs.json               # Adzuna 잡 결과 캐시 (git 제외)
│   └── news.json               # 뉴스 결과 캐시 (git 제외)
├── _reference/
│   └── JobReadyNZ.html         # 최초 프로토타입 (디자인 레퍼런스용)
└── src/
    ├── main.tsx                # React 루트 마운트 (createRoot)
    ├── App.tsx                 # 루트 컴포넌트 (타입 정의, toast, 페이지 라우팅)
    ├── index.css               # 전체 글로벌 스타일 (CSS 변수, 다크 테마)
    ├── vite-env.d.ts           # Vite 타입 선언
    ├── api/
    │   └── chat.ts             # fetch 래퍼: chat(prompt), chatWithHistory(messages, system?)
    ├── components/
    │   └── Sidebar.tsx         # 고정 사이드바 (네비게이션 + PSWV 비자 뱃지)
    └── pages/
        ├── Dashboard.tsx       # 통계 카드, 명언, 투두 미리보기, 뉴스 카드
        ├── Todo.tsx            # 노트북 스타일 시간표 플래너 (색깔 피커, 3일 탐색)
        ├── Diary.tsx           # 무드 픽커, 일기 작성, 날짜별 저장/열람, 삭제 확인
        ├── AITools.tsx         # CV 분석, 커버레터, LinkedIn 요약, 스킬갭 분석
        ├── Interview.tsx       # AI 모의 면접 (채팅 형식, NZ IT 맞춤)
        ├── Jobs.tsx            # Adzuna 잡 카드 + 실시간 프로그레스 바
        └── Wellness.tsx        # 고양이, 스트레스 게임, 음악, 숨쉬기, Kind note
```

---

## 주요 기능

### ✅ 구현 완료

| 기능 | 설명 | 파일 |
|------|------|------|
| Dashboard | 날짜, 명언 카드, 투두/일기/잡스캔 통계, 뉴스 카드, 페이지 이동 | `pages/Dashboard.tsx` |
| Daily Plan | 노트북 스타일 시간표, 색깔 피커, 어제/오늘/내일 탐색, 인라인 편집, localStorage | `pages/Todo.tsx` |
| Diary | 무드 기록, 날짜별 저장, 과거 열람, 인라인 삭제 확인, localStorage | `pages/Diary.tsx` |
| AI Tools | CV 분석 / 커버레터 / LinkedIn About / 스킬갭 — OpenAI 연결 | `pages/AITools.tsx` |
| Interview Prep | OpenAI 면접관 에이전트 (1문 1답 + 피드백, NZ IT 맞춤) | `pages/Interview.tsx` |
| Job Finder | Adzuna API로 NZ 신입 IT 잡 필터링, 실시간 SSE 프로그레스 바 | `pages/Jobs.tsx` |
| Wellness | 고양이 쓰다듬기, 스트레스 날리기 게임, 음악 링크, 숨쉬기, Kind note | `pages/Wellness.tsx` |
| 뉴스 자동화 | n8n으로 매일 8am AI/NZ취업 뉴스 자동 갱신, Dashboard에 표시 | `pages/Dashboard.tsx` |
| 랜덤 토스트 | 앱 열면 자동으로 한국어 격려 메시지 팝업 | `App.tsx` |

### 🔜 다음 단계 (예정)

| 기능 | 설명 | 우선순위 |
|------|------|--------|
| Application Tracker | 회사/포지션/날짜/상태 수기 기록, 나중에 Gmail 연동 고려 | 🔥 다음 |
| Skill Tracker | Soft/Technical skills 분류, 어디서 배웠는지 + 어떻게 사용했는지 기록 | 📅 Further dev |
| Vercel 배포 | 준비되면 실제 URL로 배포 (현재는 로컬 전용) | 📅 Further dev |
| DB 연결 | localStorage → 실제 DB로 업그레이드 (Supabase 등) | 📅 Further dev |

---

## AI가 쓰인 곳

| 위치 | AI 역할 | 모델 | 경로 |
|------|---------|------|------|
| `pages/AITools.tsx` | CV 분석, 커버레터 생성, LinkedIn 요약, 스킬갭 분석 | gpt-4o-mini | `chat(prompt)` → `/api/chat` → `server.ts` |
| `pages/Interview.tsx` | NZ IT 취업 맞춤 모의 면접 에이전트 (1문 1답 + 피드백) | gpt-4o-mini | `chatWithHistory(messages, system)` → `/api/chat` → `server.ts` |
| `pages/Jobs.tsx` | Adzuna 잡 JD 분석 및 PSWV 적합성 필터링 | gpt-4o-mini | `/api/jobs/refresh` → `server.ts` |
| `pages/Dashboard.tsx` | 매일 AI/NZ취업 뉴스 웹서치 + 요약 | gpt-4o-mini (web_search_preview) | n8n → `/api/news/refresh` → `server.ts` |

**API 요청 흐름:**
```
UI (React) → src/api/chat.ts → Vite 프록시 → server.ts (Express:3001) → OpenAI API
n8n 스케줄러 (매일 8am) → POST /api/news/refresh → server.ts → OpenAI 웹서치
```

---

## 개발 명령어

```bash
# 앱 실행할 때 터미널 두 개 필요

# 터미널 1 — Express 서버 (API 키 읽음, port 3001)
npm run server

# 터미널 2 — Vite 개발 서버 (http://localhost:5173)
npm run dev

# n8n 자동화 실행 (별도 터미널 또는 백그라운드)
n8n start   # → http://localhost:5678

# 배포용 빌드
npm run build

# TypeScript 에러 체크
npx tsc --noEmit
```

> ⚠️ `.env` 파일에 아래 키 필요. `.env`는 git에 올라가지 않음.
> ```
> OPENAI_API_KEY=sk-...
> ADZUNA_APP_ID=...
> ADZUNA_API_KEY=...
> ```

---

## 개발 히스토리

### Phase 1 — 프로토타입 (2025-05-19)
- claude.ai 채팅에서 단일 HTML 파일로 전체 UI 프로토타입 제작 (`JobReadyNZ.html`)
- 디자인 컨셉 확정: 다크 테마, DM Sans + DM Serif Display 폰트
- 모든 기능을 한 파일에서 구현 (React CDN 방식)
- React 없이 브라우저에서 바로 실행 가능한 MVP 확인

### Phase 2 — 프로젝트 구조화 (2025-05-19)
- Claude Code를 사용해 Vite + React + TypeScript 프로젝트로 변환
- 컴포넌트 분리: `Sidebar`, `Dashboard`, `Todo`, `Diary`, `AITools`, `Interview`, `Jobs`, `Wellness`
- TypeScript 설정 오류 수정 (`tsconfig.json` references 제거)
- 빌드 성공 확인 (`npm run build` 통과)
- `src/index.ts` 삭제, `JobReadyNZ.html` → `_reference/` 폴더로 이동

### Phase 3 — OpenAI 백엔드 연결 (2025-05-19)
- **문제:** 브라우저에서 AI API 직접 호출 시 CORS 차단 + API 키 노출 위험
- **해결:** 로컬 Express 서버(`server.ts`) 도입으로 API 키를 서버에서만 관리
- `server.ts` 생성 — Express 서버 (port 3001), `/api/chat` 엔드포인트
  - `{ prompt }` 형식: AITools 단일 메시지 처리
  - `{ messages, system }` 형식: Interview 대화 히스토리 처리
- `src/api/chat.ts` 생성 — fetch 래퍼 함수 두 개
  - `chat(prompt)` — AITools용 단순 호출
  - `chatWithHistory(messages, system?)` — Interview용 히스토리 포함 호출
- `vite.config.ts` 업데이트 — `/api` 요청을 `localhost:3001`로 프록시
- AI 모델: Anthropic Claude → **OpenAI gpt-4o-mini** 로 변경

### Phase 4 — Todo 플래너 리디자인 (2025-05-20)
- `Todo.tsx` 완전 재작성 — 카테고리 태그 방식 → 노트북 스타일 시간표 플래너로 변경
- 자체 상태 관리 — App.tsx에서 `todos`/`setTodos` props 제거, Todo가 독립적으로 localStorage 관리
- localStorage 키 변경: `jr_todos` → `jr_planner` (구조: `{ "YYYY-MM-DD": PlannerTask[] }`)
- 3컬럼 노트북 레이아웃: 시간(56px) · 불렛+텍스트(flex:1) · 체크/편집/삭제(56px)
- 색깔 피커: 15가지 색상 팔레트, 태스크마다 자유롭게 색상 선택
- 날짜 탐색: 어제/오늘/내일 3일 이동
- 인라인 편집 기능: 시간/텍스트/색깔 수정 가능, 편집 버튼 항상 표시
- 진행률 바 (3px) + "X / Y done" 라벨
- `Dashboard.tsx` — `getTodayTasks()`로 `jr_planner` localStorage 직접 읽기

### Phase 5 — Wellness 리디자인 + 버그 수정 (2025-05-20)
- **고양이 쓰다듬기:** 클릭마다 표정 단계별 변화 (`🐱→😺→😸→😻→😹`), 하트 애니메이션
- **스트레스 날리기 게임:** 텍스트 입력 → 버블 → 클릭하면 폭발 💥, 파괴 횟수 localStorage 저장
- **음악:** Animal Crossing BGM 기본값, 사용자가 링크 변경 가능, localStorage 저장
- **숨쉬기 타이머 버그 수정:** `useRef`로 타이머 ID 관리, Stop 즉시 작동, 라운드 카운터 추가
- **Progress → Breathe 교체:** Dashboard와 중복되는 Progress 카드 제거, Breathe 카드 복원
- Remember 카드 제거, AI Tools 서브타이틀 수정
- Diary 삭제 확인: 인라인 확인 UI (browser alert 대신)

### Phase 6 — Job Agent 개발 (2025-05-21)

**최초 설계 목표:**
- AI Agent가 매일 오후 7시 NZT에 자동으로 NZ IT 잡을 스캔하고 추천
- Seek NZ + LinkedIn + Trade Me 대상
- OpenAI가 JD 읽고 필터링 (경력 요구, 시민권/영주권 필요, 시니어 레벨 제외)

**시도 1 — RSS/스크래핑 방식 ❌**
- Seek NZ, Trade Me, Indeed RSS 피드 직접 호출 시도
- **결과:** 전부 403 차단 (봇 감지)
- `/clear`로 Claude Code 메모리 초기화 후 새 방법으로 전환

**시도 2 — OpenAI 웹 서치 방식 ❌**
- `web_search_preview` 툴로 OpenAI가 직접 웹 서치해서 잡 찾기
- **결과:** URL Hallucination — 존재하지 않는 URL 생성 (`/job/12345678` 등)
- `/clear`로 메모리 초기화 후 새 방법으로 전환

**시도 3 — Adzuna API 방식 ✅**
- Adzuna: 공식 잡 데이터 API (무료, 합법, NZ 포함 20개국)
- `developer.adzuna.com` 무료 가입 → `app_id` + `app_key` 발급
- URL 형식 디버깅: `content-type` 헤더 처리, `encodeURIComponent` 키워드 인코딩
- 정상 작동, 실제 URL 포함된 잡 카드 반환

**최종 구조:**
```
POST /api/jobs/refresh
    ↓ Adzuna API (키워드 14개 × 2페이지 = 최대 560개)
    ↓ 중복 제거
    ↓ OpenAI 필터링 (경력/시민권/레벨 기준)
    ↓ data/jobs.json 저장
    ↓ SSE로 실시간 진행상황 전송 → Jobs.tsx 프로그레스 바
```

**필터링 기준:**
- ❌ 제외: NZ 시민권/영주권 필요, 경력 1년 이상, 시니어/인터미디에이트
- ✅ 포함: 신입/그래듀에이트, 워크비자 가능, CS/Maths 관련

**검색 키워드 (최종):**
`graduate IT`, `junior developer`, `data analyst graduate`, `computer science graduate`, `mathematics graduate`, `junior analyst`, `trader`, `graduate`, `entry level`, `IT support`, `data analyst`, `software engineer`, `systems analyst`, `ai`

**결정:** 매일 자동 실행 대신 Refresh 버튼 수동 실행 방식으로 확정

### Phase 7 — 뉴스 자동화 + Dashboard 개선 (2025-05-22)

**뉴스 자동화:**
- `POST /api/news/refresh` 엔드포인트 추가
- OpenAI `web_search_preview` 툴로 매일 뉴스 웹서치
- 카테고리: AI & Tech (3개) + NZ Jobs (2개)
- `data/news.json` 저장, Dashboard 카드로 표시
- 기사 클릭 시 원본 링크 새 탭으로 열기

**n8n 자동화 연결:**
- n8n 로컬 설치 (`npm install -g n8n`)
- Schedule Trigger (매일 8am) → HTTP Request (`POST /api/news/refresh`) 워크플로우 구성
- Publish 후 자동 실행 활성화

**Dashboard 개선:**
- "Jobs waiting" 카드 → "Last job scan" 카드로 교체 (`data/jobs.json` lastUpdated 읽기)
- 통계 카드 클릭 시 해당 페이지로 이동 (Tasks→Todo, Diary→Diary, Last scan→Jobs)

---

*이 문서는 개발이 진행될수록 계속 업데이트됩니다.*
