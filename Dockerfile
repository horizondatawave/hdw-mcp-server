# Dockerfile for Smithery STDIO deployment
# Stage 1: build
FROM node:lts-alpine AS build
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (skip prepare script to avoid double build)
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Stage 2: production image
FROM node:lts-alpine
WORKDIR /app

# Copy built files
COPY --from=build /app/build ./build

# Copy package files for production dependencies
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --omit=dev --ignore-scripts

# Set production environment
ENV NODE_ENV=production

# STDIO mode - start the MCP server
CMD ["node", "./build/index.js"]
