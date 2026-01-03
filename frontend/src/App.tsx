import type { FormEvent } from 'react';
import { useState } from 'react';

const ideaPrompts = [
  '오늘 아침에 늦잠 자서 지각했어',
  '치킨 시켜먹고 운동 안 한 지 3주째',
  '내일부터 다이어트 시작한다고 말했어',
  '주말에 집에서 넷플릭스만 봤어',
  '과제 마감 3시간 전에 시작했어',
  '커피 하루에 5잔 마셨어',
];

function App() {
  const [text, setText] = useState('');
  const [roast, setRoast] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        body: JSON.stringify({ text }),
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
            <div className="badge">AI의 부정적인 피드백 😈</div>
            <p className="result__text">{roast}</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
