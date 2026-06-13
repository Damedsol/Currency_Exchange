// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as LocalStorage from "../services/LocalStorage";
import { useApiKey } from "./useApiKey";

vi.mock("../services/LocalStorage", async () => {
	const actual = await vi.importActual("../services/LocalStorage");
	return {
		...actual,
		localStorageFetchService: vi.fn(),
		localStorageStoreService: vi.fn(),
		clearRatesCache: vi.fn(),
	};
});

describe("useApiKey", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("initializes with empty values when no stored key", () => {
		vi.mocked(LocalStorage.localStorageFetchService).mockReturnValue(null);
		const { result } = renderHook(() => useApiKey());
		expect(result.current.storedApiKey).toBeNull();
		expect(result.current.apiKeyInput).toBe("");
		expect(result.current.isApiKeyValid).toBe(true);
		expect(result.current.isApiKeyHeaderInputVisible).toBe(false);
		expect(result.current.apiKeySaveStatus).toBe("idle");
	});

	it("loads stored API key on init if valid format", () => {
		vi.mocked(LocalStorage.localStorageFetchService).mockReturnValue(
			"fca_live_abcdefghijklmnopqrstuvwxyz1",
		);
		const { result } = renderHook(() => useApiKey());
		expect(result.current.storedApiKey).toBe(
			"fca_live_abcdefghijklmnopqrstuvwxyz1",
		);
		expect(result.current.apiKeyInput).toBe(
			"fca_live_abcdefghijklmnopqrstuvwxyz1",
		);
	});

	it("toggles header input visibility", () => {
		vi.mocked(LocalStorage.localStorageFetchService).mockReturnValue(null);
		const { result } = renderHook(() => useApiKey());
		expect(result.current.isApiKeyHeaderInputVisible).toBe(false);
		act(() => result.current.toggleApiKeyHeaderInput());
		expect(result.current.isApiKeyHeaderInputVisible).toBe(true);
		act(() => result.current.toggleApiKeyHeaderInput());
		expect(result.current.isApiKeyHeaderInputVisible).toBe(false);
	});

	it("updates input on change", () => {
		vi.mocked(LocalStorage.localStorageFetchService).mockReturnValue(null);
		const { result } = renderHook(() => useApiKey());
		act(() => {
			result.current.handleApiKeyChange({
				target: { value: "fca_test" },
			} as React.ChangeEvent<HTMLInputElement>);
		});
		expect(result.current.apiKeyInput).toBe("fca_test");
		expect(result.current.apiKeySaveStatus).toBe("validating");
	});

	it("resets status to idle when input is cleared", () => {
		vi.mocked(LocalStorage.localStorageFetchService).mockReturnValue(null);
		const { result } = renderHook(() => useApiKey());
		act(() => {
			result.current.handleApiKeyChange({
				target: { value: "fca_test" },
			} as React.ChangeEvent<HTMLInputElement>);
		});
		act(() => {
			result.current.handleApiKeyChange({
				target: { value: "" },
			} as React.ChangeEvent<HTMLInputElement>);
		});
		expect(result.current.apiKeySaveStatus).toBe("idle");
	});
});
