import type { AuthUser } from './auth/auth.types';
import type { Env } from './env';

// Shared Hono app type: Bindings are the Worker environment, Variables are
// the per-request values set by middleware (parsed JSON body, authed user).
export interface AppEnv {
  Bindings: Env;
  Variables: {
    body?: unknown;
    user?: AuthUser;
  };
}
