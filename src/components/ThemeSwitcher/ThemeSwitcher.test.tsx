// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ThemeSwitcher } from "./ThemeSwitcher";

describe("ThemeSwitcher", () => {
	it("shows dark mode active when isDarkMode is true", () => {
		render(<ThemeSwitcher isDarkMode={true} toggleTheme={vi.fn()} />);
		expect(screen.getByText("Dark Mode Active")).toBeDefined();
	});

	it("shows light mode active when isDarkMode is false", () => {
		render(<ThemeSwitcher isDarkMode={false} toggleTheme={vi.fn()} />);
		expect(screen.getByText("Light Mode Active")).toBeDefined();
	});

	it("calls toggleTheme on switch click", async () => {
		const toggle = vi.fn();
		render(<ThemeSwitcher isDarkMode={true} toggleTheme={toggle} />);
		const switchEl = screen.getByRole("switch");
		await userEvent.click(switchEl);
		expect(toggle).toHaveBeenCalledOnce();
	});

	it("renders a weather icon (SVG) when isDarkMode is true", () => {
		const { container } = render(
			<ThemeSwitcher isDarkMode={true} toggleTheme={vi.fn()} />,
		);
		// Fluent UI icons render as SVG elements with class "fui-Icon"
		const iconSVGs = container.querySelectorAll("svg.fui-Icon");
		expect(iconSVGs.length).toBeGreaterThanOrEqual(1);
	});

	it("renders a weather icon (SVG) when isDarkMode is false", () => {
		const { container } = render(
			<ThemeSwitcher isDarkMode={false} toggleTheme={vi.fn()} />,
		);
		const iconSVGs = container.querySelectorAll("svg.fui-Icon");
		expect(iconSVGs.length).toBeGreaterThanOrEqual(1);
	});

	it("changes which icon renders when mode toggles between dark and light", async () => {
		const toggle = vi.fn();
		const { container, rerender } = render(
			<ThemeSwitcher isDarkMode={false} toggleTheme={toggle} />,
		);

		// Light mode — store inner HTML of icon
		const lightSvg = container.querySelector("svg.fui-Icon")?.outerHTML;

		// Re-render in dark mode
		rerender(<ThemeSwitcher isDarkMode={true} toggleTheme={toggle} />);
		const darkSvg = container.querySelector("svg.fui-Icon")?.outerHTML;

		// The icons should be different (sun vs moon have different paths)
		expect(lightSvg).not.toBe(darkSvg);
	});
});
