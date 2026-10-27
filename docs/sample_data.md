# Sample Data

Seeded automatically on first backend startup by `app/db/init_db.py::seed_db()`
(skipped if any user already exists, so it's safe to restart).

## Demo user

| Field | Value |
|---|---|
| Email | rep@demo.io |
| Password | Demo@1234 |
| Role | field_rep |

## Demo HCPs

| Name | Specialty | Institution | Tier |
|---|---|---|---|
| Dr. Ritu Sharma | Oncology | AIIMS Delhi | A |
| Dr. Karan Mehta | Cardiology | Fortis Hospital | B |
| Dr. Neha Kapoor | Endocrinology | Apollo Hospitals | A |

## Example chat prompts to try

- "Met Dr. Sharma today, discussed Product X efficacy data, she seemed positive and I left an OncoBoost Phase III PDF."
- "Change the outcome on that last interaction to 'agreed to a follow-up call next week'."
- "What's my interaction history with Dr. Mehta?"
- "Summarize this note: [paste a long voice-note transcript]"
