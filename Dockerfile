# ==========================================
# STAGE 1: Install Dependencies
# ==========================================
FROM node:20-bookworm-slim AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ==========================================
# STAGE 2: Build Application
# ==========================================
FROM node:20-bookworm-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ==========================================
# STAGE 3: Production Runner
# ==========================================
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install network diagnostic packages needed for /tools (Ping, Traceroute, Curl)
RUN apt-get update && apt-get install -y --no-install-recommends \
    iputils-ping \
    traceroute \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Add non-root system user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Allow nextjs user to execute raw ICMP sockets for ping
RUN chmod u+s /bin/ping 2>/dev/null || true

# Copy standalone build & assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
