// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RateSourceIndicator } from "./RateSourceIndicator";

describe("RateSourceIndicator", () => {
	it("renders nothing when idle", () => {
		const { container } = render(<RateSourceIndicator rateSource="idle" />);
		expect(container.textContent).toBe("");
	});

	it("renders a Spinner for loading state", () => {
		const { container } = render(<RateSourceIndicator rateSource="loading" />);
		// Spinner renders with role="progressbar"
		const spinner = container.querySelector('[role="progressbar"]');
		expect(spinner).not.toBeNull();
	});

	it('renders "(cached)" indicator', () => {
		render(<RateSourceIndicator rateSource="cache" />);
		expect(screen.getByText("(cached)")).toBeDefined();
	});

	it('renders "(live)" indicator', () => {
		render(<RateSourceIndicator rateSource="api" />);
		expect(screen.getByText("(live)")).toBeDefined();
	});

	it('renders "Error fetching rate" text', () => {
		render(<RateSourceIndicator rateSource="error" />);
		expect(screen.getByText("Error fetching rate")).toBeDefined();
	});
});
