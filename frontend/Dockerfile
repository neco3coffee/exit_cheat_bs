FROM node:20-alpine AS base

# 開発環境の構築
FROM base AS development
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --force
COPY . .
EXPOSE 3000
ENV NEXT_WATCHPACK_POLLING=1
CMD ["npm", "run", "dev"]



# アプリ本体の変更と依存関係の分離
FROM base AS dependencies
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --force

# ビルドステップ
FROM base AS builder
WORKDIR /app
ARG SKIP_BUILD_FETCH=true
ENV SKIP_BUILD_FETCH=$SKIP_BUILD_FETCH
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build



# 本番用イメージ
FROM base AS production
ENV NODE_ENV production

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder  /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
RUN ls -la /app && ls -la /app/.next
RUN chmod +x server.js

EXPOSE 3000
CMD ["node", "server.js"]
