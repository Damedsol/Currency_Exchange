import type { MessageBarIntent } from "@fluentui/react-components";

export type RateSource = "idle" | "cache" | "api" | "error" | "loading";

export type ApiKeySaveStatus =
	| "idle"
	| "validating"
	| "saving"
	| "saved"
	| "invalid"
	| "error";

export interface AppMessage {
	text: string;
	intent: MessageBarIntent;
	visible: boolean;
}

export interface ConversionState {
	amount: number;
	fromCurrency: string;
	toCurrency: string;
	rate: number;
	rateSource: RateSource;
}

export type { MessageBarIntent };
