# Currency Exchange 💱

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC_BY_4.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![Version](https://img.shields.io/badge/version-1.10.1-blue.svg)](https://github.com/Damedsol/Currency_Exchange)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2.0-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.11-646CFF?logo=vite)](https://vitejs.dev/)
[![FluentUI](https://img.shields.io/badge/FluentUI-9.72.3-blue?logo=microsoft)](https://developer.microsoft.com/en-us/fluentui)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker)](https://www.docker.com/)
[![PNPM](https://img.shields.io/badge/PNPM-10.18.3-orange?logo=pnpm)](https://pnpm.io/)
[![Node.js](https://img.shields.io/badge/Node.js-LTS-green?logo=node.js)](https://nodejs.org/)

## Description

A modern, responsive web application for real-time currency conversion built with React 19, TypeScript, and Microsoft Fluent UI. The app integrates with the [Free Currency API](https://freecurrencyapi.com/) to provide accurate, up-to-date exchange rates for over 160 international currencies.

## ✨ Key Features

### 🔄 **Currency Conversion**

- **160+ Currencies** - Support for major and minor world currencies
- **Real-time Rates** - Live exchange rates from Free Currency API
- **Smart Caching** - Intelligent caching system to minimize API calls
- **Rate Source Indicator** - Shows whether data comes from cache or API

### 🎨 **User Experience**

- **Modern UI** - Built with Microsoft Fluent UI components
- **Dark/Light Theme** - Automatic theme switching with system preference
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Intuitive Interface** - Clean, professional design with smooth animations

### 📊 **Data Management**

- **Conversion History** - Track all your currency conversions
- **Local Storage** - Secure API key storage and data persistence
- **Smart Validation** - Real-time API key validation
- **Error Handling** - Comprehensive error management and user feedback

### 🚀 **Performance & Development**

- **Hot Module Replacement** - Instant development feedback
- **TypeScript** - Full type safety and better development experience
- **Docker Support** - Containerized development and production environments
- **Code Quality** - Oxlint, Biome, and Husky for consistent code quality and ultra-fast checks
- **Strict Type Checking** - Enhanced TypeScript configuration with strict type safety
- **Automated Quality Gates** - Pre-commit hooks with type checking and formatting

## 🛠️ Technology Stack

### **Frontend Core**

- **React 19.2.0** - Latest React with concurrent features
- **TypeScript 5.9.3** - Full type safety and modern JavaScript features
- **Vite 7.1.11** - Lightning-fast build tool and dev server
- **Fluent UI 9.72.3** - Microsoft's modern design system

### **Development Tools**

- **Oxlint** - Ultra-fast static analysis tool (Rust-powered correctness)
- **Biome** - Blazing-fast formatting and import organization (Rust-powered)
- **ls-lint** - Filename consistency enforcer
- **Husky 9.1.7** - Git hooks for code quality
- **Commitlint** - Conventional commit message validation
- **Lint-staged** - Pre-commit code quality checks

### **DevOps & Deployment**

- **Docker** - Containerized development and production
- **Docker Compose** - Unified, flexible, and dynamic orchestration
- **Nginx** - Production web server with hardening, gzip compression, and SPA optimizations
- **Multi-stage builds** - Optimized Docker images

## Requirements

### For Local Development

- Node.js (version 24 or higher)
- PNPM (version 11 or higher)

### For Docker (Recommended)

- Docker
- Docker Compose

## Installation

### 🚀 Quick Start (Docker - Recommended)

1. Clone this repository:

   ```bash
   git clone https://github.com/Damedsol/Currency_Exchange.git
   cd Currency_Exchange
   ```

2. Initialize your local configuration file:

   ```bash
   cp .env.example .env.development
   ```

3. Start development environment:

   ```bash
   # Development with hot reload
   docker compose up --build
   ```

4. Access the application:
   - **Development**: [http://localhost:5173](http://localhost:5173)

---

### 🏭 Simulating Production (Local)

1. Copy the production environment template:

   ```bash
   cp .env.example .env.production
   ```

2. Spin up Nginx and the production build:

   ```bash
   NODE_ENV=production DOCKER_TARGET=production PORT=8080 INTERNAL_PORT=80 docker compose up --build
   ```

3. Open in your browser:
   - **Production Simulation**: [http://localhost:8080](http://localhost:8080)

---

### 🛠️ Local Development

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start the development server:

   ```bash
   pnpm dev
   ```

3. Open your browser at [http://localhost:5173](http://localhost:5173)

---

## 🚀 How to Use the Application

### **Getting Started**

1. **Get API Key** - Register for a free API key at [Free Currency API](https://freecurrencyapi.com/)
2. **Enter API Key** - Click the key icon in the top right corner and enter your API key
3. **Select Currencies** - Choose your source and target currencies from the dropdown menus
4. **Enter Amount** - Input the amount you want to convert
5. **Convert** - Click the "Convert" button to get real-time exchange rates
6. **View History** - Check your conversion history in the side panel

---

## 📁 Project Structure

```
currencyExchange/
├── src/                           # Source code
│   ├── components/                # React components
│   │   ├── ActionButtons/         # Action button components
│   │   ├── ApiKeySection/         # API key management
│   │   ├── AppHeader/             # Application header
│   │   ├── AppMessageBar/         # Message notifications
│   │   ├── Buttons/               # Reusable button components
│   │   ├── ConversionControls/    # Currency conversion controls
│   │   ├── CurrencyRow/           # Currency display row
│   │   ├── CurrencySelector/      # Currency selection dropdown
│   │   ├── History/               # Conversion history components
│   │   ├── HistoryPanel/          # History side panel
│   │   ├── RateSourceIndicator/   # Rate source display
│   │   ├── ResultSection/         # Conversion results
│   │   └── ThemeSwitcher/         # Theme toggle component
│   ├── services/                  # Business logic services
│   │   ├── FreeCurrency.ts        # API integration
│   │   └── LocalStorage.ts        # Local storage management
│   ├── styles/                    # Global styles
│   ├── App.tsx                    # Main application component
│   └── main.tsx                   # Application entry point
├── docs/                          # Documentation
│   └── docker-usage.md            # Docker usage guide (English)
├── public/                        # Static assets
├── Dockerfile                     # Multi-stage Docker build
├── docker-compose.yml             # Unified dynamic Docker Compose definition
├── nginx.conf                     # Unified production Nginx config with hardening
├── .env.example                   # Generic environment variables template
├── package.json                   # Dependencies and scripts
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # This file
```

---

## Development Workflow

This project follows the [Gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) workflow for development:

- `main`: Production branch, contains stable releases
- `develop`: Development branch for integration
- `feature/*`: Feature branches for new functionality
- `release/*`: Release branches for version preparation
- `hotfix/*`: Hotfix branches for urgent production fixes

For versioning, we follow [Semantic Versioning](https://semver.org/) principles.

---

## 🚀 Available Scripts

### 🐳 **Docker Commands (Recommended)**

```bash
# Development Environment
docker compose up --build          # Start dev with hot reload
docker compose up -d --build       # Start dev in background
docker compose down                # Stop development

# Production Simulation
NODE_ENV=production DOCKER_TARGET=production PORT=8080 INTERNAL_PORT=80 docker compose up --build
```

### 🛠️ **Local Development Scripts**

```bash
# Development
pnpm dev                    # Start development server with HMR
pnpm build                  # Build for production
pnpm preview                # Preview production build

# Code Quality (Oxlint & Biome)
pnpm format                 # Format code with Biome
pnpm format:check           # Check formatting with Biome
```

---

## 📚 Documentation

- **[Docker Usage Guide](docs/docker-usage.md)**: Complete Docker setup and usage instructions (English)
- **[Project Structure](#project-structure)**: Detailed code organization and architecture
- **[API Integration](src/services/FreeCurrency.ts)**: Free Currency API implementation
- **[Local Storage](src/services/LocalStorage.ts)**: Data persistence and caching logic

---

## 🔧 Configuration Files

- **`vite.config.ts`** - Vite configuration with HMR and polling for Docker
- **`tsconfig.json`** - TypeScript configuration with strict type checking
- **`package.json`** - Dependencies and scripts configuration
- **`docker-compose.yml`** - Dynamic multi-environment Docker orchestration
- **`Dockerfile`** - Multi-stage container build configuration
- **`nginx.conf`** - Production Nginx web server configurations

## Contributing

If you want to contribute to this project:

1. Fork the repository
2. Create a branch for your feature (`git checkout -b feature/new-feature`)
3. Make your changes following the project's code conventions
4. Commit your changes (`git commit -m 'feat: add new feature'`)
5. Push your changes (`git push origin feature/new-feature`)
6. Open a Pull Request

## License

This project is licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).
