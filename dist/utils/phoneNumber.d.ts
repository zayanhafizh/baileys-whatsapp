/**
 * Format phone number for WhatsApp
 * Converts various phone number formats to WhatsApp JID format
 * @param number - Phone number to format
 * @returns Formatted phone number with @s.whatsapp.net suffix
 */
export declare function formatPhoneNumber(number: string): string;
/**
 * Extract phone number from WhatsApp JID
 * @param jid - WhatsApp JID (e.g., "6281234567890@s.whatsapp.net")
 * @returns Plain phone number without suffix
 */
export declare function extractPhoneNumber(jid: string): string;
/**
 * Validate phone number format
 * @param number - Phone number to validate
 * @returns True if valid phone number format
 */
export declare function isValidPhoneNumber(number: string): boolean;
//# sourceMappingURL=phoneNumber.d.ts.map