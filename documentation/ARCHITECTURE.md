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
