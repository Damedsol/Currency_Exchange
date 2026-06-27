// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
	it("renders message with role status", () => {
		render(<EmptyState message="No data" />);
		expect(screen.getByRole("status")).toBeDefined();
		expect(screen.getByText("No data")).toBeDefined();
	});

	it("renders action button when actionLabel and onAction provided", () => {
		const onAction = vi.fn();
		render(
			<EmptyState message="Empty" actionLabel="Retry" onAction={onAction} />,
		);
		expect(screen.getByText("Retry")).toBeDefined();
	});

	it("does not render action button without actionLabel", () => {
		render(<EmptyState message="Empty" />);
		expect(screen.queryByRole("button")).toBeNull();
	});
});
