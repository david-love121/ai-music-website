# UI Style Guide

This project uses TailwindCSS for styling. The following guidelines describe common patterns and custom utilities available in this repo.

Design tokens

- Colors
  - brand: hsl(var(--brand))
  - brand-foreground: hsl(var(--brand-foreground))
- Radii
  - --radius drives rounded corners via theme.borderRadius.brand

Global file: src/app.css

- Imports Tailwind and defines:
  - CSS variables in :root
  - Utilities: .custom-gradient, .bg-brand, .text-brand
  - Components: .btn-primary, .card

Component conventions

- Prefer Tailwind utility classes in markup.
- Use @apply sparingly for complex, repeated patterns.
- For colors, prefer variable-driven tokens, e.g. text-brand or bg-[hsl(var(--brand))].

Examples

- Primary button
  - <button class="btn-primary">Play</button>
- Card
  - <div class="card">...</div>
- Gradient background
  - <div class="custom-gradient p-6 rounded-brand">...</div>

Dark mode

- Toggle dark theme by setting data-theme="dark" on html or body; overrides are handled via CSS variables.

Extending the theme

- tailwind.config.js extends colors and borderRadius. Add more tokens there to keep styles consistent.

