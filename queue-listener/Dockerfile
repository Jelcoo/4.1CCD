FROM node:26-bookworm-slim AS build
WORKDIR /app/shared
COPY shared/package.json shared/package-lock.json ./
RUN npm ci --ignore-scripts
COPY shared/tsconfig.json ./
COPY shared/src ./src
WORKDIR /app/queue-listener
COPY queue-listener/package.json queue-listener/package-lock.json ./
RUN npm ci --ignore-scripts
COPY queue-listener/tsconfig.json ./
COPY queue-listener/src ./src
RUN npm run build

FROM node:26-bookworm-slim AS prod-deps
WORKDIR /app/queue-listener
COPY queue-listener/package.json queue-listener/package-lock.json ./
COPY shared /app/shared
RUN npm ci --omit=dev --ignore-scripts \
    && rm -rf node_modules/shared

FROM mcr.microsoft.com/azure-functions/node:4-node22
ENV AzureFunctionsJobHost__Logging__Console__IsEnabled=true
RUN apt-get update \
    && apt-get install -y --no-install-recommends fonts-dejavu-core fontconfig \
    && fc-cache -f \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /home/site/wwwroot
COPY --from=prod-deps /app/queue-listener/node_modules ./node_modules
COPY --from=build /app/shared/package.json ./node_modules/shared/package.json
COPY --from=build /app/shared/dist ./node_modules/shared/dist
COPY --from=build /app/queue-listener/dist ./dist
COPY queue-listener/host.json queue-listener/package.json ./
