import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getCorsOrigins } from './env';
import { authRoutes } from './auth/auth.routes';
import { usersRoutes } from './users/users.routes';
import { patientsRoutes } from './patients/patients.routes';
import { seizuresRoutes } from './seizures/seizures.routes';
import { medicationsRoutes } from './medications/medications.routes';
import { alertsRoutes } from './alerts/alerts.routes';
import { caregiversRoutes } from './caregivers/caregivers.routes';
import type { AppEnv } from './hono-types';

// Apollo API on Cloudflare Workers (Hono). Same routes, same responses and
// same status codes as the Express version in the Cloud Run prep pack —
// only the runtime changed. There is no app.listen() here: Cloudflare
// calls the exported fetch handler. Secrets (DATABASE_URL, JWT_SECRET)
// arrive as bindings from `wrangler secret put`; see .env.example and
// ../README.md. Missing secrets surface as 500s with the cause logged,
// instead of killing the process at boot (Workers have no boot to kill).

const app = new Hono<AppEnv>();

// CORS is allow-listed from CORS_ORIGIN (comma-separated). The demo page
// served by this same Worker (public/index.html) needs no entry here
// (same origin). With CORS_ORIGIN unset, no cross-origin browser call is
// allowed at all (safest default). Preflight OPTIONS is answered by the
// cors middleware itself with a 204.
app.use(
  '*',
  cors({
    origin: (origin, c) => {
      const allowed = getCorsOrigins(c.env);
      return allowed.includes(origin) ? origin : null;
    },
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  }),
);

// Parse JSON bodies once, like Express' express.json().
// Empty body => {}. Malformed JSON => 400 (Express behaves the same).
app.use(async (c, next) => {
  if (c.req.method === 'POST' || c.req.method === 'PUT' || c.req.method === 'PATCH') {
    const contentType = c.req.header('content-type') ?? '';
    if (contentType.includes('application/json')) {
      const text = await c.req.text();
      if (text.trim()) {
        try {
          c.set('body', JSON.parse(text));
        } catch {
          return c.json({ message: 'Invalid JSON' }, 400);
        }
      } else {
        c.set('body', {});
      }
    } else {
      c.set('body', {});
    }
  }
  await next();
});

app.get('/health', (c) => {
  return c.json({
    service: 'apollo-api',
    status: 'ok',
  });
});

app.route('/api/auth', authRoutes);
app.route('/api/users', usersRoutes);
app.route('/api/patients', patientsRoutes);
app.route('/api/seizures', seizuresRoutes);
app.route('/api/medications', medicationsRoutes);
app.route('/api/alerts', alertsRoutes);
app.route('/api/caregivers', caregiversRoutes);

// JSON 404 for unknown routes (instead of Hono's default text 404).
// The demo page itself is served by Workers Static Assets (public/),
// so a browser that hits "/" never reaches this handler.
app.notFound((c) => {
  return c.json({ message: 'Not found' }, 404);
});

// Any unexpected error becomes a JSON 500 (Express behaved the same).
// The cause is logged to the Worker's console for `wrangler tail`.
app.onError((err, c) => {
  console.error(err);
  return c.json({ message: 'Internal server error' }, 500);
});

export default app;
