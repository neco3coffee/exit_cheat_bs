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

# appサービスがないとapp:3000二接続できなくてビルドできない問題の対策
ENV NEXT_PUBLIC_BACKEND_URL http://localhost:3000
# ビルドステップ
FROM base AS builder
ARG IS_BUILD=false
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV IS_BUILD=${IS_BUILD}
RUN npm run build && ls -la /app && ls -la /app/.next



# 本番用イメージ
FROM base AS production
ENV NODE_ENV production
ENV IS_BUILD false

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder  /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
RUN ls -la /app && ls -la /app/.next
RUN chmod +x server.js

EXPOSE 3000
CMD ["node", "server.js"]
