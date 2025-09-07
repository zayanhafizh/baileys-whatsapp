"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = sleep;
exports.generateRandomString = generateRandomString;
exports.sanitizeString = sanitizeString;
exports.safeJsonParse = safeJsonParse;
// Export all utility functions
__exportStar(require("./phoneNumber"), exports);
__exportStar(require("./session"), exports);
__exportStar(require("./databaseAuth"), exports);
/**
 * Sleep utility function
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after specified time
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Generate random string
 * @param length - Length of random string
 * @returns Random alphanumeric string
 */
function generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
/**
 * Sanitize string for safe usage
 * @param str - String to sanitize
 * @returns Sanitized string
 */
function sanitizeString(str) {
    return str.replace(/[<>\"'&]/g, '');
}
/**
 * Parse JSON safely with fallback
 * @param jsonString - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
function safeJsonParse(jsonString, fallback) {
    try {
        return JSON.parse(jsonString);
    }
    catch {
        return fallback;
    }
}
//# sourceMappingURL=index.js.map