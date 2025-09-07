export * from './phoneNumber';
export * from './session';
export * from './databaseAuth';
/**
 * Sleep utility function
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after specified time
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Generate random string
 * @param length - Length of random string
 * @returns Random alphanumeric string
 */
export declare function generateRandomString(length?: number): string;
/**
 * Sanitize string for safe usage
 * @param str - String to sanitize
 * @returns Sanitized string
 */
export declare function sanitizeString(str: string): string;
/**
 * Parse JSON safely with fallback
 * @param jsonString - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export declare function safeJsonParse<T>(jsonString: string, fallback: T): T;
//# sourceMappingURL=index.d.ts.map