FROM oven/bun:latest AS builder

WORKDIR /app

COPY package.json bun.lock* sern.config.json tsconfig.json ./

RUN apt-get update -y \
&& apt-get install -y openssl

RUN bun install

COPY . .

RUN bun run build

RUN bunx prisma generate

FROM oven/bun:latest

WORKDIR /app

RUN apt-get update -y \
&& apt-get install -y openssl

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.sern ./.sern
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

CMD ["sh", "-c", "bunx prisma migrate deploy && bun run ."]