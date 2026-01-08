# Stage 1 - build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
RUN npm run build || true

# Stage 2 - runtime
FROM node:20-alpine

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app /app

RUN rm -rf tests

EXPOSE 3000

HEALTHCHECK CMD wget -qO- http://localhost:3000 || exit 1

USER appuser

CMD ["npm","start"]
