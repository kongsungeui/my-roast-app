import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();

// Configure CORS. Set `CORS_ORIGIN` to a comma-separated list of allowed origins
// (e.g. "https://...-5173.app.github.dev") or use `*` to allow any origin.
// If unspecified, defaults to allowing any origin (development convenience).
const rawOrigins = process.env.CORS_ORIGIN;
let allowedOrigins = null; // null -> allow all
if (rawOrigins) {
  const trimmed = rawOrigins.trim();
  if (trimmed === '*') {
    allowedOrigins = '*';
  } else {
    allowedOrigins = trimmed
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

const allowCredentials = process.env.CORS_ALLOW_CREDENTIALS === 'true';

function isOriginAllowed(incomingOrigin) {
  if (!incomingOrigin) return true; // non-browser requests
  if (allowedOrigins === '*' || allowedOrigins === null) return true;
  return Array.isArray(allowedOrigins) && allowedOrigins.indexOf(incomingOrigin) !== -1;
}

// Debugging middleware: log origin and path for troubleshooting
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`[CORS] ${req.method} ${req.path} origin=${origin ?? '<none>'}`);
  next();
});

// Handle preflight requests explicitly so we always return the CORS headers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (req.method === 'OPTIONS') {
    if (!isOriginAllowed(origin)) {
      console.warn(`[CORS] Blocked preflight from origin=${origin}`);
      return res.status(403).json({ error: 'CORS origin not allowed' });
    }

    // Allow for preflight
    res.setHeader(
      'Access-Control-Allow-Origin',
      allowedOrigins === '*' || allowedOrigins === null ? '*' : origin
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
    if (allowCredentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    return res.status(204).end();
  }

  next();
});

// Attach cors-like headers for non-preflight requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!isOriginAllowed(origin)) {
    console.warn(`[CORS] Request origin not allowed: ${origin}`);
    return res.status(403).json({ error: 'CORS origin not allowed' });
  }

  res.setHeader(
    'Access-Control-Allow-Origin',
    allowedOrigins === '*' || allowedOrigins === null ? '*' : origin
  );
  if (allowCredentials) res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/roast
app.post('/api/roast', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text 필드가 필요합니다.' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini-2025-08-07', // 플랜에 맞게 선택
      messages: [
        {
          role: 'system',
          content:
            '너는 사용자의 문장을 장난스럽게 디스하는 친구다. ' +
            '하지만 인신공격, 혐오 발언, 민감한 주제, 자해 관련 내용은 절대 쓰지 말고, ' +
            '가벼운 농담/셀프디스 느낌으로만, 한국어로 대답해라.',
        },
        {
          role: 'user',
          content: `이 문장에 대해 아주 부정적이지만 장난스러운 피드백을 줘. 한두 문장 정도로, ㅎㅎ 포함해서.
문장: "${text}"`,
        },
      ],
      temperature: 0.8,
    });

    const roast = completion.choices[0]?.message?.content ?? '음… 뭐라고 해야 할지 모르겠다 ㅋㅋ';

    res.json({ roast });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 에러가 발생했습니다.' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Roast API server listening on port ${PORT}`);
});
