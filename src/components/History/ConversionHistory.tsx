import type { ConversionHistoryEntry } from "../../services/LocalStorage";
import { Button } from "@fluentui/react-components";
import { HistoryRegular } from "@fluentui/react-icons";

interface ConversionHistoryProps {
	history: ConversionHistoryEntry[];
	onRepeat: (entry: ConversionHistoryEntry) => void;
}

export const ConversionHistory = ({
	history,
	onRepeat,
}: ConversionHistoryProps) => {


	return (
		<div
			style={{
				marginTop: "20px",
				borderTop: "1px solid #ccc",
				paddingTop: "10px",
			}}
		>
			<h3>
				<HistoryRegular style={{ marginRight: "8px" }} />
				Conversion History (Last 10 conversions)
			</h3>
			<ul style={{ listStyle: "none", paddingLeft: 0 }}>
				{history.map((entry) => (
					<li key={entry.timestamp} style={{ marginBottom: "5px" }}>
						<Button
							appearance="subtle"
							onClick={() => onRepeat(entry)}
							title={`Repeat: ${entry.amount} ${entry.fromCurrency} to ${entry.toCurrency}`}
							style={{
								textAlign: "left",
								width: "100%",
								justifyContent: "flex-start",
							}}
						>
							{entry.amount} {entry.fromCurrency} → {entry.result.toFixed(2)}{" "}
							{entry.toCurrency}
							<span
								style={{
									fontSize: "smaller",
									color: "grey",
									marginLeft: "10px",
								}}
							>
								(Rate: {entry.rate.toFixed(4)})
							</span>
						</Button>
					</li>
				))}
			</ul>
		</div>
	);
};
