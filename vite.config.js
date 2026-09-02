import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const nodeApiServer = env.VITE_NODE_API_URL ?? 'http://localhost:4000';
  const jposRoot = env.VITE_JPOS_ROOT ?? 'http://localhost/JPos';

  return {
    plugins: [react()],

    server: {
      port: 5173,
      proxy: {
        '/api': {
          target:       nodeApiServer,
          changeOrigin: true,
          secure:       false,
        },
        '/JPos/userfiles': {
          target:       'http://localhost',
          changeOrigin: true,
          secure:       false,
        },
      },
    },

    build: {
      outDir:      'dist',
      emptyOutDir: true,
      manifest:    true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
              return 'vendor';
            }
            if (id.includes('node_modules/bootstrap') || id.includes('node_modules/react-bootstrap')) {
              return 'ui';
            }
            if (id.includes('node_modules/framer-motion')) {
              return 'motion';
            }
          },
        },
      },
    },

    test: {
      environment: 'jsdom',
      setupFiles:  ['./src/setupTests.js'],
      globals:     true,
    },
  };
});
