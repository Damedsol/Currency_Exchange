// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "./useTheme";

function wrapper(props: { children: ReactNode }): React.JSX.Element {
	return createElement(ThemeProvider, null, props.children);
}

describe("useTheme", () => {
	afterEach(() => {
		localStorage.clear();
		vi.restoreAllMocks();
	});

	it("provides default dark mode based on localStorage", () => {
		localStorage.setItem("themePreference", "dark");
		const { result } = renderHook(() => useTheme(), { wrapper });
		expect(result.current.isDarkMode).toBe(true);
	});

	it("provides default light mode based on localStorage", () => {
		localStorage.setItem("themePreference", "light");
		const { result } = renderHook(() => useTheme(), { wrapper });
		expect(result.current.isDarkMode).toBe(false);
	});

	it("toggleTheme switches between dark and light", () => {
		localStorage.setItem("themePreference", "dark");
		const { result } = renderHook(() => useTheme(), { wrapper });
		expect(result.current.isDarkMode).toBe(true);
		act(() => result.current.toggleTheme());
		expect(result.current.isDarkMode).toBe(false);
	});

	it("persists theme preference to localStorage on toggle", () => {
		localStorage.setItem("themePreference", "dark");
		const { result } = renderHook(() => useTheme(), { wrapper });
		act(() => result.current.toggleTheme());
		expect(localStorage.getItem("themePreference")).toBe("light");
	});

	it("toggleTheme can switch from light back to dark", () => {
		localStorage.setItem("themePreference", "light");
		const { result } = renderHook(() => useTheme(), { wrapper });
		act(() => result.current.toggleTheme());
		expect(result.current.isDarkMode).toBe(true);
		expect(localStorage.getItem("themePreference")).toBe("dark");
	});

	it("provides the current theme object", () => {
		localStorage.setItem("themePreference", "dark");
		const { result } = renderHook(() => useTheme(), { wrapper });
		expect(result.current.theme).toBeDefined();
		expect(typeof result.current.theme).toBe("object");
	});

	it("throws when used outside ThemeProvider", () => {
		expect(() => renderHook(() => useTheme())).toThrow(
			"useTheme must be used within a ThemeProvider",
		);
	});

	it("ignores system theme change when localStorage preference is set", () => {
		localStorage.setItem("themePreference", "dark");
		const listeners = new Set<(e: MediaQueryListEvent) => void>();
		vi.stubGlobal(
			"matchMedia",
			vi.fn().mockImplementation((query: string) => ({
				matches: query.includes("dark"),
				addEventListener: (
					_event: string,
					cb: (e: MediaQueryListEvent) => void,
				) => void listeners.add(cb),
				removeEventListener: (
					_event: string,
					cb: (e: MediaQueryListEvent) => void,
				) => void listeners.delete(cb),
			})),
		);
		const { result } = renderHook(() => useTheme(), { wrapper });
		expect(result.current.isDarkMode).toBe(true);

		// System tries to change to light, but localStorage preference should override
		act(() => {
			listeners.forEach((cb) => cb({ matches: false } as MediaQueryListEvent));
		});
		// Should still be dark because localStorage preference is set
		expect(result.current.isDarkMode).toBe(true);
	});

	it("reacts to system theme change when no localStorage preference", () => {
		localStorage.removeItem("themePreference");
		const listeners = new Set<(e: MediaQueryListEvent) => void>();
		vi.stubGlobal(
			"matchMedia",
			vi.fn().mockImplementation((query: string) => ({
				matches: query.includes("dark"),
				addEventListener: (
					_event: string,
					cb: (e: MediaQueryListEvent) => void,
				) => void listeners.add(cb),
				removeEventListener: (
					_event: string,
					cb: (e: MediaQueryListEvent) => void,
				) => void listeners.delete(cb),
			})),
		);
		const { result } = renderHook(() => useTheme(), { wrapper });
		expect(result.current.isDarkMode).toBe(true);

		act(() => {
			listeners.forEach((cb) => cb({ matches: false } as MediaQueryListEvent));
		});
		expect(result.current.isDarkMode).toBe(false);

		vi.restoreAllMocks();
	});

	it("uses light mode when system prefers light and no localStorage preference", () => {
		localStorage.removeItem("themePreference");
		vi.stubGlobal(
			"matchMedia",
			vi.fn().mockImplementation(() => ({
				matches: false,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
			})),
		);
		const { result } = renderHook(() => useTheme(), { wrapper });
		expect(result.current.isDarkMode).toBe(false);
		vi.restoreAllMocks();
	});
});
