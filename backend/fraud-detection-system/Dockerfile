# SGDUS Fraud Detection System - Dockerfile
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

COPY src ./src

EXPOSE 3012

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3012/health || exit 1

CMD ["node", "src/app.js"]

