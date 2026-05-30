/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Palette from the approved mockup (brief §5.3)
      colors: {
        bg0: "#070b12",
        bg1: "#0c1422",
        bg2: "#101d31",
        sap: "#2f6fd6",
        "sap-bright": "#5b9bff",
        "sap-deep": "#13327a",
        "sap-glow": "#3f86f0",
        ice: "#cfe6ff",
        gold: "#e9bd4c",
        "gold-bright": "#f7da86",
        "gold-deep": "#a9781d",
        ink: "#e9f1fc",
        mut: "#93a8c4",
        mut2: "#6c819e",
        lock: "#33415a",
        "lock-ink": "#5e739a",
        // damage-type chip colours
        thunder: "#b9a3ff",
        heal: "#7fe0b0",
      },
      fontFamily: {
        // brief §5.4
        title: ["'Cinzel Decorative'", "serif"],
        cinzel: ["'Cinzel'", "serif"],
        body: ["'Spectral'", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
