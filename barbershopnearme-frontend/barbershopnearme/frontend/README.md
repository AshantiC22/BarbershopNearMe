# Barbershopnearme — Frontend

Rubber hose noir barbershop site.
Built with: **React 18 + Vite 5 + Tailwind CSS v4**

---

## Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI components |
| Vite 5 | Dev server + build tool |
| Tailwind CSS v4 | Utility classes (via Vite plugin) |
| React Router v6 | Client-side routing |
| Axios | HTTP client → Spring Boot API |
| Prettier | Code formatting |
| ESLint | Linting |

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment (copy example, edit if needed)
cp .env.example .env

# 3. Start dev server (runs on http://localhost:5173)
npm run dev
```

The dev server proxies `/api` requests to `http://localhost:8080` (your Spring Boot backend).
You can develop the frontend without the backend running — the booking form will error gracefully.

---

## Folder Structure

```
src/
├── components/
│   ├── ui/           # Reusable base components (LoadingScreen, buttons, etc.)
│   ├── layout/       # Navbar, Footer — appear on every page
│   └── sections/     # Page sections: Hero, Ticker, Services, Barbers, Booking
├── pages/            # Route-level components (Home, NotFound)
├── hooks/            # Custom React hooks (useReveal, useScrollPosition)
├── services/         # api.js — all Axios calls to the backend
├── utils/            # Pure helper functions (no React)
├── styles/           # index.css — design tokens + global styles
└── assets/           # Static images, SVGs, fonts
```

---

## Design System

3 colours, 2 fonts, 8pt spacing — enforced via CSS custom properties in `src/styles/index.css`.

| Token | Value |
|-------|-------|
| `--color-ink` | `#050403` (near black) |
| `--color-bone` | `#E8DFC8` (warm white) |
| `--color-blood` | `#8B1A1A` (dark red) |
| `--font-display` | Bebas Neue |
| `--font-body` | Courier Prime |
| `--font-rubber` | Boogaloo (loading screen) |

---

## Scripts

```bash
npm run dev      # Dev server with HMR
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
npm run lint     # ESLint check
npm run format   # Prettier format
```

---

## Connecting to the Backend

When your Spring Boot API is running, the Vite dev proxy (`vite.config.js`) forwards:
```
/api/* → http://localhost:8080/*
```

For production, set `VITE_API_BASE_URL` in your hosting environment.

All API calls live in `src/services/api.js`. Add new endpoints there — never call `fetch` or `axios` directly inside components.

---

## Next Steps

- [ ] Wire `Services` and `Barbers` sections to live API data (replace static arrays)
- [ ] Add React Query for data fetching + caching
- [ ] Add form validation with React Hook Form
- [ ] Deploy to Vercel (connect GitHub repo, it auto-detects Vite)
