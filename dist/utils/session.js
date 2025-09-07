"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionStatus = getSessionStatus;
exports.generateSessionId = generateSessionId;
exports.isValidSessionId = isValidSessionId;
exports.getSessionUptime = getSessionUptime;
exports.formatSessionUptime = formatSessionUptime;
/**
 * Get session status from session data
 * @param sessionId - Session identifier
 * @param sessions - Map of active sessions
 * @returns Current session status
 */
function getSessionStatus(sessionId, sessions) {
    const session = sessions.get(sessionId);
    if (!session)
        return 'DISCONNECTED';
    if (session.isAuthenticated)
        return 'AUTHENTICATED';
    // Check WebSocket status more thoroughly
    if (session.socket?.ws) {
        const wsState = session.socket.ws?.readyState;
        switch (wsState) {
            case 0: return 'CONNECTING';
            case 1: return 'CONNECTED';
            case 2: return 'CLOSING';
            case 3: return 'DISCONNECTED';
            default: return 'DISCONNECTED';
        }
    }
    return 'DISCONNECTED';
}
/**
 * Generate unique session ID
 * @param prefix - Optional prefix for session ID
 * @returns Unique session identifier
 */
function generateSessionId(prefix = 'session') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}`;
}
/**
 * Validate session ID format
 * @param sessionId - Session ID to validate
 * @returns True if valid session ID format
 */
function isValidSessionId(sessionId) {
    // Session ID should be alphanumeric with underscores/hyphens
    const sessionIdRegex = /^[a-zA-Z0-9_-]+$/;
    return sessionIdRegex.test(sessionId) && sessionId.length >= 3 && sessionId.length <= 50;
}
/**
 * Get session uptime in milliseconds
 * @param session - Session data
 * @returns Uptime in milliseconds
 */
function getSessionUptime(session) {
    return Date.now() - session.startTime;
}
/**
 * Format session uptime for display
 * @param session - Session data
 * @returns Formatted uptime string
 */
function formatSessionUptime(session) {
    const uptime = getSessionUptime(session);
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }
    else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    else {
        return `${seconds}s`;
    }
}
//# sourceMappingURL=session.js.map