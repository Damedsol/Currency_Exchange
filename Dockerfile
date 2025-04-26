# Use the official Node.js LTS Alpine image as a base
ARG NODE_VERSION=lts-alpine

# Stage 1: Development Environment
FROM node:${NODE_VERSION} AS dev

# Set working directory first
WORKDIR /app

# Create the app directory and change ownership to the 'node' user
# THEN install pnpm globally. Do this as root.
RUN mkdir -p /app && chown -R node:node /app && \
    npm install -g pnpm

# Switch to the existing non-root user from the base image
USER node

# Now that USER is node, subsequent COPY/RUN commands are executed as node

# Copy package manifests as the node user
COPY --chown=node:node package.json pnpm-lock.yaml ./

# Install dependencies using pnpm as the node user
RUN pnpm install

# Copy the rest of the application code as the node user
# Note: We copy everything here, but in 'docker run' for dev, we mount ./src
COPY --chown=node:node . .

# Expose Vite port
EXPOSE 5173

# Start development server with hot reload, accessible externally
CMD ["pnpm", "run", "dev", "--", "--host"]

# Stage 2: Build Environment
FROM node:${NODE_VERSION} AS builder

# Set working directory first
WORKDIR /app

# Create the app directory and change ownership to the 'node' user
# THEN install pnpm globally. Do this as root.
RUN mkdir -p /app && chown -R node:node /app && \
    npm install -g pnpm

# Switch to the existing non-root user from the base image
USER node

# Now that USER is node, subsequent COPY/RUN commands are executed as node

# Copy package manifests as the node user
COPY --chown=node:node package.json pnpm-lock.yaml ./

# Install dependencies using pnpm frozen lockfile for reproducibility as the node user
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code as the node user
COPY --chown=node:node . .

# Build the application as the node user
RUN pnpm run build

# Stage 3: Production Environment
FROM nginx:alpine AS prod

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built artifacts from the builder stage
# Nginx runs as a non-root user by default, permissions should be fine
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose Nginx port
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"] 