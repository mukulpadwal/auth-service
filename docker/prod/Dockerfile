# ---- STAGE 1: Build ----
FROM node:22-alpine AS builder

WORKDIR /app

# Install deps first (better caching)
COPY package*.json ./
RUN npm ci

# Copy rest of the code
COPY . .

# Generate prisma client
RUN npm run generate:prisma

# Build the project
RUN npm run build


# ---- STAGE 2: Production ----
FROM node:22-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

# Copy build output from builder
COPY --from=builder /app/dist ./dist

# If Prisma client is generated in node_modules, copy it too
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Document exposed port
EXPOSE 8080

# Start the app
CMD ["node", "dist/server.js"]
