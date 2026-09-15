from fastapi import APIRouter, Depends, HTTPException

from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/daily-log", tags=["daily-log"])


def _to_out(entry: models.DailyLog) -> schemas.DailyLogOut:
    return schemas.DailyLogOut(
        id=str(entry.id),
        log_date=entry.log_date,
        weight_kg=entry.weight_kg,
        sleep_hours=entry.sleep_hours,
        water_glasses=entry.water_glasses,
        exercised=entry.exercised,
        mood=entry.mood,
        symptoms=entry.symptoms,
    )


@router.post("", response_model=schemas.DailyLogOut, status_code=201)
async def create_log(
    payload: schemas.DailyLogIn,
    current_user: models.User = Depends(get_current_user),
):
    entry = models.DailyLog(
        user_id=current_user.id,
        log_date=payload.log_date,
        weight_kg=payload.weight_kg,
        sleep_hours=payload.sleep_hours,
        water_glasses=payload.water_glasses,
        exercised=payload.exercised,
        mood=payload.mood,
        symptoms=payload.symptoms,
    )
    await entry.insert()
    return _to_out(entry)


@router.get("", response_model=list[schemas.DailyLogOut])
async def list_logs(
    limit: int = 30,
    current_user: models.User = Depends(get_current_user),
):
    entries = (
        await models.DailyLog.find(models.DailyLog.user_id == current_user.id)
        .sort(+models.DailyLog.log_date)
        .limit(limit)
        .to_list()
    )
    return [_to_out(e) for e in entries]


@router.delete("/{log_id}", status_code=204)
async def delete_log(
    log_id: str,
    current_user: models.User = Depends(get_current_user),
):
    from beanie import PydanticObjectId

    try:
        oid = PydanticObjectId(log_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Log entry not found")

    entry = await models.DailyLog.get(oid)
    if not entry or entry.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Log entry not found")
    await entry.delete()
    return None
