// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import {
	loadInitialHistory,
	useConversionHistory,
} from "./useConversionHistory";

beforeEach(() => {
	localStorage.clear();
	vi.restoreAllMocks();
});

describe("useConversionHistory", () => {
	it("initializes with empty history", () => {
		const { result } = renderHook(() => useConversionHistory([]));
		expect(result.current.conversionHistory).toEqual([]);
	});

	it("initializes with preloaded history", () => {
		const entry = {
			fromCurrency: "USD",
			toCurrency: "EUR",
			amount: 100,
			rate: 0.925,
			result: 92.5,
			timestamp: 1000,
		};
		const { result } = renderHook(() => useConversionHistory([entry]));
		expect(result.current.conversionHistory).toHaveLength(1);
		expect(result.current.conversionHistory[0]!.fromCurrency).toBe("USD");
	});

	it("addEntry adds to the beginning and persists", () => {
		const { result } = renderHook(() => useConversionHistory([]));
		const entry = {
			fromCurrency: "GBP",
			toCurrency: "JPY",
			amount: 50,
			rate: 180.5,
			result: 9025,
			timestamp: 2000,
		};
		act(() => result.current.addEntry(entry));
		expect(result.current.conversionHistory).toHaveLength(1);
		const loaded = loadInitialHistory();
		expect(loaded).toHaveLength(1);
		expect(loaded[0]!.fromCurrency).toBe("GBP");
	});

	it("limits to 10 entries", () => {
		const { result } = renderHook(() => useConversionHistory([]));
		for (let i = 0; i < 15; i++) {
			act(() =>
				result.current.addEntry({
					fromCurrency: "USD",
					toCurrency: "EUR",
					amount: 100 + i,
					rate: 0.925,
					result: 92.5 + i,
					timestamp: 1000 + i,
				}),
			);
		}
		expect(result.current.conversionHistory).toHaveLength(10);
	});

	it("clearConversionHistory empties the list and storage", () => {
		const { result } = renderHook(() => useConversionHistory([]));
		act(() =>
			result.current.addEntry({
				fromCurrency: "USD",
				toCurrency: "EUR",
				amount: 100,
				rate: 0.925,
				result: 92.5,
				timestamp: 1000,
			}),
		);
		expect(result.current.conversionHistory).toHaveLength(1);
		act(() => result.current.clearConversionHistory());
		expect(result.current.conversionHistory).toEqual([]);
		expect(loadInitialHistory()).toEqual([]);
	});
});
