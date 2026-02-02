# Travel Itinerary Generator

A single-page web app that lets users plan trips by entering destination, budget, travel mode, and preferences. The form submits data to an n8n webhook and displays a trip summary (and optional email status) after submission.

**Tagline:** *Plan your trip in one place — destination, budget, and preferences.*

---

## Project structure

| File | Purpose |
|------|--------|
| **index.html** | Page structure, form markup, hero, summary panel, and script/style links |
| **style.css** | Layout, dark theme, form styling, interactive background, responsive rules |
| **script.js** | Form validation, webhook POST, summary rendering, and background interaction |

---

## index.html

- **Doctype & meta:** UTF-8, viewport for responsive layout.
- **Fonts:** [Google Fonts](https://fonts.googleapis.com) — **Outfit** (body) and **Playfair Display** (headings).
- **Background:** `.bg-interactive` with gradient and floating emoji orbs (✈️ 🗺️ 🌍 🎒 🌴 📷 🧳 🏖️).
- **Hero:** Title “Travel Itinerary Generator” and tagline.
- **Form** `#itinerary-form` (novalidate; validation in JS):
  - **Trip details:** Starting location, destination, number of days (1–365), number of travelers (1–99).
  - **Budget & travel:** Budget (currency prefix), mode of travel (Bus / Train / Flight / Car).
  - **Contact & preferences:** Email, optional additional preferences (textarea).
- **Actions:** “Generate itinerary” (submit), “Clear form” (reset).
- **Summary:** `#summary-panel` (hidden by default), `#summary-list`, `#email-status` for webhook/email feedback.
- **Footer:** Short tagline.
- **Script:** `script.js` loaded at end of `<body>`.

---

## style.css

- **Variables** (`:root`): Dark palette (`--color-bg`, `--color-surface`, `--color-accent`, etc.), `--font-sans` (Outfit), `--font-display` (Playfair Display), `--radius`, `--shadow`, `--transition`.
- **Reset:** `box-sizing: border-box`, base font size, smooth scroll.
- **Background:** Fixed `.bg-interactive` with animated gradient and `.bg-orbs` (floating, staggered animation). Mouse position drives a subtle gradient highlight via `--mouse-x` / `--mouse-y` (set in JS).
- **Layout:** `.page-wrap` max-width 720px, centered; flex column for hero, main, footer.
- **Form:** Sections in cards (surface, border, radius, shadow). Labels, required/optional styling, input/textarea focus and hover. Budget field uses `.input-with-prefix` with `$`. `.row` for two-column fields; stacks on small screens (e.g. &lt; 480px).
- **Radio group:** Mode of travel as pill-style options with checked/hover/focus states.
- **Buttons:** `.btn-primary` (accent), `.btn-secondary` (outline); focus-visible outlines.
- **Summary panel:** Card style; `.hidden` toggles visibility. Email status variants: `.email-status--sent` (green), `.email-status--not-sent` (red).
- **Accessibility:** `.visually-hidden` for screen-reader-only labels; focus styles on inputs and buttons.

---

## script.js

- **Webhook:** Sends form data to an n8n webhook URL (see `WEBHOOK_URL` at top). Replace with your own URL for your environment.
- **Validation:**  
  - Required text: starting location, destination.  
  - Numbers: days 1–365, travelers 1–99, budget ≥ 0.  
  - Email format.  
  - Mode of travel: one radio required.  
  Errors are shown in corresponding `#*-error` elements.
- **Submit flow:**
  1. `preventDefault`, clear previous errors.
  2. Validate all fields; if invalid, focus first error and stop.
  3. Disable submit button, show “Generating…”.
  4. Build payload (startingLocation, destination, numberOfDays, numberOfTravelers, budget, modeOfTravel, email, optional additionalPreferences).
  5. `fetch(WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })`.
  6. On success: render summary, set email status from response (e.g. `data.emailSent`; default true if missing).
  7. On failure: still render summary, set “Email not sent”, show alert.
  8. In `finally`: re-enable button, restore “Generate itinerary” text.
- **Summary:** `buildSummaryData()` builds label/value pairs; `renderSummary()` fills `#summary-list` (with HTML escaped), unhides `#summary-panel`, scrolls to it.
- **Reset:** On form reset, clear errors, hide summary, clear list and email status (in `setTimeout` so it runs after reset).
- **Live validation:** Input/change listeners on required fields and mode radios clear or set errors as the user types.
- **Background:** `mousemove` on document updates `--mouse-x` and `--mouse-y` on `#bg-interactive` for the gradient highlight.

---

## How to run

1. **Local:**  
   Open `index.html` in a browser (file protocol), or serve the folder with any static server (e.g. `npx serve .`, or your IDE’s “Live Server”).

2. **Webhook:**  
   Update `WEBHOOK_URL` in `script.js` to your n8n (or other) webhook. The app sends a JSON body with the form fields; your backend can return `{ "emailSent": true }` or `{ "emailSent": false }` to drive the email status message.

3. **CORS:**  
   If you open the page from `file://` or another origin, the webhook must allow that origin (or your server’s origin) in CORS for the `fetch` to succeed.

---

## Browser support

- Modern browsers that support CSS custom properties, `fetch`, and the DOM APIs used (e.g. `classList`, `querySelector`, `addEventListener`). No build step or frameworks required.

---

## Customization

- **Theme:** Edit `:root` in `style.css` (e.g. `--color-accent`, `--color-bg`).
- **Webhook payload:** Adjust `buildPayload()` in `script.js` to add/rename fields to match your n8n workflow.
- **Validation rules:** Change validators in `requiredFields` and `validateModeOfTravel()` (e.g. max days, budget limits).

---

*Travel Itinerary Generator — plan once, travel well.*
