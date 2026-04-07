import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// Removed lovable-tagger to avoid injected branding/logo

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
