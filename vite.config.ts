import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // Set the base path for GitHub Pages project site
  // Update this if you change the repo name
  base: "/game-portfolio/",
  plugins: [react()],
});
