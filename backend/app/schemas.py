from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


# ---------- Auth ----------
class UserRegister(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Profile ----------
class ProfileIn(BaseModel):
    age: Optional[int] = Field(None, ge=10, le=90)
    height_cm: Optional[float] = Field(None, gt=100, lt=230)
    weight_kg: Optional[float] = Field(None, gt=25, lt=250)
    family_history: bool = False


class ProfileOut(ProfileIn):
    model_config = ConfigDict(from_attributes=True)


# ---------- Daily log ----------
class DailyLogIn(BaseModel):
    log_date: date
    weight_kg: float = Field(..., gt=25, lt=250)
    sleep_hours: float = Field(..., ge=0, le=24)
    water_glasses: float = Field(0, ge=0, le=30)
    exercised: bool = False
    mood: str = "okay"
    symptoms: list[str] = []

    @field_validator("mood")
    @classmethod
    def mood_must_be_known(cls, v):
        allowed = {"great", "okay", "low", "anxious"}
        if v not in allowed:
            raise ValueError(f"mood must be one of {allowed}")
        return v


class DailyLogOut(BaseModel):
    id: str
    log_date: date
    weight_kg: float
    sleep_hours: float
    water_glasses: float
    exercised: bool
    mood: str
    symptoms: list[str]

    model_config = ConfigDict(from_attributes=True)


# ---------- Risk check / prediction ----------
class RiskCheckInput(BaseModel):
    age: int = Field(..., ge=10, le=80)
    height_cm: float = Field(..., gt=100, lt=230)
    weight_kg: float = Field(..., gt=25, lt=250)
    cycle_irregular: bool
    weight_gain: bool
    hair_growth: bool
    skin_darkening: bool = False
    hair_loss: bool = False
    pimples: bool
    fast_food: bool = False
    reg_exercise: bool = False


class RiskCheckOutput(BaseModel):
    risk_percent: float
    risk_level: str
    bmi: float
    top_reasons: list[str]
    recommendations: list[str]
    created_at: Optional[datetime] = None


# ---------- Recommendations ----------
class RecommendationItem(BaseModel):
    trigger: str
    suggestion: str


class RecommendationsOut(BaseModel):
    based_on: dict
    items: list[RecommendationItem]
