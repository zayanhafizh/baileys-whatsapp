"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPhoneNumber = formatPhoneNumber;
exports.extractPhoneNumber = extractPhoneNumber;
exports.isValidPhoneNumber = isValidPhoneNumber;
function formatPhoneNumber(number) {
    let formatted = number.replace(/\D/g, '');
    if (formatted.startsWith('0')) {
        formatted = '62' + formatted.slice(1);
    }
    if (!formatted.startsWith('62')) {
        formatted = '62' + formatted;
    }
    return formatted + '@s.whatsapp.net';
}
function extractPhoneNumber(jid) {
    return jid.replace('@s.whatsapp.net', '').replace('@g.us', '');
}
function isValidPhoneNumber(number) {
    const cleaned = number.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
}
//# sourceMappingURL=phoneNumber.js.map