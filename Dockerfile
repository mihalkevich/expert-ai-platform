FROM node:20.19.6-slim AS builder
WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy prisma schema first (needed for prisma generate in build)
COPY prisma ./prisma
COPY prisma.config.ts ./

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy rest of source and build
COPY . .
# Ensure public dir exists for Docker COPY
RUN mkdir -p public
RUN npm run build

FROM node:20.19.6-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
