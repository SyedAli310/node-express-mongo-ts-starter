import path from "path";
import AppConfig from "../config/appconfig";

type LogLevel = "info" | "error" | "warn" | "debug";

type LogFields = Record<string, any>;

type LogMetaData = Record<string, any>;

/**
 * Logs a message with the specified level, message, fields, and metadata.
 * This function is used to log messages to Logtail.
 * @param {LogLevel} level - The level of the log (info, error, warn, debug).
 * @param {string} message - The message to log.
 * @param {LogFields} fields - Additional fields to include in the log.
 * @param {LogMetaData} metaData - Metadata for the log entry.
 * @return {void}
 */
function log(level: LogLevel, message: string, fields: LogFields = {}, metaData: LogMetaData = {}): void {
    if (AppConfig.env !== 'PROD') {
        return;
    }
    const logData = {
        ...fields,
        ...metaData,
    };
    switch (level) {
        case 'info':
            console.info(message, logData);
            break;
        case 'error':
            console.error(message, logData);
            break;
        case 'warn':
            console.warn(message, logData);
            break;
        case 'debug':
            console.debug(message, logData);
            break;
        default:
            console.info(message, logData);
            break;
    }
}

interface ErrorOrigin {
    functionName: string | null;
    file: string;
    line: number;
    column: number;
}

/**
 * Extracts the origin of an error from its stack trace.
 * Returns null if no relevant information is found.
 * @param {Error} error - The error object to extract origin from.
 * @returns {ErrorOrigin | null} - The origin of the error or null.
 */
function getErrorOrigin(error: Error): ErrorOrigin | null {
    if (!error || !error.stack) return null;
    const stackLines = error.stack.split("\n");
    const relevantLine = stackLines.find(line => {
        return (
            line.includes("at ") &&
            !line.includes("node:") &&
            !line.includes("internal/") &&
            !line.includes("logger")
        );
    });
    if (!relevantLine) return null;
    const withFnMatch = relevantLine.match(/\s*at\s+(.*)\s+\((.*):(\d+):(\d+)\)/);
    const withoutFnMatch = relevantLine.match(/\s*at\s+(.*):(\d+):(\d+)/);
    if (withFnMatch) {
        return {
            functionName: withFnMatch[1],
            file: path.basename(withFnMatch[2]),
            line: parseInt(withFnMatch[3], 10),
            column: parseInt(withFnMatch[4], 10),
        };
    }
    if (withoutFnMatch) {
        return {
            functionName: null,
            file: path.basename(withoutFnMatch[1]),
            line: parseInt(withoutFnMatch[2], 10),
            column: parseInt(withoutFnMatch[3], 10),
        };
    }
    return null;
}

// Logger service to handle logging across the application
/**
 * Provides logging methods for different log levels.
 *
 * @remarks
 * The `Logger` object exposes methods to log messages at various severity levels:
 * - `info`: Informational messages
 * - `error`: Error messages
 * - `warn`: Warning messages
 * - `debug`: Debugging messages
 *
 * Each method accepts a message string, optional structured fields, and optional metadata.
 *
 * @example
 * ```typescript
 * Logger.info("User logged in", { userId: 123 });
 * Logger.error("Failed to connect to DB", {}, { retry: true });
 * ```
 *
 * @property info Logs an informational message.
 * @property error Logs an error message.
 * @property warn Logs a warning message.
 * @property debug Logs a debug message.
 * @property getErrorOrigin Retrieves the origin of an error.
 */
const Logger = {
    // Log methods for different levels
    info: (msg: string, fields: LogFields = {}, metaData: LogMetaData = {}) => log("info", msg, fields, metaData),
    error: (msg: string, fields: LogFields = {}, metaData: LogMetaData = {}) => log("error", msg, fields, metaData),
    warn: (msg: string, fields: LogFields = {}, metaData: LogMetaData = {}) => log("warn", msg, fields, metaData),
    debug: (msg: string, fields: LogFields = {}, metaData: LogMetaData = {}) => log("debug", msg, fields, metaData),

    /**
     * Retrieves the origin of an error, including function name, file, line, and column.
     * @param {Error} error - The error object to analyze.
     * @returns {ErrorOrigin | null} - The origin of the error or null if not found.
     */
    getErrorOrigin,
};

export default Logger;
