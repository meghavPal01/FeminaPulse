from datetime import datetime, date, timezone
from typing import Optional
from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field


class User(Document):
    name: str
    email: Indexed(str, unique=True)
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"


class Profile(Document):
    user_id: PydanticObjectId
    age: Optional[int] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    family_history: bool = False

    class Settings:
        name = "profiles"


class DailyLog(Document):
    user_id: PydanticObjectId
    log_date: date
    weight_kg: float
    sleep_hours: float
    water_glasses: float = 0
    exercised: bool = False
    mood: str = "okay"
    symptoms: list[str] = []

    class Settings:
        name = "daily_logs"


class RiskCheck(Document):
    user_id: PydanticObjectId
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    risk_percent: float
    risk_level: str
    bmi: float
    reasons: list[str] = []

    class Settings:
        name = "risk_checks"
