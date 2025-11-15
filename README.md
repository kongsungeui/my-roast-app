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
# my-roast-app
my-roast-app
