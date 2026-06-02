process.env.TZ = 'Pacific/Auckland';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

dotenv.config();

const DATA_DIR = path.join(process.cwd(), 'data');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');
const NEWS_FILE = path.join(DATA_DIR, 'news.json');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/chat', async (req, res) => {
  const { prompt, messages, system } = req.body as {
    prompt?: string;
    messages?: OpenAI.ChatCompletionMessageParam[];
    system?: string;
  };

  let apiMessages: OpenAI.ChatCompletionMessageParam[];

  if (messages) {
    apiMessages = [
      ...(system ? [{ role: 'system' as const, content: system }] : []),
      ...messages,
    ];
  } else if (prompt) {
    apiMessages = [{ role: 'user', content: prompt }];
  } else {
    res.status(400).json({ error: 'prompt or messages required' });
    return;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: apiMessages,
      max_tokens: 1000,
    });
    const text = completion.choices[0]?.message?.content ?? '';
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OpenAI API error' });
  }
});

const ADZUNA_KEYWORDS = [
  'graduate IT',
  'junior developer',
  'data analyst graduate',
  'computer science graduate',
  'mathematics graduate',
  'junior analyst',
  'trader',
  'graduate',
  'entry level',
  'IT support',
  'data analyst',
  'software engineer',
  'systems analyst',
  'ai',
];

interface AdzunaJob {
  id: string;
  title: string;
  description?: string;
  company?: { display_name: string };
  location?: { display_name: string };
  redirect_url: string;
  created?: string;
  salary_min?: number;
  salary_max?: number;
}

async function fetchAdzunaPage(keyword: string, page: number): Promise<AdzunaJob[]> {
  const appId = process.env.ADZUNA_APP_ID ?? '';
  const appKey = process.env.ADZUNA_API_KEY ?? '';
  const urlStr =
    `https://api.adzuna.com/v1/api/jobs/nz/search/${page}` +
    `?app_id=${appId}&app_key=${appKey}` +
    `&results_per_page=20` +
    `&what=${encodeURIComponent(keyword)}`;

  console.log(`Adzuna URL: ${urlStr}`);

  const res = await fetch(urlStr, { headers: { 'Content-Type': 'application/json' } });
  const body = await res.text();
  console.log(`Adzuna status: ${res.status} | body: ${body.slice(0, 200)}`);

  if (!res.ok) throw new Error(`Adzuna API error ${res.status}`);
  const data = JSON.parse(body) as { results: AdzunaJob[] };
  return data.results ?? [];
}

async function fetchAdzunaJobs(keyword: string): Promise<AdzunaJob[]> {
  const [page1, page2] = await Promise.all([
    fetchAdzunaPage(keyword, 1),
    fetchAdzunaPage(keyword, 2),
  ]);
  return [...page1, ...page2];
}

async function filterJobWithAI(title: string, description: string): Promise<{ suitable: boolean; reason: string }> {
  const prompt = `You are a job filter for a recent Computer Science and Mathematics graduate in New Zealand with a Post Study Work Visa (PSWV).

Analyse this job and return JSON only:
{
  "suitable": boolean,
  "reason": "string (one sentence)"
}

Job title: ${title}
Job description: ${description.slice(0, 500)}

Mark NOT suitable if:
- Requires NZ citizenship or permanent residency
- Requires 1+ years of experience
- Senior or intermediate level

Mark suitable if:
- Entry level or graduate role
- No experience required
- Work visa accepted
- CS or Maths degree relevant`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 200,
  });

  const text = completion.choices[0]?.message?.content ?? '{}';
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(cleaned) as { suitable: boolean; reason: string };
}

