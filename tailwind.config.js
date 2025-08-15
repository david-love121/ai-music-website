/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      colors: {
        // Use CSS variables with HSL for dynamic theming
        brand: "hsl(var(--brand))",
        brandFg: "hsl(var(--brand-foreground))",
      },
      borderRadius: {
        // Expose a variable-driven radius utility
        brand: "var(--radius)",
      },
    },
  },
  plugins: [],
};
