# Merge Helper

Free energy calculator for merge board events (Coin Master Board Adventure). React + Vite + Tailwind, no backend.

## Run
```bash
npm install
npm run dev      # local
npm run build    # static site in dist/
```

## Configure
Edit `src/config.js`: set `SUPPORT_URL` (Ko-fi or a Stripe Payment Link) and `FEEDBACK_URL` (Tally or Google Form). Add games to `GAMES`.

## Deploy (free)
Cloudflare Pages: connect the repo, build command `npm run build`, output folder `dist`.

## Files
- `useBoard.js`: board state, auto-save, share link, energy formula
- `scan.js`: in-browser screenshot matching (chain bar icons = references)
- `Calculator.jsx`, `ScanModal.jsx`, `GamePicker.jsx`, `Modal.jsx`, `App.jsx`: UI
