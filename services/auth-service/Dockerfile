FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace config
COPY package.json yarn.lock ./
COPY tsconfig.base.json ./

# Copy shared packages
COPY shared/types ./shared/types
COPY shared/errors ./shared/errors
COPY shared/database ./shared/database
COPY shared/utils ./shared/utils
COPY shared/middlewares ./shared/middlewares
COPY shared/response ./shared/response

# Copy service
COPY services/auth-service ./services/auth-service

# Install dependencies
RUN yarn install --frozen-lockfile --production=false

# Build
RUN yarn workspace @realestate/auth-service build

# Production image
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/services/auth-service/dist ./dist
COPY --from=builder /app/services/auth-service/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001

USER node

CMD ["node", "dist/index.js"]
