// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAppMessage } from "./useAppMessage";

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
});

describe("useAppMessage", () => {
	it("initializes with hidden message", () => {
		const { result } = renderHook(() => useAppMessage());
		expect(result.current.appMessage.visible).toBe(false);
		expect(result.current.appMessage.text).toBeNull();
	});

	it("shows a message with given text and intent", () => {
		const { result } = renderHook(() => useAppMessage());
		act(() => result.current.showAppMessage("Test message", "warning"));
		expect(result.current.appMessage.visible).toBe(true);
		expect(result.current.appMessage.text).toBe("Test message");
		expect(result.current.appMessage.intent).toBe("warning");
	});

	it("auto-dismisses message after 5 seconds", () => {
		const { result } = renderHook(() => useAppMessage());
		act(() => result.current.showAppMessage("Auto dismiss", "info"));
		expect(result.current.appMessage.visible).toBe(true);
		act(() => {
			vi.advanceTimersByTime(5000);
		});
		expect(result.current.appMessage.visible).toBe(false);
	});

	it("dismissMessage hides the message immediately", () => {
		const { result } = renderHook(() => useAppMessage());
		act(() => result.current.showAppMessage("Dismiss me", "error"));
		expect(result.current.appMessage.visible).toBe(true);
		act(() => result.current.dismissMessage());
		expect(result.current.appMessage.visible).toBe(false);
	});

	it("overrides default timeout when duration is provided", () => {
		const { result } = renderHook(() => useAppMessage());
		act(() => result.current.showAppMessage("Quick dismiss", "success", 1000));
		expect(result.current.appMessage.visible).toBe(true);
		act(() => {
			vi.advanceTimersByTime(1000);
		});
		expect(result.current.appMessage.visible).toBe(false);
	});
});
