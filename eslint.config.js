import globals from "globals";
import tseslint from "typescript-eslint";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import unusedImportsPlugin from "eslint-plugin-unused-imports";
import { fixupPluginRules } from "@eslint/compat";
import reactPlugin from "eslint-plugin-react";

// Parcheamos el plugin de React una sola vez para usarlo en toda la configuración
const patchedReactPlugin = fixupPluginRules(reactPlugin);
const patchedImportPlugin = fixupPluginRules(importPlugin);

export default [
	{
		// Configuración global
		files: ["**/*.{js,jsx,ts,tsx}"],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		// Bloque consolidado para React e Importaciones
		files: ["**/*.{js,jsx,ts,tsx}"],
		plugins: {
			react: patchedReactPlugin,
			import: patchedImportPlugin,
			"unused-imports": unusedImportsPlugin,
		},
		settings: {
			react: {
				version: "19",
			},
			"import/resolver": {
				node: {
					extensions: [".js", ".jsx", ".ts", ".tsx"],
				},
				typescript: {
					alwaysTryTypes: true,
					project: "./tsconfig.json",
				},
			},
		},
		rules: {
			// Reglas recomendadas de React (extraídas manualmente para evitar conflictos de plugins)
			...reactPlugin.configs.recommended.rules,
			"react/react-in-jsx-scope": "off",

			// Reglas de Importaciones
			"import/first": "error",
			"import/newline-after-import": "error",
			"import/no-duplicates": "error",
			"import/order": [
				"error",
				{
					groups: [
						"builtin",
						"external",
						"internal",
						"parent",
						"sibling",
						"index",
						"object",
						"type",
					],
					"newlines-between": "always",
					alphabetize: { order: "asc", caseInsensitive: true },
				},
			],

			// Variables no usadas
			"no-unused-vars": "off",
			"unused-imports/no-unused-imports": "error",
			"unused-imports/no-unused-vars": [
				"warn",
				{
					vars: "all",
					varsIgnorePattern: "^_",
					args: "after-used",
					argsIgnorePattern: "^_",
				},
			],

			// Reglas de TypeScript
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/explicit-function-return-type": [
				"warn",
				{
					allowExpressions: true,
					allowTypedFunctionExpressions: true,
				},
			],
			"@typescript-eslint/no-unused-vars": "off",
		},
	},
	{
		ignores: [
			"dist",
			"node_modules",
			"**/*.config.js",
			"**/*.config.ts",
			"**/*.cjs",
		],
	},
	eslintConfigPrettier,
];
