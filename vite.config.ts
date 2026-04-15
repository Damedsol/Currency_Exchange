import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		host: true, // Ensure Vite listens on all interfaces (0.0.0.0)
		hmr: {
			clientPort: 5173, // Tell the client to connect to port 5173 for HMR
		},
		watch: {
			usePolling: true, // Use polling for file system events if regular watching fails in Docker
			interval: 300, // Check for file changes every 300ms
		},
	},
	build: {
		rolldownOptions: {
			output: {
				manualChunks(id) {
					if (id.includes("node_modules")) {
						if (id.includes("react-dom")) {
							return "react-dom";
						}
						if (id.includes("react") || id.includes("scheduler")) {
							return "react";
						}
						if (id.includes("@fluentui")) {
							return "fluent";
						}
					}
				},
			},
		},
	},
});
