/**
 * Fetches the API key from localStorage.
 * @returns {string | null} The API key if found, otherwise null.
 */
export function localStorageFetchService(): string | null {
	try {
		const apiKey = localStorage.getItem("apiKey");
		// Trim whitespace from the fetched key before returning
		return apiKey ? apiKey.trim() : null;
	} catch (error) {
		console.error("Error fetching API key from localStorage:", error);
		// Return null on error to indicate failure without crashing.
		return null;
	}
}

/**
 * Stores the API key in localStorage.
 * @param {string} apiKey The API key to store.
 * @returns {void}
 * @throws {Error} If the API key is empty or if an error occurs during the store operation.
 */

// Regular expression to validate the API key format (Updated to 40 characters)
export const apiKeyRegex = /^fca_live_[a-zA-Z0-9]{40}$/;

export function localStorageStoreService(apiKey: string): void {
	try {
		if (!apiKey) {
			throw new Error("API key cannot be empty.");
		}
		// Validate the format
		const isValid = apiKeyRegex.test(apiKey);
		if (!isValid) {
			throw new Error(
				"Invalid API key format. It should start with 'fca_live_' followed by 40 alphanumeric characters.",
			);
		}
		localStorage.setItem("apiKey", apiKey);
	} catch (error) {
		console.error("Error storing API key in localStorage:", error);
		// Re-throw the error to allow calling code to handle it.
		throw new Error(
			`Failed to store API key: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

/**
 * Clears the API key from localStorage and reloads the page.
 * Note: Reloading the page might be better handled by the UI component that calls this function.
 * @returns {void}
 * @throws {Error} If an error occurs during the clear operation.
 */
export function clearLocalStorage(): void {
	try {
		// Use removeItem for targeted removal instead of clear()
		localStorage.removeItem("apiKey");
		window.location.reload(); // Consider moving this side effect out of the service
	} catch (error) {
		console.error("Error clearing API key from localStorage:", error);
		// Re-throw the error.
		throw new Error(
			`Failed to clear API key: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
