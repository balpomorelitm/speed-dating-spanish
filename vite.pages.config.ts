import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [react()],
  publicDir: "public",
  css: {
    postcss: { plugins: [] },
  },
  build: {
    outDir: "dist-pages",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), "index.html"),
        catalogo: resolve(process.cwd(), "catalogo.html"),
      },
    },
  },
});
