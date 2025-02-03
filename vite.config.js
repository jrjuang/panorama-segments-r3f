import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0', // 啟用局域網訪問
    port: 3000,      // 指定埠號（可選）
  },
});
