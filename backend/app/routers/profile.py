from fastapi import APIRouter, Depends

from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=schemas.ProfileOut)
async def get_profile(current_user: models.User = Depends(get_current_user)):
    profile = await models.Profile.find_one(models.Profile.user_id == current_user.id)
    if not profile:
        profile = models.Profile(user_id=current_user.id)
        await profile.insert()
    return profile


@router.put("", response_model=schemas.ProfileOut)
async def update_profile(
    payload: schemas.ProfileIn,
    current_user: models.User = Depends(get_current_user),
):
    profile = await models.Profile.find_one(models.Profile.user_id == current_user.id)
    if not profile:
        profile = models.Profile(user_id=current_user.id)

    profile.age = payload.age
    profile.height_cm = payload.height_cm
    profile.weight_kg = payload.weight_kg
    profile.family_history = payload.family_history

    await profile.save()
    return profile
