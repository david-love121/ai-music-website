import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html'
    }),
    paths: {
      // Support GitHub Pages deployments at /<repo>. Set BASE_PATH before build if needed.
      base: process.env.BASE_PATH?.replace(/\/$/, '') || ''
    },
    prerender: {
      handleHttpError: 'warn'
    }
  },
};

export default config;
