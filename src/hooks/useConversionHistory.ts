import { useCallback, useState } from "react";

import type { ConversionHistoryEntry } from "../services/LocalStorage";
import {
	loadConversionHistoryService,
	saveConversionHistoryService,
} from "../services/LocalStorage";

export interface UseConversionHistoryReturn {
	conversionHistory: ConversionHistoryEntry[];
	addEntry: (entry: ConversionHistoryEntry) => void;
	clearConversionHistory: () => void;
}

export function useConversionHistory(
	init: ConversionHistoryEntry[],
): UseConversionHistoryReturn {
	const [conversionHistory, setConversionHistory] =
		useState<ConversionHistoryEntry[]>(init);

	const addEntry = useCallback((entry: ConversionHistoryEntry) => {
		setConversionHistory((prev) => {
			const updated = [entry, ...prev].slice(0, 10);
			saveConversionHistoryService(updated);
			return updated;
		});
	}, []);

	const clearConversionHistory = useCallback(() => {
		setConversionHistory([]);
		saveConversionHistoryService([]);
	}, []);

	return { conversionHistory, addEntry, clearConversionHistory };
}

export function loadInitialHistory(): ConversionHistoryEntry[] {
	return loadConversionHistoryService();
}
