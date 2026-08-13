import { defineConfig } from "vite";
import { defineConfig as defineConfigTest } from "vitest/config";
import dts from "vite-plugin-dts";
import path from "path";

export default defineConfig({
  ...defineConfigTest({
    test: {
      globals: true,
      environment: "jsdom",
      coverage: {
        reporter: ["text", "json", "html"]
      }
    }
  }),
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "src/index.ts"),
        browser: path.resolve(__dirname, "src/browser.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === "browser" ? "cdn.min.js" : "index.[format].js";
        },
        // Configuración para asegurar que el build IIFE exponga la variable global correctamente
        name: "ReactiveValues",
        extend: true,
      },
    },
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "ReactiveCore",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format}.js`
    },
    outDir: "dist",
    emptyOutDir: true
  },
  plugins: [dts({ insertTypesEntry: true })]
});