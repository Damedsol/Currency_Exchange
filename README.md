# Currency Exchange 💱

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC_BY_4.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![Version](https://img.shields.io/badge/version-2.1.1-blue.svg)](https://github.com/Damedsol/Currency_Exchange)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2.6-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0.16-646CFF?logo=vite)](https://vitejs.dev/)
[![FluentUI](https://img.shields.io/badge/FluentUI-9.74.1-blue?logo=microsoft)](https://developer.microsoft.com/en-us/fluentui)
[![Coverage](https://img.shields.io/badge/coverage-98%25-brightgreen)](https://img.shields.io/badge/coverage-98%25-brightgreen)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker)](https://www.docker.com/)
[![PNPM](https://img.shields.io/badge/PNPM-11.15.0-orange?logo=pnpm)](https://pnpm.io/)
[![Node.js](https://img.shields.io/badge/Node.js-LTS-green?logo=node.js)](https://nodejs.org/)

A modern, responsive web application for real-time currency conversion built with React 19, TypeScript, and Microsoft Fluent UI. The app integrates with the [Free Currency API](https://freecurrencyapi.com/) to provide accurate, up-to-date exchange rates for over 160 international currencies.

---

## ✨ Key Features

### 🔄 **Currency Conversion**
- **160+ Currencies** - Support for major and minor world currencies.
- **Real-time Rates** - Live exchange rates from Free Currency API.
- **Smart Caching** - Intelligent caching system to minimize API calls.
- **Rate Source Indicator** - Shows whether data comes from cache or live API.

### 🎨 **User Experience**
- **Modern UI** - Built with Microsoft Fluent UI components (v9).
- **Dark/Light Theme** - Automatic theme switching with system preferences.
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices.
- **Intuitive Interface** - Clean, professional design with smooth animations.

### 📊 **Data Management**
- **Conversion History** - Track all your currency conversions.
- **Local Storage** - Secure API key storage and data persistence.
- **Smart Validation** - Real-time API key validation and user feedback.

---

## 🛠️ Technology Stack

| Component / Layer | Version | Purpose |
| :--- | :--- | :--- |
| **React** | v19.2.6 | Frontend core library (concurrent features) |
| **TypeScript** | v6.0.3 | Static typing and modern JS support |
| **Vite** | v8.0.16 | Fast build tool and development server |
| **Fluent UI React** | v9.74.1 | Microsoft's modern component-based design system |
| **PNPM** | v11.15.0 | Fast, disk space efficient package manager |
| **Oxlint** | LATEST | Blazing-fast static linter (Rust-powered) |
| **Biome** | LATEST | Blazing-fast formatting and import organization (Rust-powered) |
| **ls-lint** | LATEST | Filename consistency enforcer |
| **Docker & Compose** | v3.8+ | Containerized local development & production orchestration |
| **Nginx** | alpine | Production web server with hardening, gzip, and SPA routing |

---

## ⚙️ Installation & Configuration

Follow these steps to deploy your local development environment quickly:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v24 or higher) and [PNPM](https://pnpm.io/) (v11 or higher) installed on your machine.

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Damedsol/Currency_Exchange.git
   cd Currency_Exchange
   ```

2. **Initialize Environment Variables:**
   Create your local configuration from the generic template:
   ```bash
   cp .env.example .env.development
   ```

3. **Install Dependencies:**
   ```bash
   pnpm install
   ```

4. **Start the Development Server:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🐳 Docker Deployment & Simulation

We provide a unified and dynamic Docker setup that is 100% compliant with professional standards and security by obscurity practices.

### 🚀 Local Development (Docker + HMR)
Spins up the Vite development server inside Docker with volume mounting and HMR polling activated.

```bash
# Start development environment
docker compose up --build

# Stop development environment
docker compose down
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 🏭 Local Production (Simulated Nginx Server)
Builds the static assets and serves them using Nginx with compression, caching policies, and security hardening headers.

```bash
# Start production simulation
NODE_ENV=production DOCKER_TARGET=production PORT=8080 INTERNAL_PORT=80 docker compose up --build

# Stop production simulation
NODE_ENV=production DOCKER_TARGET=production docker compose down
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## 📁 Project Structure

```
currencyExchange/
├── src/                           # Source code principal
│   ├── components/                # Reusable React components
│   │   ├── ActionButtons/
│   │   ├── ApiKeySection/
│   │   ├── AppHeader/
│   │   ├── AppMessageBar/
│   │   ├── Buttons/
│   │   ├── ConversionControls/
│   │   ├── CurrencyRow/
│   │   ├── CurrencySelector/
│   │   ├── History/
│   │   ├── HistoryPanel/
│   │   ├── RateSourceIndicator/
│   │   ├── ResultSection/
│   │   └── ThemeSwitcher/
│   ├── services/                  # Business logic services (API & storage)
│   ├── styles/                    # Global stylesheets
│   ├── App.tsx                    # Main App wrapper
│   └── main.tsx                   # App Entry point
├── docs/                          # Project documentation
│   └── docker-usage.md            # Detailed Docker usage guide (English)
├── .ia/                           # Agentic AI configuration & memory
│   ├── AGENTS.md                  # Local agent behavior profile
│   └── memory/context.md          # Persistent session memory
├── .nvmrc                         # Node.js version for nvm/nodenv (Node 24)
├── SECURITY.md                    # Vulnerability reporting policy
├── public/                        # Static assets & favicons
├── Dockerfile                     # Multi-stage Docker build (dev, builder, production)
├── docker-compose.yml             # Dynamic multi-environment orchestration file
├── nginx.conf                     # Unified Nginx server configurations with security hardening
├── .env.example                   # Generic environment variables template
├── package.json                   # Dependencies, engines, and scripts
├── vite.config.ts                 # Vite bundler configurations
└── tsconfig.json                  # TypeScript compiler configurations
```

---

## 🚀 Available Scripts

### 🛠️ Local Development Scripts
```bash
pnpm dev                    # Start Vite dev server with HMR
pnpm build                  # Build static files for production to /dist
pnpm preview                # Preview production build locally

# Testing (Vitest)
pnpm test                   # Run unit & integration tests (299 tests)
pnpm test:coverage          # Run tests with coverage report (98%+)
pnpm test:e2e               # Run Playwright E2E tests (10 tests)

# Code Quality & Format
pnpm format                 # Formats files and organizes imports with Biome
pnpm format:check           # Checks formatting with Biome
pnpm lint                   # Performs correctness checks with Oxlint & ls-lint
```

---

## 🛡️ Security Hardening & Gzip Policies
Our production [nginx.conf](nginx.conf) unifies performance and security policies:
- **`server_tokens off;`**: Obscures Nginx version details.
- **Hidden Files Lock**: Access to any hidden files (such as `.env` or `.git`) is blocked via `deny all`, returning **HTTP 404**.
- **Compresión Gzip**: Active for HTML, CSS, JavaScript, JSON, and SVG files.
- **Content Security Policy**: Delivered exclusively via HTTP header (no `<meta>` tag in HTML) — `default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.freecurrencyapi.com; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'`.
- **HTTP Security Headers**:
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (HSTS 2 years).
  - `X-Frame-Options: SAMEORIGIN` (prevents clickjacking).
  - `X-Content-Type-Options: nosniff` (prevents MIME sniffing).
  - `Cross-Origin-Resource-Policy: same-origin` (resource isolation).
  - `Cross-Origin-Opener-Policy: same-origin` (cross-origin isolation).
  - `Referrer-Policy: strict-origin-when-cross-origin`.
- **Cache Hardening**: `no-transform` directive on SPA route to prevent proxy cache corruption.

---

## 📚 Documentation
- **[Docker Usage Guide](docs/docker-usage.md)**: Deep dive into the containerized environment setup.
- **[Security Policy](SECURITY.md)**: How to report vulnerabilities.
- **[AGENTS.md](AGENTS.md)**: Coding standards and agent behavior profile.
- **[.ia/memory/context.md](.ia/memory/context.md)**: Technical decisions and session history.
- **[LICENSE.md](LICENSE.md)**: Details about Creative Commons CC BY 4.0 policies.

---

## 📄 License
This project is licensed under **Creative Commons Attribution 4.0 International (CC BY 4.0)**. Refer to [LICENSE.md](LICENSE.md) for full terms.

---

## 👤 Author
Developed with ❤️ by **Damedsol**:
- **LinkedIn**: [David Medina Soloza](https://www.linkedin.com/in/david-medina-soloza/)
- **Email**: `contact@damedsol.dev`
