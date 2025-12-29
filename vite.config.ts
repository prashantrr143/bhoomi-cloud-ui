import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Cloudscape design system (large library)
          'vendor-cloudscape': ['@cloudscape-design/components', '@cloudscape-design/global-styles'],
        },
      },
    },
    // Increase chunk size warning limit since Cloudscape is large
    chunkSizeWarningLimit: 600,
  },
});
