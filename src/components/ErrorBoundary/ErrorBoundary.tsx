import React from "react";

interface ErrorBoundaryProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	override render(): React.ReactNode {
		if (this.state.hasError) {
			return (
				this.props.fallback ?? (
					<div role="alert" style={{ padding: "16px", textAlign: "center" }}>
						<h2>Something went wrong</h2>
						<p>{this.state.error?.message ?? "An unexpected error occurred"}</p>
					</div>
				)
			);
		}
		return this.props.children;
	}
}