app.get('/api/jobs/refresh', async (_req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const send = (payload: Record<string, unknown>) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  try {
    send({ type: 'start', message: 'Fetching jobs from Adzuna...', current: 0, total: 0 });
    console.log('Refreshing jobs via Adzuna API...');

    const seenIds = new Set<string>();
    const allJobs: AdzunaJob[] = [];

    for (const keyword of ADZUNA_KEYWORDS) {
      try {
        const jobs = await fetchAdzunaJobs(keyword);
        for (const job of jobs) {
          if (!seenIds.has(job.id)) {
            seenIds.add(job.id);
            allJobs.push(job);
          }
        }
        console.log(`  "${keyword}" → ${jobs.length} jobs`);
      } catch (err) {
        console.error(`  Adzuna fetch error for "${keyword}":`, err);
      }
    }

    send({ type: 'fetch', message: `Found ${allJobs.length} jobs, removing duplicates...`, current: 0, total: 0 });
    console.log(`Fetched ${allJobs.length} unique jobs, filtering with AI...`);

    const suitableJobs: {
      id: string; title: string; company: string; location: string;
      url: string; source: string; reason: string; postedDate: string; salary: string;
    }[] = [];
    const total = allJobs.length;

    for (let i = 0; i < allJobs.length; i++) {
      const job = allJobs[i];
      send({ type: 'analyse', message: `Analysing job ${i + 1} of ${total}...`, current: i + 1, total });
      try {
        const result = await filterJobWithAI(job.title, job.description ?? '');
        if (result.suitable) {
          const salary = job.salary_min && job.salary_max
            ? `$${Math.round(job.salary_min).toLocaleString()} – $${Math.round(job.salary_max).toLocaleString()}`
            : job.salary_min
            ? `From $${Math.round(job.salary_min).toLocaleString()}`
            : '';
          suitableJobs.push({
            id: job.id,
            title: job.title,
            company: job.company?.display_name ?? '',
            location: job.location?.display_name ?? '',
            url: job.redirect_url,
            source: 'Adzuna',
            reason: result.reason,
            postedDate: job.created ?? '',
            salary,
          });
        }
      } catch (filterErr) {
        console.error(`  Filter error for job ${job.id}:`, filterErr);
      }
    }

    console.log(`Saved ${suitableJobs.length} suitable jobs to data/jobs.json`);

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const lastUpdated = new Date().toISOString();
    fs.writeFileSync(JOBS_FILE, JSON.stringify({ lastUpdated, jobs: suitableJobs }, null, 2));

    send({ type: 'done', message: `Found ${suitableJobs.length} suitable jobs!`, current: total, total, jobs: suitableJobs, lastUpdated });
    res.end();
  } catch (err) {
    console.error('Jobs refresh error:', err);
    send({ type: 'error', message: 'Something went wrong' });
    res.end();
  }
});

app.get('/api/jobs', (_req, res) => {
  if (!fs.existsSync(JOBS_FILE)) {
    res.json({ lastUpdated: null, jobs: [] });
    return;
  }
  const raw = fs.readFileSync(JOBS_FILE, 'utf-8');
  res.json(JSON.parse(raw));
});

app.get('/api/news', (_req, res) => {
  if (!fs.existsSync(NEWS_FILE)) {
    res.json({ lastUpdated: null, articles: [] });
    return;
  }
  const raw = fs.readFileSync(NEWS_FILE, 'utf-8');
  res.json(JSON.parse(raw));
});

const NEWS_PROMPT = `Search for today's top news in these two categories:
1. AI & Technology: latest AI developments, new models, tech industry news (3 articles)
2. NZ Job Market: New Zealand employment trends, IT job market, graduate hiring news (2 articles)

For each article return:
{
  title: string (concise headline),
  summary: string (2-3 sentence summary),
  url: string (actual article URL from search results only — never fabricate),
  source: string (publication name),
  category: "AI & Tech" | "NZ Jobs"
}

Return a JSON array only, no other text.
Only include URLs that were directly found in search results.`;

app.post('/api/news/refresh', async (_req, res) => {
  try {
    console.log('Refreshing news via OpenAI web search...');

    const response = await openai.responses.create({
      model: 'gpt-4o-mini',
      tools: [{ type: 'web_search_preview' as const }],
      input: NEWS_PROMPT,
    });

    const raw = response.output_text.trim();
    const jsonText = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    const articles = JSON.parse(jsonText) as {
      title: string; summary: string; url: string; source: string; category: string;
    }[];

    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

    const payload = { lastUpdated: new Date().toISOString(), articles };
    fs.writeFileSync(NEWS_FILE, JSON.stringify(payload, null, 2));
    console.log(`Saved ${articles.length} articles to data/news.json`);

    res.json(payload);
  } catch (err) {
    console.error('News refresh error:', err);
    res.status(500).json({ error: 'Failed to refresh news' });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
