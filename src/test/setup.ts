import { vi } from "vitest";

import "@testing-library/jest-dom/vitest";

Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	}),
});

class BroadcastChannelMock {
	name: string;
	constructor(name: string) {
		this.name = name;
	}
	postMessage(): void {}
	close(): void {}
	addEventListener(): void {}
	removeEventListener(): void {}
}

Object.defineProperty(globalThis, "BroadcastChannel", {
	writable: true,
	value: BroadcastChannelMock,
});
