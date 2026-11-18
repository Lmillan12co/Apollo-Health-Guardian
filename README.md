# Apollo Health Guardian

**Epilepsy care and monitoring for patients and caregivers.**

Apollo Health Guardian helps families living with epilepsy keep track of what
matters: seizure events, medication schedules, and a fast SOS alert that
reaches the patient's caregivers when help is needed.

> Apollo Health Guardian is a support and monitoring tool. It does not replace
> medical care. In a real emergency, always call your local emergency number first.

## What it does (MVP — November 2026)

- **Accounts & roles** — register and sign in (JWT). Roles: patient, caregiver,
  doctor, admin. Passwords are hashed with bcrypt.
- **Patients** — create patients and see their full picture in one place.
- **Caregivers** — link caregivers to a patient.
- **Medications** — add a medication with dosage and schedule; list a patient's
  medications.
- **Seizure log** — log a seizure event (when, how long, notes) and list a
  patient's history.
- **SOS alerts** — one tap creates an SOS alert for a patient; caregivers can
  acknowledge it. Seizure logging also raises a `SEIZURE_DETECTED` alert.

## Status

The API is working end to end (verified locally, see `VERIFICACION.md` in the
contest-prep folder). The web app (`apps/web`) and the mobile app
(`apps/mobile`) are still empty scaffolds — the `demo/` page in this repo is a
standalone demo front end that talks to the live API. Real-time notifications
and device integrations are on the roadmap (`docs/roadmap.md`).

## Architecture

```
Caregiver / patient
  │  (browser or mobile app — HTTPS, JSON)
  ▼
Apollo API  —  Node.js 20 + TypeScript + Express
  │  Prisma Client (JWT auth with bcrypt, role checks)
  ▼
PostgreSQL 16  —  patients, caregivers, medications, seizure events, alerts
```

The API is a single Cloud Run service. It listens on `$PORT` (injected by
Cloud Run, 3001 by default locally) and exposes `GET /health` for health
checks. The database schema lives in `apps/api/prisma/` and migrations run
automatically when the container starts (`prisma migrate deploy`).

For the contest: the entry is built on Google Cloud Run and launched on
Product Hunt — see `PRODUCT-HUNT-LAUNCH.md`.

## Project structure

```
apps/
  api/            Express + TypeScript API (the deployable service)
    src/          routes, services, auth, db client
    prisma/       schema.prisma + migrations
    Dockerfile    Cloud Run image (multi-stage)
    entrypoint.sh runs migrations, then starts the API
  web/            Next.js web app (scaffold — not built yet)
  mobile/         React Native + Expo app (scaffold — not built yet)
packages/
  shared/         shared code (scaffold — not built yet)
database/
  prisma/         OLD schema location — see note below
demo/
  index.html      standalone demo front end (works against the live API)
docs/
  architecture.md roadmap.md security.md
cloudbuild.yaml   Cloud Build → Artifact Registry → Cloud Run
```

> **Note on the schema move:** the Prisma schema used to live in
> `database/prisma/schema.prisma`, but Prisma's client generator cannot
> resolve `@prisma/client` from there in this pnpm monorepo, so `prisma
> generate` failed. The schema now lives in `apps/api/prisma/schema.prisma`
> (same content). Delete `database/prisma/` once you have verified the new
> location — do not keep two copies of the schema.

## Run locally

Requirements: Node.js 20+, pnpm 9, PostgreSQL 16 (or `docker compose`).

```bash
# 1. Install dependencies (from the repo root)
pnpm install

# 2. Start PostgreSQL (uses docker/docker-compose.yml)
docker compose -f docker/docker-compose.yml up -d

# 3. Configure the API
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env: set DATABASE_URL and JWT_SECRET (long random secret).

# 4. Create the tables
pnpm --filter @apollo/api prisma:migrate
# (or: pnpm --filter @apollo/api exec prisma migrate dev --name init)

# 5. Start the API
pnpm --filter @apollo/api dev
# API on http://localhost:3001 — try: curl http://localhost:3001/health
```

## Environment variables

| Variable         | Required | Description                                              |
| ---------------- | -------- | -------------------------------------------------------- |
| `PORT`           | No       | Port to listen on. Cloud Run injects it (default 3001).  |
| `DATABASE_URL`   | Yes      | PostgreSQL connection string (Prisma format).            |
| `JWT_SECRET`     | Yes      | Long random secret for signing JWTs. Never commit it.    |
| `JWT_EXPIRES_IN` | No       | Token lifetime, e.g. `7d` (default `7d`).                |

## API endpoints

All `/api/*` routes except `/api/auth/*` and `/health` require a
`Authorization: Bearer <token>` header.

| Method | Path                              | Description                          |
| ------ | --------------------------------- | ------------------------------------ |
| GET    | `/health`                         | Health check → `{service, status}`   |
| POST   | `/api/auth/register`              | Create account (name, email, password, role) |
| POST   | `/api/auth/login`                 | Sign in → `{user, token}`            |
| GET    | `/api/users/profile`              | Current user (no password hash)      |
| GET    | `/api/patients`                   | List patients (with caregivers, medications) |
| POST   | `/api/patients`                   | Create a patient                     |
| GET    | `/api/patients/:id`               | Patient with caregivers, medications, seizures, alerts |
| POST   | `/api/caregivers`                 | Link a caregiver to a patient        |
| GET    | `/api/caregivers/patient/:patientId` | Caregivers of a patient           |
| POST   | `/api/medications`                | Add a medication                     |
| GET    | `/api/medications/patient/:patientId` | Medications of a patient          |
| DELETE | `/api/medications/:id`            | Delete a medication                  |
| POST   | `/api/seizures`                   | Log a seizure event                  |
| GET    | `/api/seizures/:patientId`        | Seizure history of a patient         |
| POST   | `/api/alerts/sos`                 | Create an SOS alert for a patient    |
| POST   | `/api/alerts`                     | Create an alert (`SOS`, `SEIZURE_DETECTED`, `MEDICATION_REMINDER`) |
| GET    | `/api/alerts/patient/:patientId`  | Alerts of a patient                  |
| POST   | `/api/alerts/:id/acknowledge`     | Mark an alert as acknowledged        |

## Deploy to Cloud Run

See `GUIA-DESPLIEGUE-CLOUD-RUN.md` (in Spanish) in the contest-prep folder:
create a hosted PostgreSQL database, set `DATABASE_URL` and `JWT_SECRET` as
Secret Manager secrets, then deploy with Cloud Build
(`gcloud builds submit --config cloudbuild.yaml .`) or with the `gcloud run
deploy` commands in the guide.

## Security notes

- Passwords are hashed with bcrypt (cost 10). The old placeholder
  (`hashed:${password}`) and the old base64 "token" were removed — never use them.
- JWTs are signed with `JWT_SECRET` (HS256) and expire (`JWT_EXPIRES_IN`).
- The API enables CORS for all origins by default (demo-friendly). Restrict
  `cors()` to your front-end origin before a public launch.
- Patient data is currently shared across accounts (no per-user scoping yet).
  Per-user scoping and audit logs are the next security steps.

## Product Hunt launch

Launch day: **Friday, November 20, 2026** — Product Hunt × Google Cloud Run,
"Build for Good". Launch copy, tagline, screenshots plan and checklist:
`PRODUCT-HUNT-LAUNCH.md`.

## License

Private project — all rights reserved (add a license file when you publish it).
