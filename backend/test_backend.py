"""
Backend test suite, run against an in-memory MongoDB-compatible mock
(mongomock-motor) so it never touches a real Atlas cluster and needs zero
network access. This verifies the Beanie/Motor code paths are correct;
swapping in a real MONGODB_URI is then just configuration, not code.

Run:
    pytest test_backend.py -v
"""
import os
import pytest
import mongomock
from fastapi.testclient import TestClient
from mongomock_motor import AsyncMongoMockClient

os.environ["JWT_SECRET"] = "test-secret"

# mongomock-motor wraps the sync `mongomock` library, which doesn't yet accept
# a couple of newer keyword arguments that Beanie 2.x passes through to
# list_collection_names (e.g. `authorizedCollections`). This only affects the
# in-memory test double — a real MongoDB/Atlas server via Motor handles these
# natively — so we shim it here rather than touching any production code path.
_orig_list_collection_names = mongomock.database.Database.list_collection_names


def _list_collection_names_compat(self, filter=None, session=None, **kwargs):
    return _orig_list_collection_names(self, filter=filter, session=session)


mongomock.database.Database.list_collection_names = _list_collection_names_compat

from app.main import create_app


@pytest.fixture()
def client():
    """Fresh app + fresh in-memory Mongo client for every test function."""
    mongo_client = AsyncMongoMockClient()
    app = create_app(mongo_client=mongo_client)
    with TestClient(app) as c:
        yield c


def _register(client, email="user@example.com", password="secret123", name="Test User"):
    return client.post("/register", json={"name": name, "email": email, "password": password})


def _auth_headers(client, email="user@example.com", password="secret123"):
    r = _register(client, email, password)
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ---------- Auth ----------
def test_register_and_login(client):
    r = _register(client, "alice@example.com", "password1")
    assert r.status_code == 201
    assert r.json()["user"]["email"] == "alice@example.com"

    r = client.post("/login", json={"email": "alice@example.com", "password": "password1"})
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_duplicate_registration_rejected(client):
    _register(client, "bob@example.com", "password1")
    r = _register(client, "bob@example.com", "password1")
    assert r.status_code == 400


def test_wrong_password_rejected(client):
    _register(client, "carol@example.com", "password1")
    r = client.post("/login", json={"email": "carol@example.com", "password": "nope"})
    assert r.status_code == 401


def test_unauthenticated_profile_access_rejected(client):
    r = client.get("/profile")
    assert r.status_code == 401


# ---------- Profile ----------
def test_profile_defaults_then_update(client):
    headers = _auth_headers(client, "dana@example.com", "password1")
    r = client.get("/profile", headers=headers)
    assert r.status_code == 200
    assert r.json()["age"] is None

    r = client.put("/profile", headers=headers, json={
        "age": 27, "height_cm": 165, "weight_kg": 60, "family_history": False
    })
    assert r.status_code == 200
    assert r.json()["age"] == 27
    assert r.json()["height_cm"] == 165


# ---------- Daily log ----------
def test_daily_log_crud(client):
    headers = _auth_headers(client, "erin@example.com", "password1")

    r = client.post("/daily-log", headers=headers, json={
        "log_date": "2026-09-01", "weight_kg": 65, "sleep_hours": 7,
        "water_glasses": 6, "exercised": True, "mood": "great", "symptoms": ["None"],
    })
    assert r.status_code == 201
    log_id = r.json()["id"]
    assert isinstance(log_id, str)

    r = client.get("/daily-log", headers=headers)
    assert r.status_code == 200
    assert len(r.json()) == 1

    r = client.delete(f"/daily-log/{log_id}", headers=headers)
    assert r.status_code == 204

    r = client.get("/daily-log", headers=headers)
    assert len(r.json()) == 0


def test_daily_log_rejects_unknown_mood(client):
    headers = _auth_headers(client, "frank@example.com", "password1")
    r = client.post("/daily-log", headers=headers, json={
        "log_date": "2026-09-01", "weight_kg": 65, "sleep_hours": 7,
        "water_glasses": 6, "exercised": True, "mood": "ecstatic", "symptoms": [],
    })
    assert r.status_code == 422


def test_users_cannot_see_each_others_logs(client):
    headers_a = _auth_headers(client, "gina@example.com", "password1")
    headers_b = _auth_headers(client, "hank@example.com", "password1")

    client.post("/daily-log", headers=headers_a, json={
        "log_date": "2026-09-01", "weight_kg": 65, "sleep_hours": 7,
        "water_glasses": 6, "exercised": True, "mood": "great", "symptoms": [],
    })
    r = client.get("/daily-log", headers=headers_b)
    assert r.json() == []


# ---------- Predict ----------
HIGH_RISK_PAYLOAD = {
    "age": 24, "height_cm": 160, "weight_kg": 78,
    "cycle_irregular": True, "weight_gain": True, "hair_growth": True,
    "skin_darkening": True, "hair_loss": False, "pimples": True,
    "fast_food": True, "reg_exercise": False,
}
LOW_RISK_PAYLOAD = {
    "age": 29, "height_cm": 165, "weight_kg": 58,
    "cycle_irregular": False, "weight_gain": False, "hair_growth": False,
    "skin_darkening": False, "hair_loss": False, "pimples": False,
    "fast_food": False, "reg_exercise": True,
}


def test_predict_high_and_low_risk(client):
    headers = _auth_headers(client, "iris@example.com", "password1")

    r_high = client.post("/predict", headers=headers, json=HIGH_RISK_PAYLOAD)
    assert r_high.status_code == 200
    assert r_high.json()["risk_level"] in ("Moderate", "High")

    r_low = client.post("/predict", headers=headers, json=LOW_RISK_PAYLOAD)
    assert r_low.status_code == 200
    assert r_low.json()["risk_level"] == "Low"

    assert r_high.json()["risk_percent"] > r_low.json()["risk_percent"]


def test_predict_persists_and_risk_latest_reflects_it(client):
    headers = _auth_headers(client, "jill@example.com", "password1")
    client.post("/predict", headers=headers, json=HIGH_RISK_PAYLOAD)

    r = client.get("/risk-latest", headers=headers)
    assert r.status_code == 200
    assert r.json()["risk_level"] in ("Moderate", "High")


def test_risk_latest_is_null_when_no_checks_yet(client):
    headers = _auth_headers(client, "noor@example.com", "password1")
    r = client.get("/risk-latest", headers=headers)
    assert r.status_code == 200
    assert r.json() is None


def test_predict_requires_auth(client):
    r = client.post("/predict", json=HIGH_RISK_PAYLOAD)
    assert r.status_code == 401


# ---------- Recommendations ----------
def test_recommendations_reflect_profile_and_logs(client):
    headers = _auth_headers(client, "kate@example.com", "password1")
    client.put("/profile", headers=headers, json={
        "age": 30, "height_cm": 160, "weight_kg": 82, "family_history": True
    })
    for i in range(3):
        client.post("/daily-log", headers=headers, json={
            "log_date": f"2026-09-0{i+1}", "weight_kg": 82, "sleep_hours": 5,
            "water_glasses": 3, "exercised": False, "mood": "low",
            "symptoms": ["Irregular cycle"],
        })

    r = client.get("/recommendations", headers=headers)
    assert r.status_code == 200
    body = r.json()
    assert body["based_on"]["family_history"] is True
    assert len(body["items"]) >= 3


def test_recommendations_fallback_when_no_data(client):
    headers = _auth_headers(client, "liam@example.com", "password1")
    r = client.get("/recommendations", headers=headers)
    assert r.status_code == 200
    assert len(r.json()["items"]) >= 1
