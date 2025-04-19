# Currency Exchange 💱

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC_BY_4.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)](https://github.com/your-username/currencyExchange)
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

- React 18
- TypeScript
- Vite
- Fluent UI (Microsoft)
- ESLint + Prettier
- Husky (Git hooks)

## Requirements

- Node.js (version 16 or higher)
- PNPM

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/currencyExchange.git
   cd currencyExchange
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open your browser at [http://localhost:5173](http://localhost:5173)

## How to Use the Application

1. Get a free API key by registering at [Free Currency API](https://freecurrencyapi.com/)
2. Enter your API key in the application (key icon in the top right corner)
3. Select source and target currencies
4. Enter the amount to convert
5. Click "Convert" to perform the conversion
6. Check the conversion history in the side panel

## Project Structure

```
src/
  ├── components/     # Reusable React components
  ├── services/       # API and local storage services
  ├── styles/         # Global styles
  ├── App.tsx         # Main component
  └── main.tsx        # Entry point
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

- `pnpm dev`: Start the development server
- `pnpm build`: Build the application for production
- `pnpm preview`: Preview the built version
- `pnpm lint`: Run ESLint to check the code
- `pnpm format`: Format the code with Prettier
- `pnpm fix`: Run lint and format to fix issues

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
