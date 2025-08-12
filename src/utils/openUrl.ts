import { exec } from 'child_process';
import logColor from 'cli-color';
import AppConfig from '../config/appconfig';

/**
 * Safely opens a URL in the user's default browser.
 * 
 * @param url - The URL to open
 * 
 * @param logAction - Whether to log the action of opening the URL
 */
export function openURL(url: string, logAction: boolean = false): void {
    if (AppConfig.isProd) {
        console.log(logColor.yellow("Opening URLs in production is not allowed for security reasons."));
        return;
    }

    // Sanitize and validate URL
    try {
        new URL(url); // This throws if the URL is invalid
    } catch {
        console.error(logColor.red(`Invalid URL provided: "${url}"`));
        return;
    }

    // Choose platform-specific open command
    const command = process.platform === 'win32'
        ? `start ${url}`
        : process.platform === 'darwin'
        ? `open ${url}`
        : `xdg-open ${url}`;

    // Log the action
    if (logAction) {
        console.log(logColor.green(`Opening ${url} in your default browser...`));
    }

    // Execute command to open the URL
    exec(command, (error) => {
        if (error) {
            console.error(logColor.red(`Error opening URL: ${error.message}`));
        }
    });
}
