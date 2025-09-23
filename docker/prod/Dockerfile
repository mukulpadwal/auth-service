# Multi step build

# STAGE 1: Building the project
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run generate:prisma

RUN npm run build

# STAGE 2: Preparing production build
FROM node:22-alpine AS production

ENV NODE_ENV=prod

WORKDIR /app

COPY package*.json ./

RUN npm ci --ignore-scripts

COPY --from=builder /app/dist ./

# Only for doc purpose does not do port binding
EXPOSE 8080

# Runs when a container starts
CMD [ "node", "src/server.js" ]

