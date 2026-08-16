# Build context is the repo root (needs the npm workspace packages).
FROM node:20-alpine AS builder
WORKDIR /repo
COPY . .
# REQUIRED: .dockerignore excludes node_modules, so without this the image has
# no dependencies at all and the build dies with exit 127 on the first workspace
# package.
RUN npm ci
RUN npx turbo run build --filter=worker...

FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=builder /repo .
WORKDIR /repo/apps/worker
USER node
# Does NOT run migrations: the backend already applies them at boot (Prisma
# serializes on an advisory lock anyway), and in practice this app only ever
# acts on a job the backend already enqueued.
CMD ["npm", "start"]
