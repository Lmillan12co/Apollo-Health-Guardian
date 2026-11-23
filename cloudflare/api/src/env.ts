// Environment bindings for the Cloudflare Worker.
//
// Workers have no process.env: values come from wrangler.toml [vars]
// (non-secret) and `wrangler secret put` (secrets). See .env.example and
// ../README.md. Never put real values in this repo.
export interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
  CORS_ORIGIN?: string;
  JWT_EXPIRES_IN?: string;
}

// CORS is allow-listed: only the origins in CORS_ORIGIN (comma-separated)
// may call the API from a browser. The demo page served by this same Worker
// needs no entry (same origin). With CORS_ORIGIN unset, no cross-origin
// browser call is allowed at all (safest default).
export function getCorsOrigins(env: Env): string[] {
  return (env.CORS_ORIGIN ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

// Same validation as the Express version: only "<number><unit>" shapes
// ("7d", "24h", "30m"...) are accepted; anything else falls back to "7d".
export function getJwtExpiresIn(env: Env): string {
  const raw = env.JWT_EXPIRES_IN ?? '7d';
  return /^\d+[smhdw]$/.test(raw) ? raw : '7d';
}
