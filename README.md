## Game Portfolio (Pokemon‑style Battle Demo)

This is a small browser game I built for fun, with a helping hand from AI. It recreates a retro, turn‑based battle flow and showcases a few tongue‑in‑cheek “IT‑themed” creatures. The project is a playground for UI/animation ideas and a place to try out interactions fast.

I’m open to new freelance projects. If you want to collaborate, say hi at:

- fabioalbuquerque.com
- fabioalbuquerque.pt

### Tech

- React + TypeScript + Vite
- Tailwind CSS (v4) for styling
- Storybook for component previews

### Scripts

- pnpm dev — run the app locally
- pnpm build — build for production
- pnpm preview — preview the build
- pnpm storybook — run Storybook

### Node / pnpm

Vite 7 requires Node 20.19+ or 22.12+. Recommended:

- Node: 22.x (LTS)
- pnpm: 8.x or 9.x

If you see a crypto.hash error, upgrade Node to a supported version and reinstall deps (rm -rf node_modules pnpm-lock.yaml && pnpm install).

### Deploy (GitHub Pages)

This repo is configured to deploy to GitHub Pages using Actions.

1. Set the base path in vite.config.ts (already set to /game-portfolio/).
2. Push to main. The workflow at .github/workflows/deploy.yml builds and publishes dist/.
3. Enable Pages in the repo settings (Source: GitHub Actions).

Your site will be available at https://<your-user>.github.io/game-portfolio/.

### Notes

- Art and UI are evolving; pieces may be intentionally stylized or WIP.
- Ideas, feedback or hire requests are very welcome.

— Fábio Albuquerque
