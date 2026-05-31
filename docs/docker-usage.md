# 🐳 Docker Usage Guide - Currency Exchange (Unified & Adaptable)

This guide details the operation of the unified and modular Docker environment for the project, dynamically configured to ease local development, production simulation, and deployments on external servers while guaranteeing security by obscurity.

---

## 📋 Initial Setup

Before starting any container, each developer must initialize their local environment configuration file from the generic template in the root:

```bash
# For local development environment:
cp .env.example .env.development

# For local simulated production environment:
cp .env.example .env.production
```

---

## 🚀 Unified Execution Commands

The `docker-compose.yml` file in the root defines a single dynamic `frontend` service that automatically adapts using environment variables and smart defaults.

### 💻 Local Development Environment
Spins up the Vite development server with Hot Module Replacement (HMR) and live-reloading mapped directly to your source code.

- **Default Port**: `http://localhost:5173`
- **Commands**:
  ```bash
  # Start the development environment
  docker compose up --build

  # Start in the background (detached mode)
  docker compose up -d --build

  # View container logs in real time
  docker compose logs -f

  # Stop the development environment
  docker compose down
  ```

### 🏭 Local Production Environment (Simulation)
Spins up an Nginx web server with security hardening applied, SPA routing, and active gzip compression.

- **Configured Port**: `http://localhost:8080` (customizable via the `PORT` environment variable)
- **Commands**:
  ```bash
  # Start production simulation
  NODE_ENV=production DOCKER_TARGET=production PORT=8080 INTERNAL_PORT=80 docker compose up --build

  # Start in the background (detached mode)
  NODE_ENV=production DOCKER_TARGET=production PORT=8080 INTERNAL_PORT=80 docker compose up -d --build

  # Stop the production environment
  NODE_ENV=production DOCKER_TARGET=production docker compose down
  ```

---

## 📁 Docker File Structure

All Docker and Nginx configurations are centralized directly in the root directory for maximum transparency and cleanliness:

```
├── Dockerfile           # Multi-stage build (development, builder, production)
├── docker-compose.yml   # Unified, flexible, and dynamic service definition
├── nginx.conf           # Production Nginx server with applied security hardening
├── .env.example         # Generic and secure environment variables template
└── .dockerignore        # Exclusion rules for unnecessary local files
```

---

## 🛡️ Security Hardening in `nginx.conf`

The Nginx production stage includes strict policies to mitigate common attack vectors:
- **`server_tokens off;`**: Hides the Nginx version in HTTP response headers.
- **Hidden Files Protection**: Silently blocks access to any hidden files or folders starting with a dot (e.g. `.env`, `.git`) by returning an **HTTP 404** status code.
- **Global Security Headers**:
  - `X-Frame-Options: SAMEORIGIN` (mitigates Clickjacking).
  - `X-Content-Type-Options: nosniff` (mitigates MIME-type Sniffing).
  - `X-XSS-Protection: 1; mode=block` (mitigates cross-site scripting attacks).
  - `Referrer-Policy: strict-origin-when-cross-origin`.

---

## 🧹 Environment Cleanup

```bash
# Stop the service and remove development volumes (e.g. persisted node_modules)
docker compose down -v

# Clean up all unused or dangling docker images
docker system prune -af
```

---

## 🔍 Troubleshooting

### 1. Port already in use
If port `5173` or `8080` is already taken by another service, you can run the container by mapping a different host port:
```bash
PORT=8081 docker compose up --build
```

### 2. Error looking for .env.development or .env.production
If Docker throws an error indicating that the `.env.development` file is missing, make sure you copied the initial template:
```bash
cp .env.example .env.development
```

### 3. Clear Vite internal cache
If you experience issues resolving Node.js dependencies in development:
```bash
# Stop containers and clean volumes to force a fresh install
docker compose down -v
docker compose up --build
```
