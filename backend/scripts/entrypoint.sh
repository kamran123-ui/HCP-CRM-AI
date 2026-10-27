#!/usr/bin/env sh
set -e

echo "Waiting for database..."
python - << 'PYEOF'
import time, sys
from sqlalchemy import create_engine
from app.core.config import settings

for attempt in range(30):
    try:
        create_engine(settings.DATABASE_URL).connect().close()
        print("Database is ready.")
        sys.exit(0)
    except Exception as e:
        print(f"DB not ready yet ({attempt+1}/30): {e}")
        time.sleep(2)
sys.exit(1)
PYEOF

python -m app.db.init_db

exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers ${UVICORN_WORKERS:-2}
