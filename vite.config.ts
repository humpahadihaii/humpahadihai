import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Target modern browsers for smaller bundles
    target: "es2020",
    // Enable minification
    minify: "esbuild",
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React vendor bundle
          if (id.includes("node_modules/react") || 
              id.includes("node_modules/react-dom") || 
              id.includes("node_modules/react-router-dom")) {
            return "react-vendor";
          }
          // UI component library
          if (id.includes("node_modules/@radix-ui")) {
            return "ui-vendor";
          }
          // Data fetching
          if (id.includes("node_modules/@tanstack/react-query")) {
            return "query-vendor";
          }
          // Supabase client
          if (id.includes("node_modules/@supabase")) {
            return "supabase";
          }
          // Heavy chart library - load separately
          if (id.includes("node_modules/recharts")) {
            return "charts";
          }
          // Map libraries - load separately
          if (id.includes("node_modules/leaflet") || id.includes("node_modules/react-leaflet")) {
            return "maps";
          }
          // Rich text editor - load separately
          if (id.includes("node_modules/react-quill") || id.includes("node_modules/quill")) {
            return "editor";
          }
          // Admin-only pages bundled together
          if (id.includes("/pages/admin/") || id.includes("/components/admin/")) {
            return "admin";
          }
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 600,
    // Enable source maps only in dev
    sourcemap: mode === "development",
  },
  // Optimize deps
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "@tanstack/react-query"],
    // Exclude heavy deps from pre-bundling
    exclude: ["recharts", "react-quill"],
  },
}));
