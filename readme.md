# HusbandMart

A fake e-commerce site where every "product" is a promise, not a purchase — hugs, husband time, chai, a "You Were Right" certificate — building up to a real checkout flow that ends in a personal message instead of a receipt.

## Project structure

```
.
├── index.html      Markup only — page structure and static copy (reviews, plans, the letter)
├── css/
│   └── style.css   All styling, theme tokens (light/dark), layout, animation
├── js/
│   ├── app.js      Product catalog, cart logic, checkout flow, all interactivity
│   └── vendor/
│       └── emailjs.min.js   EmailJS SDK, vendored locally (not loaded from a CDN — see note below)
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
- **Checkout** — a 5-step overlay: order review → collect wife's + husband's email → price reveal (real total collapses to ₹0, paid via "Husband's Love™") → confirmation with a generated order ID and a live "sending…" status → a final personal message.
- **Order emails** — sent client-side via [EmailJS](https://www.emailjs.com) to whichever two addresses were typed at checkout. See setup below; until it's configured, checkout still works but the confirmation step shows "email sending isn't configured yet" instead of pretending to send.
- **Reviews** and **Subscription plans** are static content directly in `index.html` since they're editorial, not data-driven.

## Setting up order emails (EmailJS, free)

EmailJS sends through *your own* connected Gmail/Outlook account, so it can email whatever addresses get typed into checkout — not just a fixed inbox.

1. Sign up free at [emailjs.com](https://www.emailjs.com).
2. **Email Services** → *Add New Service* → connect your Gmail or Outlook. Copy the **Service ID** (e.g. `service_abc1234`).
3. **Email Templates** → *Create New Template*. This is the important part:
   - Set the **To Email** field to `{{to_email}}` — by default EmailJS pre-fills your own address here, and if you leave that as-is every email will go to you instead of the wife/husband addresses typed at checkout.
   - Subject: `HusbandMart — Order {{order_id}} Confirmed ❤️`
   - Content:
     ```
     Hi {{to_name}},

     Your order at HusbandMart has been placed.

     Order ID: {{order_id}}

     Items:
     {{item_list}}

     Total: {{total}}
     Payment method: Husband's Love™

     — HusbandMart
     ```
   - Save, then copy the **Template ID** (e.g. `template_xyz5678`).
4. **Account** → *General* → copy your **Public Key**.
5. Paste all three into `js/app.js` at the top, in `EMAILJS_CONFIG`:
   ```js
   var EMAILJS_CONFIG = {
     serviceId: "service_abc1234",
     templateId: "template_xyz5678",
     publicKey: "your_public_key"
   };
   ```
6. Commit and push — Pages picks it up automatically. Free tier is 200 emails/month, which is plenty for one order.

The SDK itself (`js/vendor/emailjs.min.js`) is vendored into the repo rather than loaded from a CDN, since a CDN can be slow, blocked, or ad-blocked depending on the visitor's network — which otherwise silently breaks sending with no way to tell why. To update it later: `curl -s https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js -o js/vendor/emailjs.min.js`.

## Customizing

- **Products / prices / categories** — edit the `PRODUCTS` and `CATEGORIES` arrays at the top of `js/app.js`.
- **The letter** and **final surprise message** — edit the text inside `#step3` and `#step4` in `index.html`.
- **The order-email template** — edit the template content on EmailJS's dashboard (not in this repo); the variables sent from the code are `to_email`, `to_name`, `order_id`, `item_list`, `total`.
- **Colors / fonts** — edit the CSS custom properties at the top of `css/style.css` (`--accent`, `--bg`, etc.); dark mode is handled automatically via the same tokens.

## Publishing

Any static host works: GitHub Pages, Netlify, Vercel, Cloudflare Pages — drag-and-drop the whole folder, or point a Git-based host at this repo with no build command.
