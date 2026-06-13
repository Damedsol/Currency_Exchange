// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { CurrencySelector } from "./CurrencySelector";

describe("CurrencySelector render", () => {
	it("exports a component", () => {
		expect(CurrencySelector).toBeDefined();
	});
});
