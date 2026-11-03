# Swathi Jain | Acting Portfolio

Static site (HTML, CSS, JS). No build step, no cost. Theme: "Silk & Zari" (light by default, dark toggle).

## Publish on GitHub Pages
1. Push these files to the `main` branch root of the repo. `index.html` is a single page: animated photo landing first, then About, Work and Open to work as you scroll.
2. **Settings → Pages → Deploy from a branch → main / (root)**.
3. Live at `https://<username>.github.io/Swathi-Jain-Portfolio/`.

## Photos and posters
- Portrait: save the photo as `assets/swathi.jpg` (used by the landing and the portfolio).
- Posters: save in `assets/posters/` (2:3, about 600x900) using these exact names:
  `premada-oorali`, `riktha`, `kerebete`, `preman`, `jenugudu`, `lakshana`, `amruthadhare`,
  `avanu-matthe-shravani`, `bhagyalakshmi`, `ambassador`, `mayavi-manase`, `billionaires-hidden-life` (all `.jpg`).
  Any missing poster automatically shows a styled title card.
- Link preview: replace `assets/og-card.svg` with a 1200x630 `og-card.png` and use a full `https://` URL in the `og:image` tag.

## Contact
No phone or WhatsApp is published. To add a contact button later, uncomment/add it in the "Open to work" section of `index.html`.
