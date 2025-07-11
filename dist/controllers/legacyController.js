"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegacyController = void 0;
const services_1 = require("@/services");
const utils_1 = require("@/utils");
const middleware_1 = require("@/middleware");
class LegacyController {
}
exports.LegacyController = LegacyController;
_a = LegacyController;
LegacyController.getStatus = (0, middleware_1.asyncHandler)(async (req, res) => {
    const sessions = services_1.WhatsAppService.getSessions();
    const activeSessions = Array.from(sessions.entries()).map(([id, data]) => ({
        id,
        status: (0, utils_1.getSessionStatus)(id, sessions),
        isAuthenticated: data.isAuthenticated
    }));
    res.json({
        success: true,
        sessions: activeSessions,
        totalSessions: sessions.size
    });
});
LegacyController.getQR = (0, middleware_1.asyncHandler)(async (req, res) => {
    const { sessionId } = req.query;
    if (!sessionId || typeof sessionId !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Session ID is required'
        });
    }
    const sessions = services_1.WhatsAppService.getSessions();
    const sessionQRs = services_1.WhatsAppService.getSessionQRs();
    const qr = sessionQRs.get(sessionId);
    if (qr) {
        res.json({
            success: true,
            qr,
            message: 'Scan QR code dengan WhatsApp Anda',
            sessionId
        });
    }
    else if (sessions.has(sessionId) && sessions.get(sessionId).isAuthenticated) {
        res.json({
            success: true,
            message: 'WhatsApp sudah terhubung',
            sessionId
        });
    }
    else {
        res.json({
            success: false,
            message: 'QR code belum tersedia, tunggu sebentar...',
            sessionId
        });
    }
});
//# sourceMappingURL=legacyController.js.map