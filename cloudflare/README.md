# Apollo Health Guardian — Cloudflare Workers

La app completa de Apollo (API + página demo) preparada para desplegarse en
Cloudflare Workers, plan gratis, sin tarjeta. **Nada está desplegado todavía:**
este folder solo deja todo listo. La ruta de Cloud Run no se tocó: el prep
pack original sigue intacto en `~/workspace/your_files/apollo-contest-prep/`
y el repo de GitHub tampoco se tocó.

> **Ojo con el concurso:** el "Build for Good" de Product Hunt x Google Cloud
> Run exige que la app corra en **Cloud Run**. Desplegarla en Cloudflare **no**
> cuenta para el concurso. Esto es la alternativa para que la app esté en vivo
> y se pueda usar aunque Cloud Run siga bloqueado por la facturación.

## Qué hay en este folder

```
apollo-cloudflare/
  README.md            <- este archivo
  api/                 <- el proyecto del Worker (API + demo)
    wrangler.toml      <- config de Cloudflare (nombre, assets, vars, build)
    package.json       <- dependencias y scripts
    tsconfig.json
    .env.example       <- variables con placeholders (nunca valores reales)
    .dev.vars          <- valores de prueba SOLO para local (password falso)
    .gitignore
    src/               <- la API portada a Hono (ver "Qué cambió")
      index.ts         <- punto de entrada del Worker
      env.ts           <- tipo Env + helpers (CORS, expiración JWT)
      hono-types.ts    <- tipo compartido de la app Hono
      db.ts            <- Prisma con el driver HTTP de Neon
      auth/            <- login/registro, JWT (jose), bcryptjs, middleware
      users/ patients/ seizures/ medications/ alerts/ caregivers/
    prisma/
      schema.prisma    <- sin cambios (mismo que la versión Express)
      migrations/      <- 0001_init y 0002_add_patient_owner (ya aplicadas en Neon)
    public/
      index.html       <- la página demo, byte por byte igual que demo/index.html
```

El Worker sirve **las dos cosas en una sola URL**: la demo en `/` y la API en
`/api/*` y `/health`. Como la demo y la API comparten origen, no hace falta
configurar CORS entre ellas.

## Qué cambió respecto a la versión Express (Cloud Run)

| Antes (Express / Node) | Ahora (Workers) |
|---|---|
| Express 4 + `cors` + `dotenv` | Hono 4 + `hono/cors`; sin `dotenv`, sin `app.listen()` |
| `process.env` | Bindings de Cloudflare (`c.env`); secretos con `wrangler secret put` |
| Prisma con query engine (binario nativo) | Prisma 6.19 + `PrismaNeonHTTP` (driver HTTP de Neon por fetch). Sin engine, sin pool TCP: cada query es una petición HTTPS a Neon |
| `jsonwebtoken` (Node crypto) | `jose` (WebCrypto). Mismos tokens: HS256, mismos claims (`id`, `email`, `role`), misma expiración por defecto (7d). Un token de una versión verifica en la otra si `JWT_SECRET` coincide |
| `bcryptjs` | Igual, sin cambios (funciona en Workers) |
| `process.exit(1)` si faltan secretos | Errores 500 con la causa en el log (`wrangler tail`) |

**Sin cambios:** todas las rutas y sus respuestas/códigos (`/health`,
`/api/auth/register`, `/api/auth/login`, `/api/users/profile`,
`/api/patients`, `/api/seizures`, `/api/medications`, `/api/alerts`,
`/api/caregivers`), la validación de campos, `assertPatientOwned` (cada
cuenta solo ve sus pacientes y sub-recursos), los `deleteMany`/`updateMany`
con filtro por `userId`, el CORS por allow-list desde `CORS_ORIGIN`, y el
schema de Prisma con sus 7 tablas. La página demo no se modificó.

## Desarrollo local (sin cuenta de Cloudflare)

```bash
cd ~/workspace/your_files/apollo-cloudflare/api
npm install          # ya hecho aquí; repítelo si borras node_modules
npm run build        # prisma generate (descarga el engine; ver nota abajo)
npm run typecheck    # tsc --noEmit
npm run dev          # wrangler dev en http://localhost:8787
```

`npm run dev` lee los secretos de `api/.dev.vars` (ya existe, con valores de
prueba y password falso). Para probar contra la base real, pon en `.dev.vars`
la `DATABASE_URL` actual de Neon (la sacas del panel de Neon, nunca la pegues
en el chat) y un `JWT_SECRET` nuevo. `.dev.vars` está en `.gitignore`.

## Desplegar (lo hace Poly contigo, con tu inicio de sesión)

Falta: **iniciar sesión en Cloudflare** (cuenta `lmillan12mia@gmail.com`) y
la `DATABASE_URL` con la contraseña actual de Neon.

