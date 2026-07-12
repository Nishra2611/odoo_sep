# TransitOps — Frontend

Enterprise fleet operations console for TransitOps. React 18 + TypeScript + Vite + Tailwind CSS,
built against the existing TransitOps REST API (currently running on mock data until wired up —
see **Connecting to the real backend** below).

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS (hand-built component kit in `src/components/ui`, shadcn-style — no CLI dependency)
- React Router v6 (role-based route guarding)
- Recharts (analytics charts)
- Zod (client-side form validation, mirrors backend Zod schemas)
- Lucide (icons)

## Getting started

```bash
cd transitops-frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Sign in with any of the demo accounts shown on the
login screen (also listed below) — auth currently runs against an in-memory mock, so any of
the four role accounts will work without a backend running.

| Role | Email | Password |
|---|---|---|
| Fleet Manager | manager@transitops.io | demo1234 |
| Dispatcher | dispatcher@transitops.io | demo1234 |
| Safety Officer | safety@transitops.io | demo1234 |
| Financial Analyst | finance@transitops.io | demo1234 |

## Project structure

```
src/
  components/
    ui/          reusable primitives — Button, DataTable, Modal, Drawer, KpiCard, charts, etc.
    layout/       AppShell, Sidebar, Topbar, OpsTicker, ProtectedRoute
  context/         AuthContext, ThemeContext, ToastContext
  lib/             constants.ts (nav + role config), mockData.ts (seeded demo dataset), utils.ts
  pages/
    auth/          Login, Forgot password
    fleet/         Vehicle list, add/edit form
    drivers/       Driver roster, profile drawer, add/edit form
    trips/         Kanban dispatch board, trip creation drawer
    maintenance/   Work orders, service history, cost analytics
    safety/        Incidents, violations, compliance documents
    finance/       Fuel logs (with anomaly flags), expenses
    analytics/     Fleet-wide charts
    settings/      Profile, security, notifications, RBAC matrix, audit log, integrations
    profile/       Account overview
  types/           Shared TypeScript interfaces mirroring the Prisma schema
```

Every page exists exactly once — there are no duplicate routes or parallel implementations of
the same screen.

## Design system

- **Ink** (`#10151F`) — sidebar / topbar chrome, primary buttons
- **Signal** (`#F5A623`) — primary accent, used sparingly for calls to action and the ops ticker
- **Route** (`#2F6FED`) / **Go** (`#2FB67C`) / **Alert** (`#E5484D`) — status semantics across
  vehicles, drivers, trips, maintenance and incidents
- Type: **Space Grotesk** (display), **Inter** (body), **IBM Plex Mono** (IDs, odometer, currency,
  the ops ticker)
- Signature element: the dark "ops ticker" strip under the topbar — a live, scrolling status line
  (compliance alerts, in-shop vehicles, delayed trips, highest-risk vehicle) styled after transit
  departures boards, reinforcing that this is an operations console, not a generic CRUD app.

Dark/light theme, keyboard-accessible focus rings, and reduced-motion support are all wired up
globally in `src/index.css`.

## What's implemented vs. mocked

- **Fully working (client-side)**: search, filters, sorting, pagination, CRUD forms with Zod
  validation, role-based navigation and route guarding, the trips Kanban board with drag-and-drop
  and **live dispatch validation** (vehicle/driver eligibility, license expiry, cargo vs. capacity
  — mirrors the backend's `tripService.ts` rules), maintenance scheduling that flips vehicle
  status to `IN_SHOP`, fuel anomaly flags, compliance expiry tracking, an audit log viewer, dark
  mode, command palette (`Cmd/Ctrl+K`), toasts, confirm dialogs, file upload (drag & drop).
- **Mocked, ready to be swapped for real calls**: all data currently comes from
  `src/lib/mockData.ts` (a seeded, deterministic dataset — vehicles, drivers, trips, maintenance,
  incidents, compliance docs, fuel logs, expenses, audit entries). Auth in `AuthContext.tsx`
  simulates the `/api/auth/login` response shape but doesn't call the network yet.

## Connecting to the real backend

1. Set an API base URL, e.g. add `VITE_API_URL=http://localhost:4000/api` to a `.env` file.
2. Replace the mock reads in each page (`VEHICLES`, `DRIVERS`, `TRIPS`, etc. from
   `src/lib/mockData.ts`) with `fetch`/`axios` calls to the matching endpoint
   (`GET /api/vehicles`, `GET /api/drivers`, `GET /api/trips`, …), keeping the same TypeScript
   shapes in `src/types/index.ts` — they were written to mirror the Prisma models directly.
3. Replace `AuthContext.login` with a real call to `POST /api/auth/login`, store the returned
   JWT (access + refresh) instead of the mock session object, and attach it as an
   `Authorization: Bearer <token>` header on every subsequent request.
4. The trip dispatch validation in `TripsKanbanPage.tsx` and `TripFormDrawer.tsx` is duplicated
   client-side for instant feedback — keep the backend `tripValidator.ts` as the source of truth
   and treat any client-side rejection as optimistic UI, not a substitute for server validation.

## Verifying everything works

### Frontend

```bash
cd transitops-frontend
npm install
npm run dev        # starts the dev server on http://localhost:5173
npm run build       # type-checks (tsc -b) and produces a production build in dist/
npm run preview     # serves the production build locally to sanity-check it
```

If `npm run build` fails on a type error, run `npm run lint` for more detail on the offending file.

### Backend (TransitOps API)

From the backend project root:

```bash
npm install
npx prisma migrate deploy        # apply migrations
npx prisma db seed               # load demo data (valid + intentionally-invalid records)
npm run dev                       # or: npm start, depending on your package.json script name
```

Quick manual checks once it's running (replace the port if different):

```bash
# Health / login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@transitops.io","password":"demo1234"}'

# Vehicles list (use the accessToken from the login response above)
curl http://localhost:4000/api/vehicles \
  -H "Authorization: Bearer <accessToken>"

# Dashboard KPIs
curl http://localhost:4000/api/analytics/dashboard \
  -H "Authorization: Bearer <accessToken>"

# Attempt an invalid dispatch (expired license / retired vehicle from seed data) —
# should return a 4xx with the specific validator rejection reason, not a 500
curl -X PATCH http://localhost:4000/api/trips/<tripId>/dispatch \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"<retiredVehicleId>","driverId":"<validDriverId>"}'

# Run the Jest suite (trip validator, auth, email, location APIs)
npm test
```

If everything above returns `200`/`4xx-as-expected` instead of `500`s, the API and validation
engine are wired up correctly and the frontend can be pointed at it.
