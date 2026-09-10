# Third-Party Licenses

This project bundles or depends on third-party software. Their licenses are
listed below in accordance with the respective license terms.

## Fonts (bundled in `public/assets/fonts/`)

### Figtree

- **License:** SIL Open Font License 1.1
- **Copyright:** Copyright 2023 The Figtree Project Authors
  (https://github.com/erikdkennedy/figtree)
- **Full license text:** `public/assets/fonts/Figtree/OFL.txt`

### IBM Plex Mono

- **License:** SIL Open Font License 1.1
- **Copyright:** Copyright 2023 IBM Corp. (https://github.com/IBM/plex)
- **Full license text:** `public/assets/fonts/IBM_Plex_Mono/OFL.txt`

## Runtime dependencies (bundled by Vite)

### react

- **License:** MIT
- **Copyright:** Copyright (c) Meta Platforms, Inc. and affiliates.
- **Source:** https://github.com/facebook/react

### react-dom

- **License:** MIT
- **Copyright:** Copyright (c) Meta Platforms, Inc. and affiliates.
- **Source:** https://github.com/facebook/react

### @fluentui/react-components

- **License:** MIT
- **Copyright:** Copyright (c) Microsoft Corporation.
- **Source:** https://github.com/microsoft/fluentui

### @fluentui/react-icons

- **License:** MIT
- **Copyright:** Copyright (c) Microsoft Corporation.
- **Source:** https://github.com/microsoft/fluentui

### Iconoir (icon geometry vendored as inline React components)

- **License:** MIT
- **Copyright:** Copyright (c) Iconoir (https://iconoir.com).
- **Source:** https://github.com/iconoir-icons/iconoir
- **Usage:** `github` and `linkedin` path geometry reused in
  `src/components/Footer/FooterIcons.tsx` (normalized: geometry only, no
  original presentation attributes).

## Development and build tooling

Development-only dependencies (Vite, TypeScript, Vitest, Oxlint, Biome,
Playwright, Husky, lint-staged, commitlint, jsdom, Testing Library, and their
transitive dependencies) are licensed under permissive licenses (MIT,
Apache-2.0, ISC, BSD). They are not shipped in the production bundle. See each
package's `package.json` for its exact license and copyright notice.