# Running EduNexus locally

Two processes:

1. Django (port 8000) — file storage, REST API, ingestion stub
2. Vite (port 5173) — React SPA, proxies `/api` and `/media` to Django

## 1. Backend

From `EduNexus/EduNexus/` (the folder with `manage.py`):

```powershell
# One-time
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Each time
python manage.py migrate
python manage.py runserver 8000
```

### Production Firebase verification (optional)

Drop a Firebase Admin SDK service-account JSON somewhere outside the repo and:

```powershell
$env:FIREBASE_CREDENTIALS_PATH = "C:\path\to\service-account.json"
python manage.py runserver 8000
```

Without `FIREBASE_CREDENTIALS_PATH`, the DRF auth backend treats requests as anonymous so the SPA still works end-to-end in dev.

## 2. Frontend

From `EduNexus/EduNexus/frontend/`:

```powershell
npm install
copy .env.example .env.local   # fill in Firebase web app config
npm run dev
```

Open <http://localhost:5173>.

## What's wired

- `/login`, `/signup` — Firebase Auth (client side)
- `/` (Dashboard) — pulls `GET /api/files/`
- `/upload` — `POST /api/files/upload/` then subscribes to `GET /api/files/:id/events/` (SSE)
- `/search` — debounced autocomplete via `GET /api/search/suggest/`, hybrid results via `GET /api/search/?q=…`


The SPA, REST layer, and data flow are all real; the things marked stubbed have the right shape so swapping them for Celery / pgvector / firebase-admin later is a localized change.
