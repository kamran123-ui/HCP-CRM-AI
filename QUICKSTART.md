# Quickstart

## Option A — Docker (recommended, ~2 minutes)

**Requirements:** Docker + Docker Compose.

```bash
git clone <your-repo-url> hcp-crm
cd hcp-crm

# 1. Configure environment
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Add your Groq API key to backend/.env
#    Get one free at https://console.groq.com/keys
#    GROQ_API_KEY=gsk_...

# 3. Boot everything
docker compose up --build
```

Then open:

- **App:** http://localhost:5173
- **API docs:** http://localhost:8000/api/docs

Log in with the seeded demo account: `rep@demo.io` / `Demo@1234`, or sign up your own.

To stop: `docker compose down` (add `-v` to also wipe the database volume).

---

## Option B — Manual local development

### 1. Database

Run Postgres locally or via Docker only:

```bash
docker run --name hcp_crm_db -e POSTGRES_USER=hcp_admin -e POSTGRES_PASSWORD=change_me \
  -e POSTGRES_DB=hcp_crm -p 5432:5432 -d postgres:16-alpine
```

### 2. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# edit .env: set DATABASE_URL to postgresql+psycopg2://hcp_admin:change_me@localhost:5432/hcp_crm
# set GROQ_API_KEY

python -m app.db.init_db      # creates tables + seeds demo data
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env          # VITE_API_BASE_URL=http://localhost:8000/api/v1
npm run dev
```

Open http://localhost:5173.

---

## Getting a Groq API Key

1. Go to https://console.groq.com/keys
2. Create a new API key
3. Paste it into `backend/.env` as `GROQ_API_KEY`
4. Model used: `gemma2-9b-it` (configurable via `GROQ_MODEL` in `.env`)

---

## Common Issues

| Symptom | Fix |
|---|---|
| `backend` container keeps restarting | Check `docker compose logs backend` — usually a missing/invalid `GROQ_API_KEY` or DB not ready yet (entrypoint retries automatically for ~60s). |
| Frontend shows network errors | Confirm `VITE_API_BASE_URL` matches where the backend is actually reachable (`/api/v1` when served via the nginx proxy in Docker, `http://localhost:8000/api/v1` in manual dev). |
| 401 on every request | Token expired or missing — log out and back in. |
| Chat replies are generic / tools never fire | Verify `GROQ_API_KEY` is valid and the model name in `.env` matches an available Groq model. |
