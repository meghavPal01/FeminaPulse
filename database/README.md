# Database — MongoDB Atlas

Femina Pulse persists data in **MongoDB Atlas**, via Motor (async driver)
and Beanie (ODM). Four collections, created automatically by Beanie on
first connection — no manual setup needed beyond having a cluster and
connection string (see `backend/README.md` → "MongoDB Atlas setup").

## Collections

**users**
| field          | type      | notes                    |
|----------------|-----------|--------------------------|
| _id            | ObjectId  | primary key              |
| name           | string    |                          |
| email          | string    | unique index             |
| password_hash  | string    | bcrypt hash, never plaintext |
| created_at     | datetime  |                          |

**profiles** (one per user)
| field           | type     | notes                  |
|-----------------|----------|------------------------|
| _id             | ObjectId | primary key            |
| user_id         | ObjectId | references users._id   |
| age             | int      | nullable               |
| height_cm       | float    | nullable               |
| weight_kg       | float    | nullable               |
| family_history  | bool     |                        |

**daily_logs** (many per user)
| field          | type     | notes                        |
|----------------|----------|------------------------------|
| _id            | ObjectId | primary key                  |
| user_id        | ObjectId | references users._id         |
| log_date       | date     |                              |
| weight_kg      | float    |                              |
| sleep_hours    | float    |                              |
| water_glasses  | float    |                              |
| exercised      | bool     |                              |
| mood           | string   | great / okay / low / anxious |
| symptoms       | string[] |                              |

**risk_checks** (history of every risk check run)
| field         | type     | notes                          |
|---------------|----------|---------------------------------|
| _id           | ObjectId | primary key                     |
| user_id       | ObjectId | references users._id            |
| created_at    | datetime |                                 |
| risk_percent  | float    |                                 |
| risk_level    | string   | Low / Moderate / High           |
| bmi           | float    |                                 |
| reasons       | string[] |                                 |

## Why Beanie/Motor instead of raw PyMongo

Beanie gives us typed Document classes (so `Profile.height_cm` is a real
Pydantic field with validation) while still writing native async MongoDB
queries under the hood — a good middle ground between "no structure" and
a heavy ORM.

## Local testing without a real cluster

`backend/test_backend.py` runs the full test suite against
**mongomock-motor**, an in-memory MongoDB-compatible mock, so tests need
no network access and never touch real data. Swapping to a live Atlas
cluster for the actual app is purely the `MONGODB_URI` environment
variable — no code changes.
