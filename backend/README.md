# Femina Pulse — Backend (MongoDB Atlas)

FastAPI backend for Femina Pulse: real authentication, profile storage,
daily health logs, the XGBoost PCOS risk model, and a rule-based
recommendations engine — persisted in **MongoDB Atlas**.

## Stack

- **FastAPI** — HTTP API (async throughout)
- **Motor + Beanie** — async MongoDB driver + ODM
- **PyJWT + bcrypt** — auth (JWT bearer tokens, hashed passwords)
- **XGBoost + SHAP** — the `/predict` risk model (trained in `ml/`)

## MongoDB Atlas setup

You need your own free Atlas cluster — this can't be provisioned for you
automatically, since it requires your own account.

1. Go to <https://www.mongodb.com/cloud/atlas/register> and create a free
   account.
2. Create a new project, then build a database — choose the **M0 (free)**
   tier.
3. **Database Access** → add a database user (username + password;
   autogenerate a password and save it somewhere safe).
4. **Network Access** → add an IP entry. For local development, "Allow
   access from anywhere" (`0.0.0.0/0`) is the simplest option; tighten
   this before any real deployment.
5. Go to your cluster → **Connect** → **Drivers** → copy the connection
   string. It looks like:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
6. Copy `.env.example` to `.env` and paste your connection string in as
   `MONGODB_URI` (with your actual username/password substituted in).

```bash
cp .env.example .env
# then edit .env with your real MONGODB_URI
```

No manual schema/collection setup needed — Beanie creates collections
and indexes automatically on first connection.

## Run it

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Interactive docs: `http://localhost:8000/docs`

If `MONGODB_URI` isn't set, it falls back to `mongodb://localhost:27017`
(a local MongoDB, if you have one) — Atlas is the intended target but
nothing hardcodes it.

## Endpoints

| Method | Path              | Auth? | Description                                  |
|--------|-------------------|-------|-----------------------------------------------|
| POST   | `/register`       | No    | Create account, returns JWT + user            |
| POST   | `/login`          | No    | Returns JWT + user                            |
| GET    | `/profile`        | Yes   | Current user's profile                        |
| PUT    | `/profile`        | Yes   | Update profile (age, height, weight, family history) |
| POST   | `/daily-log`      | Yes   | Create a log entry                            |
| GET    | `/daily-log`      | Yes   | List recent log entries                       |
| DELETE | `/daily-log/{id}` | Yes   | Delete a log entry                            |
| POST   | `/predict`        | Yes   | Run the XGBoost risk model, persists the result |
| GET    | `/risk-latest`    | Yes   | Most recent saved risk check, or null         |
| GET    | `/recommendations`| Yes   | Rule-based tips from profile + recent logs + latest risk |
| GET    | `/health`         | No    | Liveness check                                |

All authenticated routes expect `Authorization: Bearer <token>`. IDs
(user id, log id) are MongoDB ObjectIds, serialized as strings over the API.

## Project structure

```
backend/
  app/
    main.py            App factory (`create_app`), CORS, router registration, Mongo lifespan
    database.py         Motor client + Beanie init (reads MONGODB_URI / MONGODB_DB)
    models.py             Beanie Documents: User, Profile, DailyLog, RiskCheck
    schemas.py             Pydantic request/response schemas
    auth.py                 password hashing, JWT issue/verify, get_current_user
    routers/
      auth.py               /register, /login
      profile.py            /profile
      logs.py               /daily-log
      predict.py            /predict, /risk-latest (loads ../ml/model/*)
      recommendations.py    /recommendations
  ml/
    train.py             XGBoost training pipeline
    data/PCOS_data_raw.csv
    model/                trained artifacts predict.py loads at import time
  test_backend.py       pytest suite (14 tests, in-memory Mongo mock)
  requirements.txt
  .env.example
```

## Tests

```bash
pytest test_backend.py -v
```

14 tests: registration/login, duplicate email rejection, wrong password,
unauthenticated access rejection, profile CRUD, daily log CRUD + isolation
between users, prediction (high vs low risk, persistence, null-when-empty,
auth requirement), and recommendations (with and without data).

Tests run against **mongomock-motor**, an in-memory MongoDB-compatible
mock — no real Atlas connection or network access needed to run the suite.
This verifies all the Motor/Beanie query logic is correct; pointing
`MONGODB_URI` at a real Atlas cluster is then purely a config change, not
a code change. (One small compatibility shim is applied in
`test_backend.py` for a kwarg mismatch between Beanie 2.x and the mock
library — commented inline, doesn't affect real Atlas usage via Motor.)

## Auth model

Passwords are hashed with bcrypt. Login/register return a JWT (7-day
expiry, `HS256`) signed with `JWT_SECRET`. Set a real secret in `.env`
before deploying anywhere beyond your laptop.

The frontend stores this token in `localStorage` and sends it as
`Authorization: Bearer <token>` on every request.

## Honest limitations

- JWT secret has an insecure default fallback so the demo runs out of the
  box if you forget to set one. Don't ship that default anywhere real.
- No rate limiting, no email verification, no password reset flow.
- Network Access "allow from anywhere" is fine for a demo; scope it to
  known IPs before any real deployment.
