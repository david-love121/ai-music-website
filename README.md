# AI Music Website

This is a SvelteKit-based music player with synchronized visualizers.

Default tracks

- Place audio files in one of the following locations so they are served to all visitors as defaults:
  - static/music-dir/ (recommended) — files are served at /music-dir/<filename>

At runtime, the app fetches /api/tracks to build the default playlist.

Development

- npm run dev
- Open http://localhost:5173

## Static Build / GitHub Pages

This project can be exported as a fully static site for hosting on GitHub Pages.

1. Ensure audio files you want included are placed in `static/music-dir/`.
2. Regenerate the manifest (`static/music-dir/manifest.json`) to list those filenames:

```bash
npm run gen:manifest
```

3. Build with an optional base path (GitHub Pages usually `/<repo>`):

```bash
npm run build:gh-pages
```

Or manually:

```bash
BASE_PATH=/ai-music-website npm run build
```

4. Deploy the contents of `build/` to the `gh-pages` branch (e.g. using `git worktree` or an action).

The app loads default tracks by fetching `/music-dir/manifest.json` and then referencing each file under `/music-dir/<name>`; no server endpoints are required.

### Automatic deploy with GitHub Actions

This repository includes a GitHub Pages workflow (`.github/workflows/deploy.yml`). On each push to `main` it:

1. Installs dependencies (`npm ci`).
2. Regenerates the audio manifest (`npm run gen:manifest`).
3. Builds the site with `BASE_PATH=/<repo>` so assets resolve correctly at `https://<user>.github.io/<repo>/`.
4. Publishes the `build/` output to GitHub Pages.

Setup steps (one‑time):
- In GitHub: Settings → Pages → set Source to "GitHub Actions".
- Push to `main` (or dispatch the workflow manually) to generate the first deployment.

If you later host at a root user/org site (e.g. `username.github.io`), remove the base path by building with an empty `BASE_PATH`:

```bash
BASE_PATH= npm run build
```

You can manually run the workflow from the Actions tab ("Deploy to GitHub Pages").

## Styling with TailwindCSS

This project uses TailwindCSS via the official PostCSS plugin.

- Global styles and custom utilities live in `src/app.css`. This file imports Tailwind and defines theme variables and a few component classes.
- Tailwind is configured in `tailwind.config.js` with content scanning set to `./src/**/*.{html,js,svelte,ts}`.
- PostCSS is configured in `postcss.config.js` using `@tailwindcss/postcss` and `autoprefixer`.
- The root layout imports the stylesheet in `src/routes/+layout.svelte`.

# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
