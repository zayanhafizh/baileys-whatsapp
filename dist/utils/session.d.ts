import { SessionData, SessionStatus } from '@/types';
/**
 * Get session status from session data
 * @param sessionId - Session identifier
 * @param sessions - Map of active sessions
 * @returns Current session status
 */
export declare function getSessionStatus(sessionId: string, sessions: Map<string, SessionData>): SessionStatus;
/**
 * Generate unique session ID
 * @param prefix - Optional prefix for session ID
 * @returns Unique session identifier
 */
export declare function generateSessionId(prefix?: string): string;
/**
 * Validate session ID format
 * @param sessionId - Session ID to validate
 * @returns True if valid session ID format
 */
export declare function isValidSessionId(sessionId: string): boolean;
/**
 * Get session uptime in milliseconds
 * @param session - Session data
 * @returns Uptime in milliseconds
 */
export declare function getSessionUptime(session: SessionData): number;
/**
 * Format session uptime for display
 * @param session - Session data
 * @returns Formatted uptime string
 */
export declare function formatSessionUptime(session: SessionData): string;
//# sourceMappingURL=session.d.ts.map