# Use the official Node.js LTS Alpine image as a base
ARG NODE_VERSION=lts-alpine

# Stage 1: Development Environment
FROM node:${NODE_VERSION} AS dev

WORKDIR /app

# Create a non-root user and group
RUN addgroup -g 1001 node && \
    adduser -u 1001 -G node -s /bin/sh -D node && \
    # Install pnpm globally
    npm install -g pnpm && \
    # Create app directory owned by node user
    mkdir -p /app && chown -R node:node /app

# Switch to the non-root user
USER node

# Copy package manifests
COPY --chown=node:node package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install

# Copy the rest of the application code
# Note: We copy everything here, but in 'docker run' for dev, we mount ./src
COPY --chown=node:node . .

# Expose Vite port
EXPOSE 5173

# Start development server with hot reload, accessible externally
CMD ["pnpm", "run", "dev", "--", "--host"]

# Stage 2: Build Environment
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

# Create a non-root user and group
RUN addgroup -g 1001 node && \
    adduser -u 1001 -G node -s /bin/sh -D node && \
    # Install pnpm globally
    npm install -g pnpm && \
    # Create app directory owned by node user
    mkdir -p /app && chown -R node:node /app

# Switch to the non-root user
USER node

# Copy package manifests
COPY --chown=node:node package.json pnpm-lock.yaml ./

# Install dependencies using pnpm frozen lockfile for reproducibility
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY --chown=node:node . .

# Build the application
RUN pnpm run build

# Optional: Prune development dependencies if necessary, though build output is copied anyway
# RUN pnpm prune --prod

# Stage 3: Production Environment
FROM nginx:alpine AS prod

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built artifacts from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose Nginx port
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"] 