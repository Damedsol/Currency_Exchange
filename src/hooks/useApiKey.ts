import { useCallback, useState } from "react";
import type React from "react";
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
}

export function useApiKey(): UseApiKeyReturn {
	const [apiKeyInput, setApiKeyInput] = useState("");
	const [storedApiKey] = useState<string | null>(null);
	const [isApiKeyValid] = useState(true);
	const [isApiKeyHeaderInputVisible, setIsApiKeyHeaderInputVisible] =
		useState(false);
	const [apiKeySaveStatus, setApiKeySaveStatus] =
		useState<ApiKeySaveStatus>("idle");

	const toggleApiKeyHeaderInput = useCallback(() => {
		setIsApiKeyHeaderInputVisible((v) => !v);
	}, []);

	const handleApiKeyChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const newKey = event.target.value;
			setApiKeyInput(newKey);
			if (newKey === "") {
				setApiKeySaveStatus("idle");
			} else {
				setApiKeySaveStatus("validating");
			}
		},
		[],
	);

	const handleApiKeyInputBlur = useCallback(() => {}, []);

	return {
		apiKeyInput,
		storedApiKey,
		isApiKeyValid,
		isApiKeyHeaderInputVisible,
		apiKeySaveStatus,
		handleApiKeyChange,
		handleApiKeyInputBlur,
		toggleApiKeyHeaderInput,
	};
}
