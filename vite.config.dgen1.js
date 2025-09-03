import { defineConfig } from 'vite';
import path from 'path';

// Plugin to redirect root to index-dgen1.html
const serveDgen1Plugin = () => ({
  name: 'serve-dgen1',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/' || req.url === '/index.html') {
        req.url = '/index-dgen1.html';
      }
      next();
    });
  }
});

export default defineConfig({
  plugins: [serveDgen1Plugin()],
  root: '.',
  base: '/',
  appType: 'spa',
  publicDir: 'public',
  build: {
    outDir: 'dist-dgen1',
    emptyOutDir: true,
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: 'index-dgen1.html'
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    target: 'esnext'
  },
  define: {
    'DGEN1_BUILD': JSON.stringify(true),
    'REMIX_BUILD': JSON.stringify(false),
    'global': 'globalThis',
  },
  server: {
    port: 3001,
    host: true,
    open: '/index-dgen1.html',
    fs: {
      strict: false
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // Required for ethers.js
      'process': 'process/browser',
      'buffer': 'buffer'
    }
  },
  optimizeDeps: {
    exclude: ['phaser'],
    include: ['ethers', '@reown/appkit', '@reown/appkit-adapter-ethers'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
});