import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AppMessage, MessageBarIntent } from "../types";

const MESSAGE_TIMEOUT_DURATION = 5000;

export interface UseAppMessageReturn {
	appMessage: AppMessage;
	showAppMessage: (
		text: React.ReactNode,
		intent: MessageBarIntent,
		duration?: number,
	) => void;
	dismissMessage: () => void;
}

export function useAppMessage(): UseAppMessageReturn {
	const [appMessage, setAppMessage] = useState<AppMessage>({
		text: null,
		intent: "info",
		visible: false,
	});

	const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearMessageTimeout = useCallback(() => {
		if (messageTimeoutRef.current) {
			clearTimeout(messageTimeoutRef.current);
			messageTimeoutRef.current = null;
		}
	}, []);

	const dismissMessage = useCallback(() => {
		clearMessageTimeout();
		setAppMessage((prev) => ({ ...prev, visible: false }));
	}, [clearMessageTimeout]);

	const showAppMessage = useCallback(
		(
			text: React.ReactNode,
			intent: MessageBarIntent,
			duration: number = MESSAGE_TIMEOUT_DURATION,
		) => {
			clearMessageTimeout();
			setAppMessage({ text, intent, visible: true });
			messageTimeoutRef.current = setTimeout(() => {
				dismissMessage();
			}, duration);
		},
		[clearMessageTimeout, dismissMessage],
	);

	useEffect(() => {
		return () => {
			clearMessageTimeout();
		};
	}, [clearMessageTimeout]);

	return { appMessage, showAppMessage, dismissMessage };
}
