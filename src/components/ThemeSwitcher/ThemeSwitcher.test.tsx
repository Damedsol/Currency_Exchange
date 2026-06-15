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
});
