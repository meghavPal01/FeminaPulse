from fastapi import APIRouter, HTTPException, status

from .. import models, schemas
from ..auth import hash_password, verify_password, create_access_token

router = APIRouter(tags=["auth"])


@router.post("/register", response_model=schemas.TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: schemas.UserRegister):
    existing = await models.User.find_one(models.User.email == payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    user = models.User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    await user.insert()

    # Every new user gets an empty profile row so /profile GET never 404s.
    await models.Profile(user_id=user.id).insert()

    token = create_access_token(user.id)
    return schemas.TokenResponse(
        access_token=token,
        user=schemas.UserOut(id=str(user.id), name=user.name, email=user.email),
    )


@router.post("/login", response_model=schemas.TokenResponse)
async def login(payload: schemas.UserLogin):
    user = await models.User.find_one(models.User.email == payload.email)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token(user.id)
    return schemas.TokenResponse(
        access_token=token,
        user=schemas.UserOut(id=str(user.id), name=user.name, email=user.email),
    )
