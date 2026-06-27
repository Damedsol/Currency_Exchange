// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

describe("ErrorBoundary", () => {
	const Child = () => <div>Child content</div>;
	const Broken = () => {
		throw new Error("Test error");
	};

	it("renders children when no error", () => {
		render(
			<ErrorBoundary>
				<Child />
			</ErrorBoundary>,
		);
		expect(screen.getByText("Child content")).toBeDefined();
	});

	it("renders fallback on error", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		render(
			<ErrorBoundary>
				<Broken />
			</ErrorBoundary>,
		);
		expect(screen.getByText("Something went wrong")).toBeDefined();
		expect(screen.getByText("Test error")).toBeDefined();
		vi.restoreAllMocks();
	});

	it("renders custom fallback when provided", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		render(
			<ErrorBoundary fallback={<div>Custom Fallback</div>}>
				<Broken />
			</ErrorBoundary>,
		);
		expect(screen.getByText("Custom Fallback")).toBeDefined();
		vi.restoreAllMocks();
	});

	it("shows default message when thrown value is not an Error", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const ThrowString = () => {
			throw "string error"; // eslint-disable-line no-throw-literal
		};
		render(
			<ErrorBoundary>
				<ThrowString />
			</ErrorBoundary>,
		);
		expect(screen.getByText("Something went wrong")).toBeDefined();
		expect(screen.getByText("An unexpected error occurred")).toBeDefined();
		vi.restoreAllMocks();
	});
});
