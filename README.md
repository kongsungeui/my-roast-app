# my-roast-app

my-roast-app

**환경 변수 사용법**

- **파일:** `server/.env.example`에는 필요한 환경 변수 예시가 들어 있습니다. 복사하여 `server/.env`로 만드세요.
- **복사:** `cp server/.env.example server/.env`
- **필수 값:** `OPENAI_API_KEY` — 실제 OpenAI 키로 교체하세요.
- **포트:** `PORT` 기본값 `4000` (필요 시 변경).
- **Git:** `server/.env`는 이미 `.gitignore`에 추가되어 있으므로 커밋되지 않습니다.
- **서버 실행 예시:** `node server/index.js` 또는
  ```bash
  cd server
  node index.js
  ```
- **참고:** 배포 시 환경변수는 호스트(예: Docker, CI, 호스팅 서비스)의 환경설정으로 주입하세요.

**CORS 설정 (서버)**

- `CORS_ORIGIN`: 서버에서 허용할 origin 목록을 콤마로 구분하여 지정하세요. 예:
  - `CORS_ORIGIN=https://example.app.github.dev,https://another-host` — 정확히 이 origin들만 허용
  - `CORS_ORIGIN=*` — 모든 origin 허용(개발 편의용)
  - 미설정이면 기본적으로 개발 편의상 모든 origin을 허용합니다.
- `CORS_ALLOW_CREDENTIALS`: `true`로 설정하면 `Access-Control-Allow-Credentials: true`를 반환합니다. (기본: `false`)

예: `server/.env`에 추가

```bash
CORS_ORIGIN=https://fictional-robot-5g5gjwrg7v3vq7j-5173.app.github.dev
CORS_ALLOW_CREDENTIALS=false
```

**프론트엔드(Vite) 환경 변수**

- **파일:** `frontend/.env.example`를 참고하여 `frontend/.env`를 생성하세요.
- **개발(프록시) 사용 예:** Vite 개발 서버가 `/api` 요청을 백엔드로 프록시하도록 `VITE_PROXY_TARGET`를 설정합니다. 예:
  ```bash
  # 프론트엔드에서 개발 중일 때(로컬 백엔드가 4000 포트라면)
  echo "VITE_PROXY_TARGET=http://localhost:4000" > frontend/.env
  ```
- **Codespace에서 공개 도메인을 직접 호출할 경우:** 백엔드가 Codespace 포워딩으로 외부 도메인을 가진다면 `VITE_API_BASE`에 서버 URL(포트 포함)을 넣습니다. 예:
  ```bash
  echo "VITE_API_BASE=https://fictional-robot-5g5gjwrg7v3vq7j-4000.app.github.dev" > frontend/.env
  ```
- **동작 원칙:**
  - 개발 중 `VITE_API_BASE`가 비어있으면 앱은 상대경로(`/api/roast`)를 사용하고 Vite가 이 요청을 `VITE_PROXY_TARGET`로 프록시합니다 (CORS 회피).
  - `VITE_API_BASE`가 설정되어 있으면 절대 URL(`${VITE_API_BASE}/api/...`)로 직접 요청합니다.
- **재시작:** `frontend/.env`를 수정한 뒤에는 Vite dev 서버를 재시작해야 변경이 반영됩니다.

# my-roast-app

my-roast-app
