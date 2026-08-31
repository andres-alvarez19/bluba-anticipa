import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const rootDirectory = path.dirname(fileURLToPath(import.meta.url));
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': rootDirectory,
      },
    },
    server: {
      // Keep the recording demo on a loopback origin. Browser microphone APIs
      // require a secure context; localhost/127.0.0.1 are treated as trustworthy.
      host: '127.0.0.1',
      headers: {
        'Permissions-Policy': 'microphone=(self)',
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8080',
          changeOrigin: true,
          rewrite: (requestPath) => requestPath.replace(/^\/api/, ''),
        },
      },
    },
  };
});
