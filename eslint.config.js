import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  { languageOptions: { globals: globals.browser } },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReactConfig,
  {
    files: ["**/*.{ts,tsx}"], // Apply React specific settings only to TS/TSX files
    settings: {
      react: {
        version: "detect", // Automatically detect the React version
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off"
    }
  },
  {
    ignores: ["dist", "node_modules", "**/*.config.js", "**/*.config.ts", "**/*.cjs"], // Ignore build outputs, dependencies and config files
  },
  eslintConfigPrettier,
]; 