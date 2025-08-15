import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    fs: {
      // allow serving files from project root and the local music-dir folder
      allow: [
        path.resolve(__dirname, "."),
        path.resolve(__dirname, "music-dir"),
      ],
    },
  },
});
