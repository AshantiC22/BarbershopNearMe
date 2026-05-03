# Barbershopnearme — Backend

Django REST Framework + PostgreSQL backend.
Adapted from the HeadzUp Barbershop template.

## Quick Start (Local)

### 1. Create a virtual environment
```bash
cd BACKEND
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Set up environment variables
```bash
cp .env.example .env
# Edit .env — set DATABASE_URL, SECRET_KEY, etc.
```

### 4. Create the PostgreSQL database
In pgAdmin or psql:
```sql
CREATE DATABASE barbershopnearme;
```

### 5. Run migrations + seed data
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py seed_data
python manage.py make_admin
```

### 6. Start the server
```bash
python manage.py runserver
```
Backend runs at **http://localhost:8000**

---

## Key Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/register/` | Sign up — `{ username, email, password }` |
| POST | `/api/token/` | Login — `{ username, password }` → `{ access, refresh }` |
| POST | `/api/token/refresh/` | Refresh JWT |
| GET | `/api/barbers/` | List all barbers |
| GET | `/api/services/` | List all services |
| GET | `/api/available-slots/?barber=1&date=2025-06-01` | Open time slots |
| POST | `/api/appointments/` | Book appointment (auth required) |
| GET | `/api/appointments/?my=true` | My appointments (auth required) |

---

## Deploy to Railway

1. Push BACKEND folder to a GitHub repo
2. New Railway project → Deploy from GitHub
3. Add PostgreSQL plugin → it auto-sets `DATABASE_URL`
4. Set env vars from `.env.example` in Railway dashboard
5. Railway runs `start.sh` automatically

---

## Environment Variables

See `.env.example` for the full list.
Minimum required to run locally:
- `SECRET_KEY`
- `DATABASE_URL`
- `FRONTEND_URL` (for CORS)
