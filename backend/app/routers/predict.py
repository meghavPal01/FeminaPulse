import json
import os
import joblib
import numpy as np
import shap
from fastapi import APIRouter, Depends
from typing import Optional

from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(tags=["predict"])

_ML_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "ml", "model")
_MODEL_PATH = os.path.join(_ML_DIR, "xgb_model.joblib")
_META_PATH = os.path.join(_ML_DIR, "feature_meta.json")

_model = joblib.load(_MODEL_PATH)
with open(_META_PATH) as f:
    _meta = json.load(f)
FEATURE_ORDER = _meta["feature_order"]
_explainer = shap.TreeExplainer(_model)

FRIENDLY_NAMES = {
    "age": "age",
    "bmi": "BMI",
    "cycle_irregular": "irregular or absent periods",
    "weight_gain": "recent weight gain",
    "hair_growth": "excess hair growth",
    "skin_darkening": "skin darkening",
    "hair_loss": "hair thinning or loss",
    "pimples": "persistent acne / pimples",
    "fast_food": "frequent fast food intake",
    "reg_exercise": "regular exercise",
}

RECOMMENDATIONS = {
    "Low": [
        "Keep logging your cycle and symptoms monthly.",
        "Maintain regular movement and balanced meals.",
    ],
    "Moderate": [
        "Start a daily log to track patterns over the next 4-6 weeks.",
        "Consider mentioning these symptoms at your next check-up.",
        "Prioritise sleep and steady blood sugar through meals.",
    ],
    "High": [
        "Book an appointment with a gynaecologist to discuss these symptoms.",
        "Bring your logged data — cycle length, symptoms, weight trend.",
        "Avoid self-diagnosing; this score is a screening signal, not a result.",
    ],
}


def _bmi_of(height_cm: float, weight_kg: float) -> float:
    h_m = height_cm / 100
    return round(weight_kg / (h_m ** 2), 1)


def _risk_level_of(prob: float) -> str:
    if prob >= 0.66:
        return "High"
    if prob >= 0.35:
        return "Moderate"
    return "Low"


def _is_adverse(feature: str, value: float, bmi: float) -> bool:
    if feature == "bmi":
        return bmi >= 25
    if feature == "reg_exercise":
        return value == 0
    if feature == "age":
        return False
    return value == 1


@router.post("/predict", response_model=schemas.RiskCheckOutput)
async def predict(
    payload: schemas.RiskCheckInput,
    current_user: models.User = Depends(get_current_user),
):
    bmi = _bmi_of(payload.height_cm, payload.weight_kg)

    row = {
        "age": payload.age,
        "bmi": bmi,
        "cycle_irregular": int(payload.cycle_irregular),
        "weight_gain": int(payload.weight_gain),
        "hair_growth": int(payload.hair_growth),
        "skin_darkening": int(payload.skin_darkening),
        "hair_loss": int(payload.hair_loss),
        "pimples": int(payload.pimples),
        "fast_food": int(payload.fast_food),
        "reg_exercise": int(payload.reg_exercise),
    }
    x = np.array([[row[f] for f in FEATURE_ORDER]])

    prob = float(_model.predict_proba(x)[0, 1])
    level = _risk_level_of(prob)

    shap_vals = _explainer.shap_values(x)[0]
    contributions = [
        (feat, val) for feat, val in zip(FEATURE_ORDER, shap_vals)
        if val > 0 and _is_adverse(feat, row[feat], bmi)
    ]
    contributions.sort(key=lambda t: t[1], reverse=True)
    top_reasons = [FRIENDLY_NAMES[feat] for feat, _ in contributions][:4]
    if not top_reasons:
        top_reasons = ["no strong individual risk factors identified"]

    record = models.RiskCheck(
        user_id=current_user.id,
        risk_percent=round(prob * 100, 1),
        risk_level=level,
        bmi=bmi,
        reasons=top_reasons,
    )
    await record.insert()

    return schemas.RiskCheckOutput(
        risk_percent=record.risk_percent,
        risk_level=record.risk_level,
        bmi=record.bmi,
        top_reasons=top_reasons,
        recommendations=RECOMMENDATIONS[level],
        created_at=record.created_at,
    )


@router.get("/risk-latest", response_model=Optional[schemas.RiskCheckOutput])
async def latest_risk(current_user: models.User = Depends(get_current_user)):
    record = (
        await models.RiskCheck.find(models.RiskCheck.user_id == current_user.id)
        .sort(-models.RiskCheck.created_at)
        .first_or_none()
    )
    if not record:
        return None
    return schemas.RiskCheckOutput(
        risk_percent=record.risk_percent,
        risk_level=record.risk_level,
        bmi=record.bmi,
        top_reasons=record.reasons,
        recommendations=RECOMMENDATIONS[record.risk_level],
        created_at=record.created_at,
    )
