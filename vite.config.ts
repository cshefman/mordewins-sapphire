import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" so the static build works from file:// or any sub-path host
// (GitHub Pages / Netlify / Vercel), per the brief.
export default defineConfig({
  base: "./",
  plugins: [react()],
  server: { port: 5180, strictPort: true },
});
