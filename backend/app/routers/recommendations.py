from fastapi import APIRouter, Depends

from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("", response_model=schemas.RecommendationsOut)
async def get_recommendations(current_user: models.User = Depends(get_current_user)):
    profile = await models.Profile.find_one(models.Profile.user_id == current_user.id)
    recent_logs = (
        await models.DailyLog.find(models.DailyLog.user_id == current_user.id)
        .sort(-models.DailyLog.log_date)
        .limit(7)
        .to_list()
    )
    latest_risk = (
        await models.RiskCheck.find(models.RiskCheck.user_id == current_user.id)
        .sort(-models.RiskCheck.created_at)
        .first_or_none()
    )

    items = []
    based_on = {}

    bmi = None
    if profile and profile.height_cm and profile.weight_kg:
        bmi = round(profile.weight_kg / ((profile.height_cm / 100) ** 2), 1)
        based_on["bmi"] = bmi
        if bmi >= 30:
            items.append(schemas.RecommendationItem(
                trigger=f"BMI is {bmi} (30+)",
                suggestion="Consider a structured weight-management plan — small, sustained calorie deficits and strength training tend to help most with PCOS-linked weight gain.",
            ))
        elif bmi >= 25:
            items.append(schemas.RecommendationItem(
                trigger=f"BMI is {bmi} (25-30)",
                suggestion="Aim for gradual, steady changes: a 30-minute walk most days and swapping one processed snack a day for whole food.",
            ))

    if recent_logs:
        avg_sleep = sum(l.sleep_hours for l in recent_logs) / len(recent_logs)
        based_on["avg_sleep_last_7_logs"] = round(avg_sleep, 1)
        if avg_sleep < 6:
            items.append(schemas.RecommendationItem(
                trigger=f"Average sleep is {avg_sleep:.1f}h over your last {len(recent_logs)} logs (under 6h)",
                suggestion="Improve sleep consistency — a fixed wind-down time and no screens for 30 minutes before bed can meaningfully help hormone regulation.",
            ))

        exercise_days = sum(1 for l in recent_logs if l.exercised)
        based_on["exercise_days_last_7_logs"] = exercise_days
        if exercise_days <= 1:
            items.append(schemas.RecommendationItem(
                trigger=f"Only {exercise_days} of your last {len(recent_logs)} logged days included exercise",
                suggestion="Start small — two 20-minute walks a week is a realistic first target, and it compounds.",
            ))

        avg_water = sum(l.water_glasses for l in recent_logs) / len(recent_logs)
        based_on["avg_water_last_7_logs"] = round(avg_water, 1)
        if avg_water < 6:
            items.append(schemas.RecommendationItem(
                trigger=f"Average water intake is {avg_water:.1f} glasses/day (under 6)",
                suggestion="Try keeping a bottle at your desk and refilling it on a schedule — small habit, real impact on energy and bloating.",
            ))

        irregular_count = sum(1 for l in recent_logs if "Irregular cycle" in l.symptoms)
        based_on["irregular_cycle_logs"] = irregular_count
        if irregular_count >= 2:
            items.append(schemas.RecommendationItem(
                trigger=f"Irregular cycle logged {irregular_count} times recently",
                suggestion="Worth a conversation with a doctor if this keeps recurring — bring these logs with you.",
            ))

    if latest_risk:
        based_on["latest_risk_level"] = latest_risk.risk_level
        if latest_risk.risk_level == "High":
            items.append(schemas.RecommendationItem(
                trigger="Your last risk check came back High",
                suggestion="Prioritise booking a check-up. Lifestyle changes help, but a proper evaluation matters more at this level.",
            ))

    if profile and profile.family_history:
        based_on["family_history"] = True
        items.append(schemas.RecommendationItem(
            trigger="Family history of PCOS or diabetes",
            suggestion="Routine screening (blood sugar, lipid panel) yearly is a reasonable, low-effort precaution given family history.",
        ))

    if not items:
        items.append(schemas.RecommendationItem(
            trigger="No strong signals in your current data",
            suggestion="Keep logging — recommendations get sharper the more data you add. For now, stay consistent with sleep, movement, and balanced meals.",
        ))

    return schemas.RecommendationsOut(based_on=based_on, items=items)
