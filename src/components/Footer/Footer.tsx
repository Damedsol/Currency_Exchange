import { makeStyles, tokens } from "@fluentui/react-components";
import React from "react";

const useStyles = makeStyles({
	footer: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		gap: tokens.spacingVerticalS,
		marginTop: tokens.spacingVerticalXXL,
		paddingTop: tokens.spacingVerticalL,
		paddingBottom: tokens.spacingVerticalL,
		paddingLeft: tokens.spacingHorizontalL,
		paddingRight: tokens.spacingHorizontalL,
		fontFamily: tokens.fontFamilyMonospace,
		fontSize: tokens.fontSizeBase200,
		color: tokens.colorNeutralForeground3,
		borderTop: "var(--card-border-subtle)",
	},
	content: {
		display: "flex",
		flexWrap: "wrap",
		justifyContent: "center",
		alignItems: "center",
		gap: tokens.spacingHorizontalS,
	},
	attribution: {
		margin: 0,
	},
	links: {
		display: "flex",
		gap: tokens.spacingHorizontalL,
	},
	link: {
		color: tokens.colorNeutralForeground3,
		textDecoration: "none",
		borderBottom: "1px solid transparent",
		transitionProperty: "color, border-bottom-color",
		transitionDuration: "0.2s",
		transitionTimingFunction: "ease",
		":hover": {
			color: tokens.colorBrandForeground1,
			borderBottomColor: tokens.colorBrandForeground1,
		},
		":focus-visible": {
			outline: "2px solid transparent",
			outlineOffset: "2px",
			borderRadius: tokens.borderRadiusMedium,
			boxShadow: `0 0 0 2px ${tokens.colorNeutralBackground1}, 0 0 0 4px ${tokens.colorCompoundBrandStroke}`,
		},
	},
});

const GITHUB_URL = "https://github.com/Damedsol/currencyExchange";
const README_URL = "https://github.com/Damedsol/currencyExchange#readme";
const LINKEDIN_URL = "https://www.linkedin.com/in/david-medina-soloza/";
const LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/";

export const Footer: React.FC = () => {
	const styles = useStyles();
	const year = new Date().getFullYear();

	return (
		<footer className={styles.footer}>
			<div className={styles.content}>
				<p className={styles.attribution}>
					{year}{" "}
					<a
						className={styles.link}
						href={GITHUB_URL}
						target="_blank"
						rel="noopener noreferrer"
					>
						Damedsol
					</a>{" "}
					· Licensed under{" "}
					<a
						className={styles.link}
						href={LICENSE_URL}
						target="_blank"
						rel="noopener noreferrer"
					>
						CC BY 4.0
					</a>
				</p>
				<nav className={styles.links} aria-label="External links">
					<a
						className={styles.link}
						href={GITHUB_URL}
						target="_blank"
						rel="noopener noreferrer"
					>
						GitHub
					</a>
					<a
						className={styles.link}
						href={README_URL}
						target="_blank"
						rel="noopener noreferrer"
					>
						README
					</a>
					<a
						className={styles.link}
						href={LINKEDIN_URL}
						target="_blank"
						rel="noopener noreferrer"
					>
						LinkedIn
					</a>
				</nav>
			</div>
		</footer>
	);
};
