FROM node:24-alpine AS base
WORKDIR /app

FROM base AS development-dependencies
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS production-dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM base AS build
COPY --from=development-dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

# This target is used only by the one-shot Compose database schema service.
FROM base AS db-tools
ENV NODE_ENV=production
COPY --from=development-dependencies /app/node_modules ./node_modules
COPY . .
CMD ["npm", "run", "db:push"]

FROM base AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000
COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node --from=production-dependencies /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/build ./build
USER node
EXPOSE 3000
CMD ["npm", "run", "start"]
