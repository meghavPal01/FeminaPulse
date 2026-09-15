# FeminaPulse — Frontend

React + Tailwind frontend for FeminaPulse, wired to a real backend
(see `../backend`) instead of in-memory mock state.

## Run it

The backend must be running first (see `../backend/README.md`):

```bash
cd ../backend
uvicorn app.main:app --reload --port 8000
```

Then, in this folder:

```bash
npm install
cp .env.example .env   # only if you need to change the API URL
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

## What changed from the mock version

- `src/api.js` — a small fetch wrapper for every backend endpoint, reading
  the JWT from `localStorage` and attaching it as a Bearer token.
- `src/context/AppContext.jsx` — no longer holds fake data. Register/login
  call the real backend, profile/logs/risk are fetched and cached in
  state, and a page refresh restores the session from the stored token.
- `RiskCheck.jsx` — added the **skin darkening** question (the model's
  strongest single predictor — it was missing from the original mock UI),
  and now calls `POST /predict` for a real model-scored result instead of
  a client-side rule.
- `Recommendations.jsx` — new page, calls `GET /recommendations`.
- The logo is now a link back to `/` everywhere it appears (sidebar, the
  auth page, and — as a scroll-to-top — the landing page nav).
- Rebranded to **FeminaPulse**: new heart/pulse logo mark (`BrandMark` /
  `BrandMarkOnDark` in `Icons.jsx`) and a `Wordmark` component rendering
  *Femina*Pulse (italic "Femina" + regular "Pulse"), used in the nav,
  sidebar, and auth page.
- Body font switched from Inter to **Open Sans** (headings stay on
  Fraunces). Changed in `index.html`'s Google Fonts link and
  `tailwind.config.js`.
- Field names throughout match the backend schema exactly
  (`height_cm`/`weight_kg`/`family_history` on profile;
  `log_date`/`weight_kg`/`sleep_hours`/`water_glasses`/`exercised` on logs).

## Build for production

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  api.js                  fetch client for the backend
  main.jsx                 entry point, router setup
  App.jsx                  routes, auth gate (waits for session restore)
  context/AppContext.jsx  shared state, backed by real API calls
  components/
    Landing.jsx             marketing landing page
    Auth.jsx                 login / signup (real backend calls)
    AppLayout.jsx             sidebar shell for the logged-in app
    Dashboard.jsx             charts + summary metrics
    DailyLog.jsx              log entry form + recent entries table
    RiskCheck.jsx             questionnaire -> real /predict call
    Recommendations.jsx       rule-based tips from the backend
    Knowledge.jsx              knowledge centre page
    Profile.jsx                 editable profile form
    KnowledgeGrid.jsx          shared article grid (landing + app)
    Icons.jsx                    inline SVG icon set (logo, wordmark, illustrations)
  data/articles.js         knowledge centre content
```
