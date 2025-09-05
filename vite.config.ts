import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // Use relative base so assets resolve on GitHub Pages project sites
  // (e.g., https://<user>.github.io/<repo>/) and custom domains.
  base: './',
  plugins: [react()],
});
