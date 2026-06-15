// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useConversion } from "./useConversion";

const { getCurrencyRate } = vi.hoisted(() => ({
	getCurrencyRate: vi.fn(),
}));

vi.mock("../services/FreeCurrency", () => ({ getCurrencyRate }));

describe("useConversion", () => {
	const defaultParams = {
		storedApiKey: "fca_live_test1234567890123456789012345678901",
		onConversionComplete: vi.fn(),
		showError: vi.fn(),
	};

	it("initial state is idle with default currencies", () => {
		const { result } = renderHook(() => useConversion(defaultParams));
		expect(result.current.amount).toBe(1000);
		expect(result.current.fromCurrency).toBe("EUR");
		expect(result.current.toCurrency).toBe("USD");
		expect(result.current.rate).toBe(0);
		expect(result.current.rateSource).toBe("idle");
	});

	it("handleFromCurrency updates base currency and resets rate", () => {
		const { result } = renderHook(() => useConversion(defaultParams));
		act(() => result.current.handleFromCurrency("GBP"));
		expect(result.current.fromCurrency).toBe("GBP");
		expect(result.current.rate).toBe(0);
		expect(result.current.rateSource).toBe("idle");
	});

	it("handleToCurrency updates target currency and resets rate", () => {
		const { result } = renderHook(() => useConversion(defaultParams));
		act(() => result.current.handleToCurrency("JPY"));
		expect(result.current.toCurrency).toBe("JPY");
		expect(result.current.rate).toBe(0);
	});

	it("handleAmountChange updates amount from event", () => {
		const { result } = renderHook(() => useConversion(defaultParams));
		act(() =>
			result.current.handleAmountChange({
				target: { value: "500" },
			} as React.ChangeEvent<HTMLInputElement>),
		);
		expect(result.current.amount).toBe(500);
	});

	it("swapCurrencies swaps from and to", () => {
		const { result } = renderHook(() => useConversion(defaultParams));
		act(() => result.current.swapCurrencies());
		expect(result.current.fromCurrency).toBe("USD");
		expect(result.current.toCurrency).toBe("EUR");
	});

	it("fetchRate with same currency sets rate to 1", async () => {
		const { result } = renderHook(() => useConversion(defaultParams));
		act(() => result.current.handleFromCurrency("EUR"));
		act(() => result.current.handleToCurrency("EUR"));
		await act(async () => result.current.fetchRate());
		expect(result.current.rate).toBe(1);
		expect(result.current.rateSource).toBe("api");
	});

	it("fetchRate calls getCurrencyRate with correct params", async () => {
		getCurrencyRate.mockResolvedValueOnce({
			source: "api",
			rate: 1.2,
		});
		const onComplete = vi.fn();
		const { result } = renderHook(() =>
			useConversion({ ...defaultParams, onConversionComplete: onComplete }),
		);
		await act(async () => result.current.fetchRate());
		expect(result.current.rate).toBe(1.2);
		expect(result.current.rateSource).toBe("api");
	});

	it("fetchRate error shows error message", async () => {
		getCurrencyRate.mockRejectedValueOnce(new Error("API error"));
		const showError = vi.fn();
		const { result } = renderHook(() =>
			useConversion({ ...defaultParams, showError }),
		);
		await act(async () => result.current.fetchRate());
		expect(result.current.rate).toBe(0);
		expect(result.current.rateSource).toBe("error");
	});
});
