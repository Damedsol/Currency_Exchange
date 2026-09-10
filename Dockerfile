# Use the official Node.js LTS Alpine image as a base
ARG NODE_VERSION=24-alpine

# Stage 1: Development Environment
FROM node:${NODE_VERSION}@sha256:50c8e8ca1d27439048670df5883f32d57cf81cff6233222c893fd0d9884cbd81 AS development

# Set working directory first
WORKDIR /app

# Create the app directory and change ownership to the 'node' user
# THEN install pnpm globally. Do this as root.
RUN mkdir -p /app && chown -R node:node /app && \
    npm install -g pnpm

# Switch to the existing non-root user from the base image
USER node

# Set environment variables for development
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
ENV FAST_REFRESH=true
ENV VITE_HMR=true

# Create vite cache directory with proper permissions
RUN mkdir -p /app/node_modules/.vite && chown -R node:node /app/node_modules/.vite

# Copy package manifests as the node user
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies using pnpm as the node user
RUN pnpm install

# Copy the rest of the application code as the node user
# Note: We copy everything here, but in 'docker run' for dev, we mount ./src
COPY --chown=node:node . .

# Expose Vite port
EXPOSE 5173

# Start development server with hot reload, accessible externally
CMD ["pnpm", "run", "dev", "--", "--host", "0.0.0.0"]

# Stage 2: Build Environment
FROM node:${NODE_VERSION}@sha256:50c8e8ca1d27439048670df5883f32d57cf81cff6233222c893fd0d9884cbd81 AS builder

# Set working directory first
WORKDIR /app

# Create the app directory and change ownership to the 'node' user
# THEN install pnpm globally. Do this as root.
RUN mkdir -p /app && chown -R node:node /app && \
    npm install -g pnpm

# Switch to the existing non-root user from the base image
USER node

# Set environment variables for build
ENV NODE_ENV=production

# Copy package manifests as the node user
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies using pnpm frozen lockfile for reproducibility
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code as the node user
COPY --chown=node:node . .

# Build the application as the node user
RUN pnpm run build

# Stage 3: Production Environment (non-root via nginx-unprivileged)
FROM nginxinc/nginx-unprivileged:alpine@sha256:2ddec616f1cb58bcac057aa388f28cb81e35137641ef4226d321714499329bd1 AS production

# Drop root privileges: unprivileged image listens on 8080
USER nginx

# Copy custom Nginx configuration for production
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built artifacts from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose Nginx port
EXPOSE 8080

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"] 