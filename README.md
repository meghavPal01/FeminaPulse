# Femina Pulse

A full-stack PCOS tracking app: React frontend, FastAPI backend on
**MongoDB Atlas**, and a trained XGBoost risk-prediction model — built out
phase by phase per the original project roadmap.

## Quick start

**1. Set up MongoDB Atlas** (one-time, ~5 minutes) — see
`backend/README.md` → "MongoDB Atlas setup" for the full walkthrough:
create a free account, a free M0 cluster, a database user, allow network
access, and copy the connection string into `backend/.env`.

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
- ⏳ Firebase Authentication — documented as a future swap in `backend/README.md`
- ⏳ Deployment (Vercel/Render) — not yet done

## Tests

```bash
cd backend && pytest test_backend.py -v   # 14 tests: auth, profile, logs, predict, recommendations
```

Tests run against an in-memory MongoDB-compatible mock
(`mongomock-motor`), so they need no network access and never touch your
real Atlas cluster — but they exercise the exact same Motor/Beanie query
code that talks to Atlas in production.

Frontend has no automated tests yet — a good next addition (React Testing
Library + Vitest) if you want to keep building this out.
