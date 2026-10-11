# Femina Pulse

A full-stack PCOS tracking app: React frontend, FastAPI backend on
**MongoDB Atlas**, and a trained XGBoost risk-prediction model ,built out
phase by phase per the original project roadmap.

**2. Backend:**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # then paste your MONGODB_URI into it
uvicorn app.main:app --reload --port 8000
```

**3. Frontend** (in a second terminal):
```bash
cd frontend
npm install
npm run dev
```

Open the printed frontend URL, sign up, and you're in. Data now persists
in your own Atlas cluster — check the "Collections" tab in the Atlas UI
to watch documents appear as you use the app.

## What's in each folder

| Folder | What it is |
|--------|------------|
| `frontend/` | React + Vite + Tailwind app — landing page, auth, dashboard, daily log, risk check, recommendations, knowledge centre, profile |
| `backend/` | FastAPI app — real auth (JWT + bcrypt), MongoDB Atlas persistence via Motor/Beanie, the ML risk endpoint, and the rule-based recommendations engine |
| `backend/ml/` | Dataset, training script, and trained XGBoost model artifacts that `backend/app/routers/predict.py` loads |
| `database/` | Collection schema documentation |
| `documentation/` | Architecture overview and technology rationale |

## Status against the original roadmap

- ✅ Phase 1 — Auth (JWT-based, not Firebase — see backend README for why)
- ✅ Phase 2 — Profile
- ✅ Phase 3 — AI risk prediction (real XGBoost model + SHAP, trained on the public Kaggle PCOS dataset)
- ✅ Phase 4 — Knowledge centre
- ✅ Phase 5 — Daily health monitoring
- ✅ Phase 6 — Progress dashboard
- ✅ Phase 7 — Lifestyle recommendation engine (rule-based, as planned for its first iteration)
- ✅ MongoDB Atlas — real, via Motor + Beanie (needs your own free-tier connection string, see above)
- ✅Firebase Authentication 
- ⏳ Deployment (Vercel/Render) — not yet done

  # Femina Pulse — Architecture Overview

## System diagram

```
┌─────────────────┐        JWT bearer auth        ┌──────────────────────┐
│   React (Vite)   │ ───────────────────────────► │   FastAPI backend    │
│  localhost:5173   │ ◄─────────────────────────── │   localhost:8000     │
└─────────────────┘        JSON over HTTP          └──────────┬───────────┘
                                                                │  Motor (async)
                                                    ┌───────────┴───────────┐
                                                    │  MongoDB Atlas          │
                                                    │  (Beanie ODM)           │
                                                    │  users / profiles /     │
                                                    │  daily_logs /           │
                                                    │  risk_checks            │
                                                    └───────────┬───────────┘
                                                                │
                                                    ┌───────────┴───────────┐
                                                    │  ml/model/             │
                                                    │  xgb_model.joblib       │
                                                    │  (loaded at API startup)│
                                                    └────────────────────────┘
```

## Request flow example: taking the risk check

1. User fills the questionnaire in `RiskCheck.jsx` (React).
2. Frontend calls `POST /predict` with age, height, weight, and 7 yes/no
   symptom answers, JWT attached via `api.js`.
3. `app/routers/predict.py` computes BMI, runs the XGBoost model loaded
   from `ml/model/xgb_model.joblib`, computes SHAP contributions, filters
   them to only symptoms the user actually reported as present, and saves
   the result to the `risk_checks` table tied to that user.
4. Response (`risk_percent`, `risk_level`, `bmi`, `top_reasons`,
   `recommendations`) renders directly in the UI.
5. Next time the Dashboard loads, `GET /risk-latest` pulls that same saved
   result so "Risk level" shows without re-running the questionnaire.

## Why these technology choices

| Layer      | Choice                  | Why                                                   |
|------------|--------------------------|--------------------------------------------------------|
| Frontend    | React + Vite + Tailwind | Matches original project plan (Phase 1)                |
| Routing     | react-router-dom         | Standard, matches plan's "React Router" line item        |
| Charts      | Recharts                 | Matches plan's "Recharts" line item                     |
| Backend     | FastAPI                  | Matches plan; async-friendly, auto docs, Pydantic validation |
| Auth        | JWT + bcrypt             | Standard stateless auth; Firebase Auth was in the original plan but needs external project credentials this environment doesn't have |
| Database    | MongoDB Atlas via Motor + Beanie | Matches the original plan exactly — flexible schema for health data |
| ML model    | XGBoost                  | Matches plan; trained on the public Kaggle PCOS dataset, restricted to self-reportable features only |
| Explainability | SHAP                  | Matches plan's tech stack; used to generate the "top reasons" behind each risk score |

## What's real vs. what's a documented placeholder

| Feature                          | Status                                             |
|-----------------------------------|-----------------------------------------------------|
| Auth (register/login)             | Real (bcrypt + JWT), not Firebase                   |
| Profile storage                   | Real (MongoDB Atlas)                                |
| Daily log storage                 | Real (MongoDB Atlas)                                |
| PCOS risk prediction               | Real (trained XGBoost model, ~81-82% test accuracy) |
| SHAP explanations                  | Real                                                 |
| Lifestyle recommendations          | Real (rule-based, per the original Phase 7 plan)     |
| Database                           | Real MongoDB Atlas (requires your own connection string — see `backend/README.md`) |
| Knowledge centre content           | Real content, static (no CMS/admin panel yet)        |

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
