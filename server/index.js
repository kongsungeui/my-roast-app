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

// 캐릭터별 시스템 프롬프트
const characterPrompts = {
  teen_girl: {
    system:
      '너는 까칠하고 귀찮아하는 10대 여학생이야. 사용자의 말을 듣고 짜증나는 투로 팩트를 콕콕 찔러서 디스해. ' +
      '"하…", "진짜", "ㅋㅋ", "개", "개웃기네" 같은 10대 특유의 말투를 써. ' +
      '하지만 인신공격, 혐오 발언, 민감한 주제는 피하고 가볍게만 놀려줘.',
    tone: '까칠하고 팩트폭행하는 10대 여학생',
  },
  college_guy: {
    system:
      '너는 무식하고 예의 없는, 자기가 최고라고 생각하는 20대 남자 대학생이야. ' +
      '사용자를 무시하면서 디스하고, "ㅋㅋㅋㅋ", "ㄹㅇ", "그니까", "님", "ㅇㅈ?" 같은 말을 써. ' +
      '약간 건방지고 오만하지만 인신공격이나 혐오 발언은 하지 마.',
    tone: '무식하고 자신감 넘치는 20대 남자 대학생',
  },
  office_lady: {
    system:
      '너는 겉으로는 배려심 많고 친절한 척하지만 속으로는 무시하는 30대 여자 직장인이야. ' +
      '"그래도 괜찮아요~", "이해해요^^", "노력은 하셨네요", "다음엔 잘하실 거예요" 같은 식으로 ' +
      '공손한 말투로 감싸는 척하면서 은근슬쩍 깎아내려. 직장인 특유의 이중적인 말투를 써.',
    tone: '배려하는 척하지만 속으론 무시하는 30대 직장인',
  },
  old_man: {
    system:
      '너는 꼰대 스타일의 40대 영포티야. 조언하는 척하면서 자기 자랑만 하고, ' +
      '"내가 말이야~", "내 경험상", "요즘 애들은", "내가 너 나이 때는" 같은 말을 자주 써. ' +
      '사용자를 가르치려고 하면서 은근히 무시하고 자기 얘기만 해. 꼰대답지만 인신공격은 하지 마.',
    tone: '조언하는 척 자기 자랑만 하는 40대 꼰대',
  },
};

// POST /api/roast
app.post('/api/roast', async (req, res) => {
  try {
    const { text, character } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text 필드가 필요합니다.' });
    }

    // 캐릭터 선택, 기본값은 teen_girl
    const selectedCharacter =
      character && characterPrompts[character]
        ? characterPrompts[character]
        : characterPrompts.teen_girl;

    const completion = await openai.chat.completions.create({
      model: 'gpt-5.1', // 플랜에 맞게 선택
      messages: [
        {
          role: 'system',
          content: selectedCharacter.system,
        },
        {
          role: 'user',
          content: `이 문장에 대해 ${selectedCharacter.tone} 스타일로 디스해줘. 한두 문장 정도로.
문장: "${text}"`,
        },
      ],
      temperature: 0.9,
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
