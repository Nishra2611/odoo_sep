# TransitOps — Backend API

Smart Transport Operations Platform — backend only (Node.js + Express + TypeScript + Prisma + PostgreSQL).

This package contains **only the backend**, plus a minimal single-file HTML test
client (`minimal-test-client/index.html`) for exercising the API before/without
a real frontend. It is not the product UI.

## Stack
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT auth (jsonwebtoken + bcryptjs)
- Zod for request validation
- Jest for unit tests (business-rule engine)

## Setup

```bash
npm install
cp .env.example .env       # fill in DATABASE_URL and JWT_SECRET
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

The API will run at `http://localhost:4000`. Health check: `GET /health`.

## Demo login (after seeding)
| Role | Email | Password |
|---|---|---|
| Fleet Manager | manager@transitops.dev | password123 |
| Safety Officer | safety@transitops.dev | password123 |
| Financial Analyst | finance@transitops.dev | password123 |

The seed also creates 4 vehicles and 4 drivers deliberately covering every
edge case (expired license, suspended driver, in-shop vehicle, retired
vehicle) so the business-rule engine has something real to reject in a demo.

## Testing the API without a frontend
Open `minimal-test-client/index.html` directly in a browser (or serve it with
any static file server) and point it at your running backend. It can log in,
list vehicles, view dashboard KPIs, list trips, and attempt to dispatch a
trip — enough to prove every business rule live.

## Running tests
```bash
npm test
```
Covers the core dispatch business rules: vehicle status, driver status,
license expiry, and cargo-capacity validation.

## Folder structure
```
src/
  config/db.ts          # shared Prisma client
  middleware/            # authenticate, authorize (RBAC), errorHandler
  validators/            # Zod schemas per entity
  services/              # business logic incl. the trip rule engine
  controllers/           # thin HTTP layer calling services
  routes/                # Express routers, role-gated per endpoint
  tests/                 # Jest unit tests
prisma/
  schema.prisma          # full data model
  seed.ts                # demo data seeding script
minimal-test-client/
  index.html              # bare-bones API tester, NOT the product frontend
```

## Business rules enforced (server-side, non-negotiable)
- Unique vehicle registration numbers and driver license numbers (DB-level `@unique`)
- A trip cannot be dispatched if the vehicle is `IN_SHOP` or `RETIRED`
- A trip cannot be dispatched if the driver is `SUSPENDED`, `INACTIVE`, or has an expired license
- A vehicle or driver already on a `DISPATCHED` trip cannot be assigned to another
- Cargo weight cannot exceed the vehicle's load capacity
- All status transitions (dispatch/complete/cancel/maintenance) happen inside
  a single Prisma `$transaction`, so concurrent requests can never leave the
  system in an inconsistent state (e.g. double-booking a vehicle)

## What's intentionally NOT here
- No frontend application (React app is a separate package, built separately)
- No AI service (predictive risk scoring / NL summary) — those are optional
  bonus additions layered on top once the core API is solid; see the main
  project plan for how they'd be wired in via a small FastAPI microservice
  and a single Claude API call respectively.
