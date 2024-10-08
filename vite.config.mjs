import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';
// ----------------------------------------------------------------------
export default defineConfig({
  plugins: [react(), jsconfigPaths()],
  // https://github.com/jpuri/react-draft-wysiwyg/issues/1317
  base: '/', // accessing env variable is not possible here. So hard coding this.
  define: {
    global: 'window'
  },
  resolve: {
    alias: [
      {
        find: /^~(.+)/,
        replacement: path.join(process.cwd(), 'node_modules/$1')
      },
      {
        find: /^src(.+)/,
        replacement: path.join(process.cwd(), 'src/$1')
      }
    ]
  },
  server: {
    // Open the browser upon server start
    open: true,
    // Use the PORT environment variable or default to 3000
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    host: true // Listen on all available network interfaces (0.0.0.0)
  },
  preview: {
    // Open the browser upon preview start
    open: true,
    // Use the PORT environment variable or default to 3000
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
  }
});