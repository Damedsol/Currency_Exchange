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
    saveError: string | null;
    onApiKeyChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ApiKeySection: React.FC<ApiKeySectionProps> = ({
    apiKeyInput,
    storedApiKey,
    isApiKeyValid,
    saveError,
    onApiKeyChange,
}) => {
    const styles = useStyles();

    // Validation logic (same as in App.tsx)
    const validationState =
        saveError || (!isApiKeyValid && apiKeyInput !== "")
            ? "error"
            : storedApiKey && apiKeyInput === storedApiKey
                ? "success"
                : isApiKeyValid && apiKeyInput !== ""
                    ? "warning"
                    : "none";

    const validationMessage =
        saveError
            ? saveError
            : !isApiKeyValid && apiKeyInput !== ""
                ? "Invalid format. Must start with fca_live_ + 40 alphanumeric chars."
                : storedApiKey && apiKeyInput === storedApiKey
                    ? "API Key is valid and stored."
                    : isApiKeyValid && apiKeyInput !== ""
                        ? "Valid format. Press Save to store this key."
                        : apiKeyInput === "" && !storedApiKey
                            ? "API Key is required."
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