/**
 * Format phone number for WhatsApp
 * Converts various phone number formats to WhatsApp JID format
 * @param number - Phone number to format
 * @returns Formatted phone number with @s.whatsapp.net suffix
 */
export function formatPhoneNumber(number: string): string {
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
export function extractPhoneNumber(jid: string): string {
  return jid.replace('@s.whatsapp.net', '').replace('@g.us', '');
}

/**
 * Validate phone number format
 * @param number - Phone number to validate
 * @returns True if valid phone number format
 */
export function isValidPhoneNumber(number: string): boolean {
  const cleaned = number.replace(/\D/g, '');
  // Check if it's a valid Indonesian number or international format
  return cleaned.length >= 10 && cleaned.length <= 15;
} 