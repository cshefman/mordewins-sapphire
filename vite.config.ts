import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// base: "./" so the static build works from file:// or any sub-path host
// (GitHub Pages / Netlify / Vercel), per the brief.
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["Sapphire.png", "icons/apple-touch-icon.png"],
      manifest: {
        name: "Mordewin's Sapphire",
        short_name: "Sapphire",
        description: "Companion app for the homebrew item Mordewin's Sapphire.",
        theme_color: "#070b12",
        background_color: "#070b12",
        display: "standalone",
        orientation: "portrait",
        start_url: "./",
        scope: "./",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // precache the whole static build so it runs fully offline
        globPatterns: ["**/*.{js,css,html,png,svg,ico,woff,woff2}"],
      },
    }),
  ],
  server: { port: 5180, strictPort: true },
});
