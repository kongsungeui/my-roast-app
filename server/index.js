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

const corsOptions = {
  origin: function (incomingOrigin, callback) {
    // incomingOrigin is undefined for non-browser requests (curl, server-to-server).
    if (!incomingOrigin) return callback(null, true);

    if (allowedOrigins === '*' || allowedOrigins === null) {
      // allow any origin
      return callback(null, true);
    }

    // only allow exact matches from the configured list
    if (Array.isArray(allowedOrigins) && allowedOrigins.indexOf(incomingOrigin) !== -1) {
      return callback(null, true);
    }

    // not allowed
    return callback(new Error('CORS: origin not allowed'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: allowCredentials,
  optionsSuccessStatus: 204,
};

app.use((req, res, next) => {
  // Quick health: if there is an origin and it's not allowed, respond with 403 for preflight
  next();
});

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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
      model: 'gpt-4.1-mini', // 플랜에 맞게 선택
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
