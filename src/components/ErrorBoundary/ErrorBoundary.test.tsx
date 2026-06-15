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
});
