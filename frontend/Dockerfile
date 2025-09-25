FROM node:20-alpine AS base

# 開発環境の構築
FROM base AS development
WORKDIR /web
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]



# アプリ本体の変更と依存関係の分離
FROM base AS dependencies
RUN apk add --nocache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm cl

# ビルドステップ
FROM base AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build


# 本番用イメージ
FROM base AS production
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
