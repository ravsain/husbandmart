# HusbandMart

A fake e-commerce site where every "product" is a promise, not a purchase — hugs, husband time, chai, a "You Were Right" certificate — building up to a real checkout flow that ends in a personal message instead of a receipt.

## Project structure

```
.
├── index.html      Markup only — page structure and static copy (reviews, plans, the letter)
├── css/
│   └── style.css   All styling, theme tokens (light/dark), layout, animation
├── js/
│   └── app.js      Product catalog, cart logic, checkout flow, all interactivity
└── readme.md
```

No build step, no dependencies to install. It's a static site — open `index.html` directly in a browser, or serve the folder with any static host.

## Running it locally

Just double-click `index.html`, or serve it properly (recommended, avoids any local-file quirks):

```
npx serve .
```

or with Python:

```
python -m http.server 8000
```

## How it works

- **Shop** — product cards pulled from the `PRODUCTS` array in `js/app.js`, filterable by category and by the search box.
- **Cart** — a slide-in drawer; quantities tracked in memory (`state.cart`), nothing persisted.
- **Checkout** — a 4-step overlay: order review → price reveal (real total collapses to ₹0, paid via "Husband's Love™") → confirmation with a generated order ID → a final personal message.
- **Reviews** and **Subscription plans** are static content directly in `index.html` since they're editorial, not data-driven.

## Customizing

- **Products / prices / categories** — edit the `PRODUCTS` and `CATEGORIES` arrays at the top of `js/app.js`.
- **The letter** and **final surprise message** — edit the text inside `#step3` and `#step4` in `index.html`.
- **Colors / fonts** — edit the CSS custom properties at the top of `css/style.css` (`--accent`, `--bg`, etc.); dark mode is handled automatically via the same tokens.

## Publishing

Any static host works: GitHub Pages, Netlify, Vercel, Cloudflare Pages — drag-and-drop the whole folder, or point a Git-based host at this repo with no build command.