```bash
cd ~/workspace/your_files/apollo-cloudflare/api

# 1. Iniciar sesión (abre el navegador; entra con tu cuenta de Cloudflare)
npx wrangler login

# 2. Secretos (te los pide uno por uno; pégalos ahí, no en el chat)
wrangler secret put DATABASE_URL   # postgresql://... con la contraseña ACTUAL de Neon
wrangler secret put JWT_SECRET     # uno NUEVO, largo y aleatorio; nunca reutilices
                                   # el secreto que estuvo en el .env subido a git

# 3. Desplegar
npm run deploy                     # = wrangler deploy
```

La URL queda como `https://apollo-api.<tu-subdominio>.workers.dev`. Ahí mismo
abre la demo (`/`) y la API (`/health`).

**Para usar la demo con datos reales:** abre la URL del Worker, en el campo
"API URL" pega esa misma URL (sin `/` al final) y pulsa Connect, luego
Register/Login. Si abres la demo publicada en muse.ai en vez de la del Worker,
hay que permitir su origen: edita `CORS_ORIGIN` en `wrangler.toml`
(`CORS_ORIGIN = "https://muse.ai"`) y vuelve a desplegar.

**Migraciones:** las dos migraciones (`0001_init`, `0002_add_patient_owner`)
ya están aplicadas en Neon. Si el schema cambia en el futuro, aplica la
migración desde una computadora (no desde Workers) con:
`DATABASE_URL=... npx prisma migrate deploy` (necesita el query engine).

## Variables de entorno

| Variable | Dónde | Qué es |
|---|---|---|
| `DATABASE_URL` | secreto (`wrangler secret put`) | Conexión a Neon (host pooled, `?sslmode=require`), con la contraseña actual |
| `JWT_SECRET` | secreto (`wrangler secret put`) | Secreto nuevo para firmar los JWT (HS256) |
| `JWT_EXPIRES_IN` | `wrangler.toml` `[vars]` | Duración del token, por defecto `7d` |
| `CORS_ORIGIN` | `wrangler.toml` `[vars]` | Orígenes permitidos separados por coma; vacío = ninguno (lo más seguro) |

## Límites del plan gratis (para que no te sorprenda)

- Workers gratis: 100,000 peticiones/día, 10 ms de CPU por petición (la API
  es ligera; cada query a Neon es una petición HTTPS).
- Neon gratis: vigila el uso en su panel; cada query de la API es una
  llamada HTTP a Neon.
- El paquete del Worker pesa ~2.9 MB (casi todo es el cliente de Prisma);
  el límite es 10 MB.

## Verificación hecha (21 nov 2026, sin credenciales)

- `npm run build` (`prisma generate`): OK. Cliente generado v6.19.3.
- `npm run typecheck`: **0 errores**.
- `wrangler deploy --dry-run`: OK. Paquete ~2.9 MB (gzip ~1 MB), 1 asset
  (la demo), bindings visibles. No se desplegó nada.
- `wrangler dev` local + 11 pruebas: `/health` 200; demo servida en `/`;
  `/api/patients` sin token 401, con token malo 401; JSON roto 400;
  validación de registro 400; preflight con origen permitido devuelve
  `Access-Control-Allow-Origin`, con origen no permitido no lo devuelve;
  ruta desconocida 404 JSON; `/api/users/profile` sin token 401.
- JWT (`jose`): firma HS256, verificación OK, secreto incorrecto → null,
  token expirado → null.
- `bcryptjs`: en el runtime real de Workers (workerd) el hash y la
  verificación funcionan (`$2a$10$`, ok=true, wrong=false).
- Login con password falso: la API llega hasta Neon y falla ahí
  (`NeonDbError: Error connecting to database`), o sea que el camino
  Worker → Neon funciona y el único fallo es la contraseña falsa.

## Qué NO se pudo verificar (falta para el despliegue real)

- Ningún flujo con base de datos real (registro, login, pacientes,
  convulsiones, medicamentos, alertas): falta la `DATABASE_URL` con la
  contraseña actual de Neon.
- El despliegue en sí: falta el inicio de sesión en Cloudflare.
- El rendimiento real (latencia Worker → Neon) solo se verá desplegado.

## Trampas que ya se resolvieron (para no volver a caer)

- **`prisma generate --no-engine` NO sirve con el adaptador** en Prisma
  6.19.3: el cliente generado así rechaza el `adapter` con
  `PrismaClientValidationError`. Hay que generar normal (`prisma generate`);
  el engine se descarga pero nunca se usa en Workers.
- **La variante correcta del adaptador es `PrismaNeonHTTP`** (por HTTPS),
  no `PrismaNeon` con `neon()` (esa es por WebSocket/Pool y su constructor
  pide un `PoolConfig`).
- **`bcryptjs` falla en un test en Node puro** (sin `self` ni `module` en un
  bundle ESM), pero **sí funciona en el runtime de Workers** — verificado
  con un Worker de prueba en workerd.
- **No hay `prisma.$transaction` en el código**, así que no hay que
  preocuparse por las transacciones del driver HTTP.
- **Roles no se verifican en las rutas** (igual que en la versión Express:
  decisión de producto documentada, no un olvido del port).
