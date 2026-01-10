import type { FormEvent } from 'react';
import { useState } from 'react';

// Import character images
import teenGirlImg from './assets/characters/teen_girl.png';
import collegeGuyImg from './assets/characters/college_guy.png';
import officeLadyImg from './assets/characters/office_lady.png';
import oldManImg from './assets/characters/old_man.png';

const ideaPrompts = [
  '오늘 아침에 늦잠 자서 지각했어',
  '치킨 시켜먹고 운동 안 한 지 3주째',
  '내일부터 다이어트 시작한다고 말했어',
  '주말에 집에서 넷플릭스만 봤어',
  '과제 마감 3시간 전에 시작했어',
  '커피 하루에 5잔 마셨어',
];

type Character = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  image: string;
};

const characters: Character[] = [
  {
    id: 'teen_girl',
    name: '까칠한 10대 여학생',
    description: '귀찮아하고 팩트폭행하는 10대',
    emoji: '🙄',
    image: teenGirlImg,
  },
  {
    id: 'college_guy',
    name: '무식한 20대 남자 대학생',
    description: '예의 없고 자기가 최고인 20대',
    emoji: '😎',
    image: collegeGuyImg,
  },
  {
    id: 'office_lady',
    name: '겉배속무 30대 직장인',
    description: '배려하는 척 속으론 무시하는 30대',
    emoji: '😊',
    image: officeLadyImg,
  },
  {
    id: 'old_man',
    name: '꼰대 40대 영포티',
    description: '조언하는 척 자기 자랑만 하는 40대',
    emoji: '🤓',
    image: oldManImg,
  },
];

function App() {
  const [text, setText] = useState('');
  const [roast, setRoast] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<string>(characters[0].id);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError('');
    setRoast('');

    try {
      // Use explicit Vite env var if provided (for production/Codespaces URL),
      // otherwise use a relative path so Vite dev-server can proxy `/api` to the backend.
      const apiBase = import.meta.env.VITE_API_BASE ?? '';
      const url = apiBase ? `${apiBase}/api/roast` : '/api/roast';

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, character: selectedCharacter }),
      });

      if (!res.ok) {
        throw new Error('API 호출 실패!!');
      }

      const data = await res.json();
      setRoast(data.roast);
    } catch (err) {
      console.error(err);
      setError('뭔가 잘못됐어… 서버를 확인해봐 ㅠㅠ');
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading || !text.trim();

  return (
    <div className="page">
      <div className="page__glow" aria-hidden />
      <main className="card">
        <div className="eyebrow">Roast Playground</div>
        <h1 className="title">AI 악담(장난) 머신</h1>
        <p className="subtitle">
          한 문장을 적으면, AI가 가볍게 디스해줍니다. 장난스럽게 받아들이고 웃어넘겨주세요 😇
        </p>

        <div className="character-section">
          <h2 className="character-section__title">캐릭터를 선택하세요</h2>
          <div className="character-grid">
            {characters.map((character) => (
              <button
                key={character.id}
                type="button"
                className={`character-card ${selectedCharacter === character.id ? 'character-card--selected' : ''}`}
                onClick={() => {
                  setSelectedCharacter(character.id);
                  setRoast('');
                  setError('');
                }}
                disabled={loading}
              >
                <div className="character-card__image-wrapper">
                  <img
                    src={character.image}
                    alt={character.name}
                    className="character-card__image"
                    onError={(e) => {
                      // 이미지 로드 실패시 이모지로 대체
                      e.currentTarget.style.display = 'none';
                      const emojiDiv = e.currentTarget.nextElementSibling as HTMLElement;
                      if (emojiDiv) emojiDiv.style.display = 'block';
                    }}
                  />
                  <div className="character-card__emoji" style={{ display: 'none' }}>
                    {character.emoji}
                  </div>
                </div>
                <div className="character-card__name">{character.name}</div>
                <div className="character-card__description">{character.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="chip-row" role="list">
          {ideaPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="chip"
              onClick={() => {
                setText(prompt);
                setRoast('');
                setError('');
              }}
              disabled={loading}
              role="listitem"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="form">
          <label htmlFor="roast-text" className="label">
            뭘 디스하고 싶은가요?
            <span className="label__hint">짧을수록 더 독하게 돌아올지도 몰라요</span>
          </label>
          <div className="textarea-shell">
            <textarea
              id="roast-text"
              rows={3}
              maxLength={120}
              className="textarea"
              placeholder="여기에 문장을 적어보세요"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="textarea__footer">
              <span className="muted">최대 120자</span>
              <span className="counter">{text.length}자</span>
            </div>
          </div>

          <div className="actions">
            <div className="status">
              {error ? (
                <span className="status__error">{error}</span>
              ) : (
                <span className="status__info">AI가 가볍게 놀릴 준비 완료 🎯</span>
              )}
            </div>
            <button type="submit" className="primary" disabled={disabled}>
              {loading ? 'AI가 생각 중…' : '디스해줘 ㅋㅋ'}
            </button>
          </div>
        </form>

        {roast && (
          <section className="result" aria-live="polite">
            <div className="result__header">
              <div className="result__character">
                <div className="result__character-image-wrapper">
                  <img
                    src={characters.find((c) => c.id === selectedCharacter)?.image}
                    alt={characters.find((c) => c.id === selectedCharacter)?.name}
                    className="result__character-image"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const emojiSpan = e.currentTarget.nextElementSibling as HTMLElement;
                      if (emojiSpan) emojiSpan.style.display = 'inline';
                    }}
                  />
                  <span className="result__character-emoji" style={{ display: 'none' }}>
                    {characters.find((c) => c.id === selectedCharacter)?.emoji}
                  </span>
                </div>
                <div className="result__character-info">
                  <div className="badge">
                    {characters.find((c) => c.id === selectedCharacter)?.name}의 피드백 😈
                  </div>
                </div>
              </div>
            </div>
            <p className="result__text">{roast}</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
