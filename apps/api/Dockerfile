# Apollo Health Guardian — API image for Google Cloud Run.
#
# Multi-stage build. The container listens on $PORT (injected by Cloud Run).
# Build from the REPO ROOT (the build context must be the repo root):
#   docker build -f apps/api/Dockerfile -t apollo-api .
#
# Notes:
# - The runtime image intentionally keeps devDependencies installed: the
#   Prisma CLI is needed inside the container to run `prisma migrate deploy`
#   on startup and to generate the Prisma client. (Optimizing this out is a
#   follow-up; for the contest demo, correctness beats image size.)
# - `prisma generate` downloads the Prisma engines from binaries.prisma.sh,
#   so the build needs network access.

# ---------- Build stage: install, generate Prisma client, compile TypeScript ----------
FROM node:20-alpine AS build
WORKDIR /app
# pnpm is the repo's package manager (see "packageManager" in package.json).
RUN npm install -g pnpm@9.0.0
# Workspace manifests first, for better layer caching.
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/api/prisma apps/api/prisma/
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @apollo/api exec prisma generate
# Application source + TypeScript build.
COPY apps/api/src apps/api/src/
COPY apps/api/tsconfig.json apps/api/tsconfig.json
RUN pnpm --filter @apollo/api build

# ---------- Runtime stage: prod deps, Prisma client, compiled code ----------
FROM node:20-alpine AS runtime
WORKDIR /app
RUN npm install -g pnpm@9.0.0
ENV NODE_ENV=production
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/api/prisma apps/api/prisma/
COPY apps/api/entrypoint.sh apps/api/entrypoint.sh
RUN pnpm install --frozen-lockfile
WORKDIR /app/apps/api
RUN ./node_modules/.bin/prisma generate
COPY --from=build /app/apps/api/dist ./dist
RUN chmod +x entrypoint.sh
# Cloud Run sets PORT automatically. The entrypoint runs migrations, then starts the API.
CMD ["sh", "entrypoint.sh"]
