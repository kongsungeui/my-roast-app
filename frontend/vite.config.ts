import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // load env vars (VITE_PROXY_TARGET can be set in frontend/.env)
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:4000';

  return {
    base: '/my-roast-app/',
    plugins: [react()],
    server: {
      proxy: {
        // Proxy `/api` requests to the backend to avoid CORS during dev
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
