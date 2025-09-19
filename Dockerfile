FROM oven/bun:alpine AS builder

WORKDIR /app

COPY package.json bun.lock* sern.config.json tsconfig.json ./

RUN bun install

COPY . .

RUN bun run build

RUN apk add --update --no-cache openssl1.1-compat

RUN bunx prisma generate

FROM oven/bun:alpine

WORKDIR /app

RUN apk add --update --no-cache openssl1.1-compat

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.sern ./.sern
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

CMD ["sh", "-c", "bunx prisma migrate deploy && bun run ."]