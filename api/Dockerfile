FROM node:26-alpine AS base
WORKDIR /app/api

FROM base AS deps
COPY api/package.json api/package-lock.json ./
RUN npm ci

FROM node:26-alpine AS shared-deps
WORKDIR /app/shared
COPY shared/package.json shared/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

FROM base AS runtime
ENV NODE_ENV=production

COPY --from=deps /app/api/node_modules ./node_modules
COPY api/package.json api/tsconfig.json ./
COPY api/src ./src
COPY shared /app/shared
COPY --from=shared-deps /app/shared/node_modules /app/shared/node_modules

EXPOSE 3000
CMD ["npm", "start"]
