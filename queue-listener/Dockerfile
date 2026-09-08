FROM node:26-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:26-bookworm-slim AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

FROM mcr.microsoft.com/azure-functions/node:4-node22
ENV AzureFunctionsJobHost__Logging__Console__IsEnabled=true
RUN apt-get update \
    && apt-get install -y --no-install-recommends fonts-dejavu-core fontconfig \
    && fc-cache -f \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /home/site/wwwroot
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY host.json package.json ./
