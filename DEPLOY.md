# Barbershopnearme — Deployment Guide
## Railway (Backend) + Vercel (Frontend) + SendGrid (Email)

---

## PART 1 — SENDGRID EMAIL SETUP

Do this first so emails work the moment you deploy.

### 1.1 Create a SendGrid account
Go to https://sendgrid.com → sign up free (100 emails/day free forever).

### 1.2 Verify your sender identity
- Dashboard → Settings → Sender Authentication
- Click **"Verify a Single Sender"**
- Use an email you control, e.g. `noreply@barbershopnearme.com` or your Gmail
- Check your inbox and click the verification link SendGrid sends you
- ⚠️ **Emails will not send until your sender is verified**

### 1.3 Create an API key
- Dashboard → Settings → API Keys → Create API Key
- Name: `barbershopnearme-production`
- Permission: **Full Access**
- Copy the key — you only see it once. Save it somewhere safe.

### 1.4 Your environment variables (needed in Railway)
```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DEFAULT_FROM_EMAIL=Barbershopnearme <noreply@YOURDOMAIN.com>
```
The `DEFAULT_FROM_EMAIL` must exactly match the verified sender email address.

---

## PART 2 — RAILWAY (Backend Django)

### 2.1 Create Railway account
Go to https://railway.app → sign up with GitHub.

### 2.2 Create a new project
- Click **"New Project"** → **"Deploy from GitHub repo"**
- Connect your GitHub account and select the `BarbershopNearMe` repository
- Railway auto-detects Python/Django from the `Procfile`

### 2.3 Add PostgreSQL database
- In your Railway project → click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
- Railway automatically sets `DATABASE_URL` in your service's environment — you don't need to copy it

### 2.4 Set environment variables in Railway
Click your web service → **"Variables"** tab → add each one:

```
SECRET_KEY=<generate a random 50-char string at https://djecrety.ir>
DEBUG=False
DATABASE_URL=<auto-set by Railway PostgreSQL plugin — skip this one>
FRONTEND_URL=https://YOUR-APP.vercel.app
BACKEND_URL=https://YOUR-APP.up.railway.app
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxx
DEFAULT_FROM_EMAIL=Barbershopnearme <noreply@yourdomain.com>
BARBER_INVITE_CODE=BSNM2026
TWILIO_ACCOUNT_SID=<optional — for SMS>
TWILIO_AUTH_TOKEN=<optional — for SMS>
TWILIO_FROM_NUMBER=<optional — for SMS>
STRIPE_SECRET_KEY=<optional — for online payments>
```

### 2.5 Set the root directory
- Railway service → Settings → **Source** → set **Root Directory** to `BACKEND`
- (Only needed if your repo has both frontend and backend at the root)

### 2.6 Deploy
- Railway auto-deploys on every push to your main branch
- First deploy runs: `python manage.py migrate` + `collectstatic` + starts gunicorn
- Watch the deploy log — look for "Booting Worker" to confirm success

### 2.7 Seed initial data (one time)
Once deployed, open Railway's terminal or run via the Railway CLI:
```bash
python manage.py seed_data
python manage.py make_admin
```

### 2.8 Get your Railway URL
- Service → Settings → **Domains** → copy the `.railway.app` URL
- Example: `https://barbershopnearme-backend.up.railway.app`
- Update `BACKEND_URL` in Railway env vars with this URL
- You'll also need this for Vercel's `VITE_API_BASE_URL`

---

## PART 3 — VERCEL (Frontend React)

### 3.1 Create Vercel account
Go to https://vercel.com → sign up with GitHub.

### 3.2 Import your project
- Dashboard → **"Add New Project"** → import your GitHub repo
- Framework Preset: **Vite**
- Root Directory: `barbershopnearme-frontend/barbershopnearme/frontend` (your frontend folder)
- Build Command: `npm run build`
- Output Directory: `dist`

### 3.3 Set environment variables in Vercel
Project → Settings → Environment Variables:

```
VITE_API_BASE_URL=https://YOUR-RAILWAY-APP.up.railway.app/api
```

Replace `YOUR-RAILWAY-APP` with your actual Railway URL from step 2.8.

### 3.4 Deploy
- Click **Deploy** — Vercel builds in ~60 seconds
- Your live URL will be something like `https://barbershopnearme.vercel.app`

### 3.5 Update Railway with your Vercel URL
Go back to Railway → Variables → update:
```
FRONTEND_URL=https://barbershopnearme.vercel.app
```
Then redeploy (or Railway auto-redeploys on env var change).

### 3.6 Update CORS in settings.py (if using custom domain)
If you use a custom domain on Vercel, add it to `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` in `config/settings.py` and push the change.

---

## PART 4 — EMAIL TRIGGERS (what gets sent and when)

Every email sends to the right person automatically — no manual action needed.

| Trigger | Who gets email | Subject |
|---------|---------------|---------|
| Client signs up | Client | ✂️ Welcome to Barbershopnearme |
| Barber signs up | Barber | Welcome to The Team ✂️ |
| Client books appointment | Client | ✅ Booking Confirmed — {service} |
| Client books appointment | Barber | 📅 New Booking — {client} at {time} |
| Client cancels | Barber | 🚫 Appointment Cancelled by {client} |
| Barber cancels | Client | ❌ Your Appointment Was Cancelled |
| Client requests reschedule | Client | ✓ Reschedule Request Received |
| Client requests reschedule | Barber | ↻ Reschedule Request — **has Approve/Decline buttons** |
| Barber approves reschedule | Client | ✅ Reschedule Approved |
| Barber declines reschedule | Client | ❌ Reschedule Declined — original appointment stands |
| Appointment reminder (24hr) | Client | ⏰ Reminder: {service} Tomorrow |

### How the reschedule approve/decline works
1. Client requests reschedule from their dashboard
2. Barber gets an email with two big buttons: **✓ Approve** and **✕ Decline**
3. Barber clicks either button → lands on `/reschedule?token=XXX&action=accept` or `reject`
4. Backend processes the token (one-time use, expires), updates the appointment
5. Client gets notified immediately by email with the outcome

---

## PART 5 — LOCAL DEVELOPMENT AFTER DEPLOYING

After deploying, your local `.env` should point to localhost:

**BACKEND `.env`:**
```
SECRET_KEY=barbershopnearme-local-dev-key
DEBUG=True
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/barbershopnearme
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
SENDGRID_API_KEY=SG.xxxx   ← real key even in dev, or leave blank to skip emails
DEFAULT_FROM_EMAIL=Barbershopnearme <noreply@yourdomain.com>
BARBER_INVITE_CODE=BSNM2026
```

**FRONTEND `.env`:**
```
VITE_API_BASE_URL=   ← leave blank — Vite proxy handles /api → localhost:8000
```

---

## PART 6 — CHECKLIST BEFORE GOING LIVE

- [ ] SendGrid sender verified
- [ ] SENDGRID_API_KEY set in Railway
- [ ] DEFAULT_FROM_EMAIL matches verified sender
- [ ] DATABASE_URL connected to Railway PostgreSQL
- [ ] SECRET_KEY is a long random string (not the dev default)
- [ ] DEBUG=False in Railway
- [ ] FRONTEND_URL set to your Vercel URL in Railway
- [ ] VITE_API_BASE_URL set to your Railway URL in Vercel
- [ ] `python manage.py seed_data` and `make_admin` run once on Railway
- [ ] Test email: hit `/api/test-email/` with `{"to": "your@email.com"}` — should arrive within 30s
- [ ] Test booking flow end-to-end in production
- [ ] Barber sets their hours in My Hours tab
- [ ] Barber connects Stripe (optional, for online payments)
