import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "build",
    rollupOptions: {
      input: {
        helloWorld: resolve(__dirname, "src/helloWorld.tsx"), // Entry for HelloWorldPanel
        sidebar: resolve(__dirname, "src/sidebar.tsx"),       // Entry for SidebarPanel
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
    minify: 'esbuild',
    sourcemap: false
  },
});
