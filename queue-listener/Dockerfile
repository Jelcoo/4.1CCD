FROM node:24-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS runtime
ENV NODE_ENV=production

RUN apk add --no-cache icu-libs gcompat libstdc++

COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json host.json local.settings.json ./
COPY src ./src

CMD ["npm", "run", "start:verbose"]
