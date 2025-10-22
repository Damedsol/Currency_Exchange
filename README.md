# Currency Exchange 💱

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC_BY_4.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![Version](https://img.shields.io/badge/version-1.5.1-blue.svg)](https://github.com/your-username/currencyExchange)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.1-646CFF?logo=vite)](https://vitejs.dev/)
[![FluentUI](https://img.shields.io/badge/FluentUI-9.62.0-blue?logo=microsoft)](https://developer.microsoft.com/en-us/fluentui)

## Description

Web application for currency conversion using the [Free Currency API](https://freecurrencyapi.com/). Developed with React, TypeScript, and Fluent UI, it offers a modern interface for real-time currency conversion.

## Main Features

- ✅ Conversion between multiple international currencies
- 🔄 Conversion history tracking
- 🌓 Light and dark theme support
- 💾 Local storage for API key and conversion data
- ⚡ Smart caching to minimize API calls
- 📱 Responsive design adapted to different devices

## Technologies Used

### Frontend

- React 18
- TypeScript
- Vite
- Fluent UI (Microsoft)
- ESLint + Prettier
- Husky (Git hooks)

### DevOps & Deployment

- Docker & Docker Compose
- Nginx (Production)
- Multi-stage builds
- Environment-specific configurations

## Requirements

### For Local Development

- Node.js (version 16 or higher)
- PNPM

### For Docker (Recommended)

- Docker
- Docker Compose

## Installation

### 🚀 Quick Start (Docker - Recommended)

1. Clone this repository:

   ```bash
   git clone https://github.com/your-username/currencyExchange.git
   cd currencyExchange
   ```

2. Start development environment:

   ```bash
   # Development with hot reload
   docker-compose --profile development up

   # Production build
   docker-compose --profile production up
   ```

3. Access the application:
   - **Development**: [http://localhost:5173](http://localhost:5173)
   - **Production**: [http://localhost:80](http://localhost:80)

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

## How to Use the Application

1. Get a free API key by registering at [Free Currency API](https://freecurrencyapi.com/)
2. Enter your API key in the application (key icon in the top right corner)
3. Select source and target currencies
4. Enter the amount to convert
5. Click "Convert" to perform the conversion
6. Check the conversion history in the side panel

## Project Structure

```
currencyExchange/
├── src/                    # Source code
│   ├── components/         # Reusable React components
│   ├── services/          # API and local storage services
│   ├── styles/            # Global styles
│   ├── App.tsx            # Main component
│   └── main.tsx           # Entry point
├── docker/                # Docker configuration
│   ├── nginx/            # Nginx configurations
│   ├── .env.development  # Development environment variables
│   └── .env.production   # Production environment variables
├── docs/                  # Documentation
│   └── docker-usage.md   # Docker usage guide
├── Dockerfile            # Multi-stage Docker build
├── docker-compose.yml    # Docker Compose with profiles
└── README.md            # This file
```

## Development Workflow

This project follows the [Gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) workflow for development:

- `main`: Production branch, contains stable releases
- `develop`: Development branch for integration
- `feature/*`: Feature branches for new functionality
- `release/*`: Release branches for version preparation
- `hotfix/*`: Hotfix branches for urgent production fixes

For versioning, we follow [Semantic Versioning](https://semver.org/) principles.

## Available Scripts

### 🐳 Docker Commands

- `docker-compose --profile development up`: Start development environment
- `docker-compose --profile production up`: Start production environment
- `docker-compose --profile development down`: Stop development environment
- `docker-compose --profile production down`: Stop production environment

### 🛠️ Local Development Scripts

- `pnpm dev`: Start the development server
- `pnpm build`: Build the application for production
- `pnpm preview`: Preview the built version
- `pnpm lint`: Run ESLint to check the code
- `pnpm format`: Format the code with Prettier
- `pnpm fix`: Run lint and format to fix issues

## 📚 Documentation

- **[Docker Usage Guide](docs/docker-usage.md)**: Complete Docker setup and usage instructions
- **[Project Structure](#project-structure)**: Code organization and architecture

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
