import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
	apiKeyRegex,
	clearRatesCache,
	localStorageFetchService,
	localStorageStoreService,
} from "../services/LocalStorage";
import type { ApiKeySaveStatus } from "../types";

export interface UseApiKeyReturn {
	apiKeyInput: string;
	storedApiKey: string | null;
	isApiKeyValid: boolean;
	isApiKeyHeaderInputVisible: boolean;
	apiKeySaveStatus: ApiKeySaveStatus;
	handleApiKeyChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	handleApiKeyInputBlur: () => void;
	toggleApiKeyHeaderInput: () => void;
	clearApiKey: () => void;
}

export function useApiKey(): UseApiKeyReturn {
	const [apiKeyInput, setApiKeyInput] = useState("");
	const [storedApiKey, setStoredApiKey] = useState<string | null>(null);
	const [isApiKeyValid, setIsApiKeyValid] = useState(true);
	const [isApiKeyHeaderInputVisible, setIsApiKeyHeaderInputVisible] =
		useState(false);
	const [apiKeySaveStatus, setApiKeySaveStatus] =
		useState<ApiKeySaveStatus>("idle");

	const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearSaveTimeout = useCallback(() => {
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
			saveTimeoutRef.current = null;
		}
	}, []);

	const clearBlurTimeout = useCallback(() => {
		if (blurTimeoutRef.current) {
			clearTimeout(blurTimeoutRef.current);
			blurTimeoutRef.current = null;
		}
	}, []);

	// Load stored key on mount
	useEffect(() => {
		const fetchedApiKey = localStorageFetchService();
		if (fetchedApiKey && apiKeyRegex.test(fetchedApiKey)) {
			setStoredApiKey(fetchedApiKey);
			setApiKeyInput(fetchedApiKey);
		}
	}, []);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			clearSaveTimeout();
			clearBlurTimeout();
		};
	}, [clearSaveTimeout, clearBlurTimeout]);

	const toggleApiKeyHeaderInput = useCallback(() => {
		setIsApiKeyHeaderInputVisible((v) => !v);
		clearBlurTimeout();
	}, [clearBlurTimeout]);

	const handleApiKeyChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			clearSaveTimeout();
			const newKey = event.target.value;
			setApiKeyInput(newKey);
			setIsApiKeyValid(true);

			if (newKey === "") {
				setApiKeySaveStatus("idle");
			} else {
				setApiKeySaveStatus("validating");
			}
		},
		[clearSaveTimeout],
	);

	const handleApiKeyInputBlur = useCallback(() => {
		clearBlurTimeout();
		blurTimeoutRef.current = setTimeout(() => {
			setIsApiKeyHeaderInputVisible(false);
		}, 150);
	}, [clearBlurTimeout]);

	const clearApiKey = useCallback(() => {
		clearSaveTimeout();
		setApiKeyInput("");
		setStoredApiKey(null);
		setIsApiKeyValid(true);
		setApiKeySaveStatus("idle");
	}, [clearSaveTimeout]);

	// Debounced save effect
	useEffect(() => {
		if (apiKeyInput === "" || apiKeySaveStatus === "idle") {
			setApiKeySaveStatus("idle");
			return;
		}

		if (apiKeySaveStatus === "validating") {
			clearSaveTimeout();
			saveTimeoutRef.current = setTimeout(async () => {
				const keyToValidate = apiKeyInput.trim();
				if (keyToValidate === "") {
					setApiKeySaveStatus("idle");
					return;
				}

				const isValidFormat = apiKeyRegex.test(keyToValidate);
				setIsApiKeyValid(isValidFormat);

				if (!isValidFormat) {
					setApiKeySaveStatus("invalid");
					return;
				}

				setApiKeySaveStatus("saving");
				try {
					await localStorageStoreService(keyToValidate);
					setStoredApiKey(keyToValidate);
					setApiKeySaveStatus("saved");
					clearRatesCache();
				} catch {
					setApiKeySaveStatus("error");
					setStoredApiKey(null);
				}
			}, 1000);
		}

		return () => {
			clearSaveTimeout();
		};
	}, [apiKeyInput, apiKeySaveStatus, clearSaveTimeout]);

	return {
		apiKeyInput,
		storedApiKey,
		isApiKeyValid,
		isApiKeyHeaderInputVisible,
		apiKeySaveStatus,
		handleApiKeyChange,
		handleApiKeyInputBlur,
		toggleApiKeyHeaderInput,
		clearApiKey,
	};
}
