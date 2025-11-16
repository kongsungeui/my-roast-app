import { useState } from 'react';

function App() {
  const [text, setText] = useState('');
  const [roast, setRoast] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
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
        throw new Error('API 호출 실패');
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

  return (
    <div
      style={{
        maxWidth: 600,
        margin: '40px auto',
        padding: '24px',
        borderRadius: 12,
        border: '1px solid #ddd',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>AI 악담(장난) 머신 ㅎㅎ</h1>
      <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        한 문장을 적으면, AI가 가볍게 디스해줍니다. 진지한 용도로 쓰지 말 것 😇
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          rows={3}
          style={{ width: '100%', padding: 8, resize: 'vertical' }}
          placeholder="여기에 문장을 적어보세요"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          style={{
            marginTop: 12,
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: loading || !text.trim() ? '#ccc' : '#007bff',
            color: '#fff',
            cursor: loading || !text.trim() ? 'default' : 'pointer',
          }}
        >
          {loading ? '생각 중…' : '디스해줘 ㅋㅋ'}
        </button>
      </form>

      {error && <p style={{ marginTop: 16, color: 'red' }}>{error}</p>}

      {roast && (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            borderRadius: 8,
            backgroundColor: '#f9f9f9',
          }}
        >
          <div style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>
            AI의 부정적인 피드백 😈
          </div>
          <div>{roast}</div>
        </div>
      )}
    </div>
  );
}

export default App;
