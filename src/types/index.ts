import type { MessageBarIntent } from "@fluentui/react-components";
import type React from "react";

export type RateSource = "idle" | "cache" | "api" | "error" | "loading";

export type ApiKeySaveStatus =
	| "idle"
	| "validating"
	| "saving"
	| "saved"
	| "invalid"
	| "error";

export interface AppMessage {
	text: React.ReactNode | null;
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
