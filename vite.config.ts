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
        reporter: ["text", "json", "html"],
      },
    },
  }),
  build: {
    rollupOptions: {
      external: [
        /^node:/,
        "express",
        "express-rate-limit",
        "express-session",
        "connect-mongo",
        "mongoose",
        "bcryptjs",
      ],

      input: {
        index: path.resolve(__dirname, "src/index.ts"),
      },

      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === "browser"
            ? "cdn.min.js"
            : "index.[format].js";
        },

        name: "ReactiveValues",
        extend: true,
      },
    },

    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "ReactiveCore",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format}.js`,
    },

    outDir: "dist",
    emptyOutDir: true,
  },

  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
});