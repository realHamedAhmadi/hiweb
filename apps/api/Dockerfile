# Multi-stage Dockerfile for apps/api, matching the deployment shape
# decided in infrastructure-architecture.md Section 2
# ("apps/api containerized via Docker").
#
# NEVER BUILT OR RUN — this environment has no Docker daemon and no
# network access to pull a base image or install packages. Written to
# standard Dockerfile conventions but unverified, same honest caveat
# as everything else in this backend.
#
# Build context is expected to be the MONOREPO ROOT (not apps/api
# itself), since this needs packages/database as a sibling workspace
# package — e.g.: `docker build -f apps/api/Dockerfile .`

FROM node:20-alpine AS base
WORKDIR /repo

# --- Dependencies ---
FROM base AS deps
COPY package.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/database/package.json ./packages/database/package.json
RUN npm install --workspaces --include-workspace-root

# --- Build ---
FROM base AS build
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
RUN npm run build --workspace=packages/database
RUN npm run build --workspace=apps/api

# --- Run ---
FROM node:20-alpine AS run
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY --from=build /repo/packages/database/dist ./packages/database/dist
COPY --from=build /repo/packages/database/prisma ./packages/database/prisma

EXPOSE 4000
CMD ["node", "apps/api/dist/index.js"]
