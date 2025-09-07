"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPhoneNumber = formatPhoneNumber;
exports.extractPhoneNumber = extractPhoneNumber;
exports.isValidPhoneNumber = isValidPhoneNumber;
/**
 * Format phone number for WhatsApp
 * Converts various phone number formats to WhatsApp JID format
 * @param number - Phone number to format
 * @returns Formatted phone number with @s.whatsapp.net suffix
 */
function formatPhoneNumber(number) {
    // Remove all non-digit characters
    let formatted = number.replace(/\D/g, '');
    // Convert local number (starting with 0) to international format
    if (formatted.startsWith('0')) {
        formatted = '62' + formatted.slice(1);
    }
    // Add country code if not present
    if (!formatted.startsWith('62')) {
        formatted = '62' + formatted;
    }
    return formatted + '@s.whatsapp.net';
}
/**
 * Extract phone number from WhatsApp JID
 * @param jid - WhatsApp JID (e.g., "6281234567890@s.whatsapp.net")
 * @returns Plain phone number without suffix
 */
function extractPhoneNumber(jid) {
    return jid.replace('@s.whatsapp.net', '').replace('@g.us', '');
}
/**
 * Validate phone number format
 * @param number - Phone number to validate
 * @returns True if valid phone number format
 */
function isValidPhoneNumber(number) {
    const cleaned = number.replace(/\D/g, '');
    // Check if it's a valid Indonesian number or international format
    return cleaned.length >= 10 && cleaned.length <= 15;
}
//# sourceMappingURL=phoneNumber.js.map