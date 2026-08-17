# ILRAS — Deployment Guide (Sprint 11)

## What this covers

Deploying `ilras-backend` and `ilras-frontend` to Render, using GitHub
for source control, per Constitution Section 8's tech stack.

This gets you a real, publicly reachable demo. Read "Known limitations
of this setup" below before treating it as production-ready — it
isn't yet, and pretending otherwise would misrepresent what FR-07
(audit trail) is supposed to guarantee.

---

## 1. Push to GitHub

```bash
cd ilras           # the folder containing both ilras-backend/ and ilras-frontend/
git init
git add .
git commit -m "ILRAS through Sprint 10"
```

Create a new repo on GitHub, then:

```bash
git remote add origin https://github.com/<your-username>/ilras.git
git branch -M main
git push -u origin main
```

## 2. Deploy via Render Blueprint

The `render.yaml` I've prepared defines both services as one unit.

1. Copy `render.yaml` into the root of your repo (same level as
   `ilras-backend/` and `ilras-frontend/`), commit, and push.
2. Go to the [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
3. Connect your GitHub account if you haven't already, then select
   your `ilras` repo.
4. Render reads `render.yaml` and shows both services
   (`ilras-backend`, `ilras-frontend`) for you to review.
5. Click **Apply** — Render builds and deploys both.

First deploy takes a few minutes (backend installs Python deps and
seeds the database; frontend runs `npm install && npm run build`).

## 3. Verify

- Backend: visit `https://ilras-backend.onrender.com/docs` — you
  should see the FastAPI interactive docs.
- Frontend: visit `https://ilras-frontend.onrender.com` — you should
  see the Dasbor with 3 district cards.
- If the dashboard shows "Gagal memuat data" (failed to load): check
  that `VITE_API_BASE_URL` on the frontend service and
  `ALLOWED_ORIGINS` on the backend service both point at each other's
  actual `.onrender.com` URLs — Render assigns these on first deploy,
  so the placeholder values in `render.yaml` may need a one-time
  manual correction in the Render dashboard after the first deploy.

## 4. Custom domain (optional)

Render Dashboard → your frontend service → **Settings** → **Custom Domains**.
If you do this, also add the new domain to the backend's
`ALLOWED_ORIGINS` env var, or the frontend will be CORS-blocked from
calling the API.

---

## Known limitations of this setup — read before relying on it

**Audit trail does not persist reliably.** The backend's build command
runs `python -m app.seed`, which drops and recreates all tables
(including `audit_log`) on every deploy. Combined with Render's free
tier reclaiming disk on spin-down, this means the audit trail
(Sprint 0's FR-07) does not actually accumulate a durable history in
this configuration — it resets far more often than "every score
calculation, permanently" implies. This is a real gap between what
the audit trail is supposed to guarantee and what this deployment
actually delivers. Don't present this deployment as satisfying FR-07
to a government stakeholder without fixing this first.

**No authentication.** Sprint 0 flagged government SSO as an open
question that was never answered (Constitution's own Section 0 review
noted this explicitly). Every endpoint is public. Do not deploy
publicly with real (non-illustrative) data until this is resolved.

**SQLite is a pilot-stage choice, not the intended production
database.** Constitution Section 8 already names PostgreSQL as future
work. Render offers managed PostgreSQL directly — the path to fix
both the persistence and audit-trail problems above is the same fix:

```yaml
# add to render.yaml
databases:
  - name: ilras-db
    plan: free

# then on the backend service:
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: ilras-db
          property: connectionString
```

...and update `app/database.py` to read `DATABASE_URL` from the
environment instead of hardcoding `sqlite:///./ilras.db`, and stop
dropping tables on every build once real data needs to persist.

**Free tier cold starts.** Render's free web services spin down after
15 minutes of inactivity and take ~30-60s to wake on the next request.
Fine for a demo; noticeable and worth upgrading to a paid plan before
showing this to time-sensitive stakeholders (e.g. a live government
presentation).
