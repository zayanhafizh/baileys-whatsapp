"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionController = void 0;
const services_1 = require("@/services");
const utils_1 = require("@/utils");
const middleware_1 = require("@/middleware");
/**
 * Session Controller
 * Handles all session-related API endpoints
 */
class SessionController {
}
exports.SessionController = SessionController;
_a = SessionController;
/**
 * GET /sessions - List all active sessions
 */
SessionController.listSessions = (0, middleware_1.asyncHandler)(async (req, res) => {
    const sessions = services_1.WhatsAppService.getSessions();
    const sessionList = [];
    for (const [sessionId] of sessions) {
        sessionList.push({
            id: sessionId,
            status: (0, utils_1.getSessionStatus)(sessionId, sessions)
        });
    }
    res.json(sessionList);
});
/**
 * GET /sessions/:sessionId - Find specific session
 */
SessionController.findSession = (0, middleware_1.asyncHandler)(async (req, res) => {
    const { sessionId } = req.params;
    const sessions = services_1.WhatsAppService.getSessions();
    if (sessions.has(sessionId)) {
        res.json({
            success: true,
            message: 'Session found',
            data: {
                id: sessionId,
                status: (0, utils_1.getSessionStatus)(sessionId, sessions)
            }
        });
    }
    else {
        res.status(404).json({
            success: false,
            message: 'Session not found'
        });
    }
});
/**
 * GET /sessions/:sessionId/status - Get session status
 */
SessionController.getSessionStatus = (0, middleware_1.asyncHandler)(async (req, res) => {
    const { sessionId } = req.params;
    const sessions = services_1.WhatsAppService.getSessions();
    const sessionQRs = services_1.WhatsAppService.getSessionQRs();
    const status = (0, utils_1.getSessionStatus)(sessionId, sessions);
    const qr = sessionQRs.get(sessionId);
    const response = { status };
    // Include QR code if available and not authenticated
    if (qr && status !== 'AUTHENTICATED') {
        response.qr = qr;
    }
    res.json(response);
});
/**
 * GET /sessions/:sessionId/qr - Get QR code for session
 */
SessionController.getQRCode = (0, middleware_1.asyncHandler)(async (req, res) => {
    const { sessionId } = req.params;
    const sessions = services_1.WhatsAppService.getSessions();
    const sessionQRs = services_1.WhatsAppService.getSessionQRs();
    if (!sessions.has(sessionId)) {
        return res.status(404).json({
            success: false,
            message: 'Session not found'
        });
    }
    const sessionData = sessions.get(sessionId);
    // If already authenticated, no QR needed
    if (sessionData.isAuthenticated) {
        return res.json({
            success: true,
            message: 'Session already authenticated',
            status: 'AUTHENTICATED'
        });
    }
    const qr = sessionQRs.get(sessionId);
    if (qr) {
        const response = {
            success: true,
            qr: qr,
            message: 'Scan QR code with WhatsApp',
            sessionId: sessionId,
            status: (0, utils_1.getSessionStatus)(sessionId, sessions)
        };
        res.json(response);
    }
    else {
        const response = {
            success: false,
            message: 'QR code not available yet',
            sessionId: sessionId,
            status: (0, utils_1.getSessionStatus)(sessionId, sessions)
        };
        res.json(response);
    }
});
/**
 * POST /sessions/add - Add new session
 */
SessionController.addSession = (0, middleware_1.asyncHandler)(async (req, res) => {
    const { sessionId, ...options } = req.body;
    if (!sessionId) {
        return res.status(400).json({
            success: false,
            message: 'Session ID is required'
        });
    }
    if (!(0, utils_1.isValidSessionId)(sessionId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid session ID format'
        });
    }
    const sessions = services_1.WhatsAppService.getSessions();
    const sessionQRs = services_1.WhatsAppService.getSessionQRs();
    // Check if session already exists
    if (sessions.has(sessionId)) {
        const existingSession = sessions.get(sessionId);
        // If session is authenticated, return success immediately
        if (existingSession.isAuthenticated) {
            return res.json({
                success: true,
                message: 'Session already authenticated',
                sessionId: sessionId,
                status: 'AUTHENTICATED'
            });
        }
        // If session exists but not authenticated, check if QR is available
        const existingQR = sessionQRs.get(sessionId);
        if (existingQR) {
            return res.json({
                success: true,
                qr: existingQR,
                message: 'Session exists, scan QR code to authenticate',
                sessionId: sessionId,
                status: (0, utils_1.getSessionStatus)(sessionId, sessions)
            });
        }
        console.log(`[${sessionId}] Session exists but no QR available, recreating...`);
    }
    console.log(`[${sessionId}] Creating new WhatsApp connection...`);
    try {
        // Create or recreate the session
        await services_1.WhatsAppService.createConnection(sessionId, options);
        // Wait for QR code generation
        const qrResult = await services_1.WhatsAppService.waitForQR(sessionId);
        if (qrResult === 'authenticated') {
            return res.json({
                success: true,
                message: 'Session authenticated successfully',
                sessionId: sessionId,
                status: 'AUTHENTICATED'
            });
        }
        else if (qrResult) {
            return res.json({
                success: true,
                qr: qrResult,
                message: 'QR code generated successfully',
                sessionId: sessionId,
                status: (0, utils_1.getSessionStatus)(sessionId, sessions)
            });
        }
        else {
            // QR timeout - check current status
            const currentStatus = (0, utils_1.getSessionStatus)(sessionId, sessions);
            const session = sessions.get(sessionId);
            console.log(`[${sessionId}] QR generation timeout. Current status: ${currentStatus}`);
            return res.json({
                success: false,
                message: 'QR code generation timeout. Check your internet connection and try again.',
                sessionId: sessionId,
                status: currentStatus,
                debug: {
                    hasSession: !!session,
                    hasSocket: !!session?.socket,
                    hasWebSocket: !!session?.socket?.ws
                }
            });
        }
    }
    catch (error) {
        console.error(`Error adding session:`, error);
        res.status(500).json({
            success: false,
            message: 'Failed to add session',
            error: error.message
        });
    }
});
/**
 * DELETE /sessions/:sessionId - Delete session
 */
SessionController.deleteSession = (0, middleware_1.asyncHandler)(async (req, res) => {
    const { sessionId } = req.params;
    try {
        await services_1.WhatsAppService.deleteSession(sessionId);
        res.json({
            success: true,
            message: 'Session deleted'
        });
    }
    catch (error) {
        console.error('Error deleting session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete session',
            error: error.message
        });
    }
});
/**
 * GET /sessions-history - Get sessions history
 */
SessionController.getSessionsHistory = (0, middleware_1.asyncHandler)(async (req, res) => {
    const { page = '1', limit = '20' } = req.query;
    try {
        const result = await services_1.DatabaseService.getSessionsHistory(parseInt(page), parseInt(limit));
        res.json({
            success: true,
            ...result
        });
    }
    catch (error) {
        console.error('Error fetching sessions history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sessions history',
            error: error.message
        });
    }
});
//# sourceMappingURL=sessionController.js.map