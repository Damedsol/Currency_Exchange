import React from 'react';
import { Link, makeStyles, shorthands, tokens, Field, Input } from '@fluentui/react-components';

// Styles for the section
const useStyles = makeStyles({
    container: {
        display: "flex",
        flexDirection: "column",
        ...shorthands.gap(tokens.spacingVerticalS),
    },
    link: {
        fontSize: tokens.fontSizeBase200,
        marginTop: `-${tokens.spacingVerticalS}`, // Adjust overlap with Field
        marginBottom: tokens.spacingVerticalM,
        alignSelf: 'flex-start',
    },
});

// Required props
interface ApiKeySectionProps {
    apiKeyInput: string;
    storedApiKey: string | null;
    isApiKeyValid: boolean;
    onApiKeyChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ApiKeySection: React.FC<ApiKeySectionProps> = ({
    apiKeyInput,
    storedApiKey,
    isApiKeyValid,
    onApiKeyChange,
}) => {
    const styles = useStyles();

    // Simplified validation logic based only on format validity and storage status
    const validationState =
        !isApiKeyValid && apiKeyInput !== ""
            ? "error"
            : storedApiKey && apiKeyInput === storedApiKey
                ? "success"
                : isApiKeyValid && apiKeyInput !== ""
                    ? "warning"
                    : "none";

    // Simplified validation messages
    const validationMessage =
        !isApiKeyValid && apiKeyInput !== ""
            ? "Invalid API Key format."
            : storedApiKey && apiKeyInput === storedApiKey
                ? "API Key is valid and stored."
                : isApiKeyValid && apiKeyInput !== ""
                    ? "Valid format. Press Save Key to store."
                    : apiKeyInput === "" && !storedApiKey
                        ? "API Key is required to fetch rates."
                        : "";

    return (
        <div className={styles.container}>
            <Field
                label="Api Key"
                required
                validationState={validationState}
                validationMessage={validationMessage}
                size="large"
            >
                <Input
                    type="password"
                    value={apiKeyInput}
                    onChange={onApiKeyChange}
                    appearance="outline"
                    size="large"
                />
            </Field>
            <p className={styles.link}>
                Get your free API key from{" "}
                <Link
                    href="https://freecurrencyapi.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    freecurrencyapi.com
                </Link>
            </p>
        </div>
    );
}; 