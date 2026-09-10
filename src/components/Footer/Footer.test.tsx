// @vitest-environment jsdom

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Footer } from "./Footer";

describe("Footer component", () => {
	it("renders a semantic footer element", () => {
		const { container } = render(<Footer />);
		expect(container.querySelector("footer")).not.toBeNull();
	});

	it("renders CC attribution without year", () => {
		render(<Footer />);
		const year = new Date().getFullYear();
		expect(screen.queryByText("©")).toBeNull();
		expect(screen.queryByText(/Created by/)).toBeNull();
		expect(screen.queryByText(new RegExp(`${year}`))).toBeNull();
		expect(screen.getByText("Damedsol")).toBeDefined();
		expect(screen.getByText("CC BY 4.0")).toBeDefined();
		expect(screen.getByText(/Licensed under/)).toBeDefined();
	});

	it("renders license link to CC BY 4.0", () => {
		render(<Footer />);
		const license = screen.getByText("CC BY 4.0");
		expect(license.closest("a")?.getAttribute("href")).toBe(
			"https://creativecommons.org/licenses/by/4.0/",
		);
	});

	it("renders a README link to the GitHub README", () => {
		render(<Footer />);
		const readme = screen.getByText("README");
		expect(readme.closest("a")?.getAttribute("href")).toBe(
			"https://github.com/Damedsol/currencyExchange#readme",
		);
		expect(readme.closest("a")?.getAttribute("target")).toBe("_blank");
		const rel = readme.closest("a")?.getAttribute("rel") ?? "";
		expect(rel).toContain("noopener");
		expect(rel).toContain("noreferrer");
	});

	it("renders nav links in README, GitHub, LinkedIn order", () => {
		render(<Footer />);
		const nav = screen.getByRole("navigation", { name: "External links" });
		const names = within(nav)
			.getAllByRole("link")
			.map((link) => link.textContent);
		expect(names).toEqual(["README", "GitHub", "LinkedIn"]);
	});

	it("renders 16px decorative brand icons for GitHub and LinkedIn", () => {
		const { container } = render(<Footer />);
		const icons = container.querySelectorAll('footer svg[aria-hidden="true"]');
		expect(icons).toHaveLength(2);
		for (const icon of icons) {
			expect(icon.getAttribute("width")).toBe("16");
			expect(icon.getAttribute("height")).toBe("16");
		}
	});

	it("renders GitHub and LinkedIn external links", () => {
		render(<Footer />);
		const github = screen.getByText("GitHub");
		const linkedin = screen.getByText("LinkedIn");
		expect(github.closest("a")?.getAttribute("href")).toBe(
			"https://github.com/Damedsol/currencyExchange",
		);
		expect(linkedin.closest("a")?.getAttribute("href")).toBe(
			"https://www.linkedin.com/in/david-medina-soloza/",
		);
	});

	it("external links open in new tab with noopener noreferrer", () => {
		render(<Footer />);
		const links = screen.getAllByRole("link");
		expect(links).toHaveLength(5);
		for (const link of links) {
			expect(link.getAttribute("target")).toBe("_blank");
			const rel = link.getAttribute("rel") ?? "";
			expect(rel).toContain("noopener");
			expect(rel).toContain("noreferrer");
		}
	});
});
