# AI Music Website

This is a SvelteKit-based music player with synchronized visualizers.

Default tracks

- Place audio files in one of the following locations so they are served to all visitors as defaults:
  - static/music-dir/ (recommended) — files are served at /music-dir/<filename>
  - music-dir/ (project root) — also scanned at runtime for convenience during development

At runtime, the app fetches /api/tracks to build the default playlist.

Development

- npm run dev
- Open http://localhost:5173

## Styling with TailwindCSS

This project uses TailwindCSS via the official PostCSS plugin.

- Global styles and custom utilities live in `src/app.css`. This file imports Tailwind and defines theme variables and a few component classes.
- Tailwind is configured in `tailwind.config.js` with content scanning set to `./src/**/*.{html,js,svelte,ts}`.
- PostCSS is configured in `postcss.config.js` using `@tailwindcss/postcss` and `autoprefixer`.
- The root layout imports the stylesheet in `src/routes/+layout.svelte`.

Customization

- Update CSS variables in `:root` within `src/app.css` (for example `--brand` and `--radius`) to change theming.
- Extend Tailwind in `tailwind.config.js` (e.g. exposing HSL variable-driven colors and borderRadius tokens).

Editor support

- For the best DX, install the "Tailwind CSS IntelliSense" VS Code extension (`bradlc.vscode-tailwindcss`). If you're using VS Code, this repo recommends it via `.vscode/extensions.json`.

Unused CSS cleanup

- As part of the Tailwind migration cleanup, we scanned for legacy CSS assets. No unused standalone CSS files were found. The only stylesheet is `src/app.css`, which is in active use.

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
