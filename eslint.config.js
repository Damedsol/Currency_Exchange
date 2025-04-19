import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import unusedImportsPlugin from "eslint-plugin-unused-imports";

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
			// Configuración para el plugin de importaciones
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
		plugins: {
			import: importPlugin,
			"unused-imports": unusedImportsPlugin,
		},
		rules: {
			"react/react-in-jsx-scope": "off",

			// Reglas para organizar y limpiar importaciones
			"import/first": "error", // Las importaciones deben estar al principio del archivo
			"import/newline-after-import": "error", // Línea en blanco después de las importaciones
			"import/no-duplicates": "error", // No permitir importaciones duplicadas
			"import/order": [
				"error",
				{
					groups: [
						"builtin", // Módulos de Node.js
						"external", // Paquetes npm
						"internal", // Imports marcados como internos en el proyecto
						"parent", // Imports que comienzan con ..
						"sibling", // Imports que comienzan con .
						"index", // Imports del mismo directorio
						"object", // Imports de tipo object
						"type", // Imports de tipo
					],
					"newlines-between": "always", // Siempre línea en blanco entre grupos
					alphabetize: {
						order: "asc", // Ordenar alfabéticamente
						caseInsensitive: true, // Ignorar mayúsculas y minúsculas
					},
				},
			],

			// Reglas para eliminar importaciones no utilizadas
			"no-unused-vars": "off", // Desactivar la regla estándar
			"unused-imports/no-unused-imports": "error", // Marcar como error las importaciones no utilizadas
			"unused-imports/no-unused-vars": [
				"warn",
				{
					vars: "all", // Comprobar todas las variables
					varsIgnorePattern: "^_", // Ignorar variables que empiezan con _
					args: "after-used", // Comprobar argumentos después de los utilizados
					argsIgnorePattern: "^_", // Ignorar argumentos que empiezan con _
				},
			],

			// Reglas para mantener consistencia en el código
			"@typescript-eslint/no-explicit-any": "warn", // Advertir sobre el uso de 'any'
			"@typescript-eslint/explicit-function-return-type": [
				"warn",
				{
					allowExpressions: true,
					allowTypedFunctionExpressions: true,
				},
			], // Exigir tipos de retorno explícitos en funciones
			"@typescript-eslint/no-unused-vars": "off", // Desactivamos la regla TS en favor de unused-imports
		},
	},
	{
		ignores: [
			"dist",
			"node_modules",
			"**/*.config.js",
			"**/*.config.ts",
			"**/*.cjs",
		], // Ignore build outputs, dependencies and config files
	},
	eslintConfigPrettier,
];
