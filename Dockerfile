# Stage 1: build the static assets
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines VITE_* env vars at build time, so it must be
# passed in as a build ARG, not just a runtime variable.
ARG VITE_FINNHUB_KEY
ENV VITE_FINNHUB_KEY=$VITE_FINNHUB_KEY

RUN npm run build

# Stage 2: serve with Caddy, matching the existing Caddyfile on :8080
FROM caddy:2-alpine
COPY --from=build /app/dist /app/dist
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 8080
