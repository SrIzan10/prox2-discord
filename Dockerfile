FROM oven/bun:latest AS builder

WORKDIR /app

COPY package.json bun.lock* sern.config.json ./

RUN bun install

COPY . .

RUN bun run build

RUN bunx prisma generate

FROM oven/bun:latest

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

CMD ["sh", "-c", "bunx prisma migrate deploy && bun run ."]