import React from 'react';
import { Label, makeStyles, shorthands, tokens } from '@fluentui/react-components';
import { RateSourceIndicator } from '../RateSourceIndicator/RateSourceIndicator';

// Section styles
const useStyles = makeStyles({
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start", // Align left
        ...shorthands.gap(tokens.spacingVerticalS),
    },
    rateRow: {
        display: "flex",
        alignItems: "center",
        ...shorthands.gap(tokens.spacingHorizontalXS), // Gap between rate label and indicator
    },
});

// Required props
type RateSource = "idle" | "cache" | "api" | "error" | "loading";
interface ResultSectionProps {
    rate: number | "--";
    rateSource: RateSource;
    amount: number;
    fromCurrency: string;
    toCurrency: string;
}

export const ResultSection: React.FC<ResultSectionProps> = ({
    rate,
    rateSource,
    amount,
    fromCurrency,
    toCurrency,
}) => {
    const styles = useStyles();

    return (
        <div className={styles.container}>
            {/* Row for rate and indicator */}
            <div className={styles.rateRow}>
                <Label
                    size={"large"}
                >
                    {`Rate: ${typeof rate === "number" ? rate.toFixed(4) : "--"}`}
                </Label>
                <RateSourceIndicator rateSource={rateSource} />
            </div>
            {/* Show conversion result if rate is valid */}
            {typeof rate === "number" && amount > 0 && (
                <Label
                    size={"large"}
                >
                    {`${amount} ${fromCurrency} = ${(amount * rate).toFixed(2)} ${toCurrency}`}
                </Label>
            )}
        </div>
    );
}; 