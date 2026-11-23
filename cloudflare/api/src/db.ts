import { PrismaClient } from '@prisma/client';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import type { Env } from './env';

// Prisma on Workers cannot use the default query engine (it is a native
// binary). Instead the Neon HTTP driver (PrismaNeonHTTP) talks to Postgres
// over HTTPS (fetch), and the Prisma driver adapter runs every query
// through it. There is no TCP connection pool to manage: each query is one
// HTTPS request to Neon, so cold starts stay fast and there is nothing to
// close. (The Pool/WebSocket variant, PrismaNeon, needs `ws` and is not
// used here.)
//
// The client is created once per isolate and reused across requests; it is
// recreated only if DATABASE_URL changes. The schema is unchanged from the
// Express version (apps/api/prisma/schema.prisma in the Cloud Run prep
// pack); only the runtime driver differs.
let cached: { url: string; client: PrismaClient } | undefined;

export function getPrisma(env: Env): PrismaClient {
  if (!env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set. Set it with `wrangler secret put DATABASE_URL`.',
    );
  }
  if (!cached || cached.url !== env.DATABASE_URL) {
    const adapter = new PrismaNeonHTTP(env.DATABASE_URL, {});
    cached = {
      url: env.DATABASE_URL,
      client: new PrismaClient({ adapter, log: ['error'] }),
    };
  }
  return cached.client;
}
