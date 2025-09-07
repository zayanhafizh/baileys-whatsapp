import { SessionData, ConnectionOptions } from '@/types';
/**
 * WhatsApp Service Class
 * Handles WhatsApp connections, messaging, and session management
 */
export declare class WhatsAppService {
    private static sessions;
    private static sessionQRs;
    /**
     * Get all active sessions
     * @returns Map of active sessions
     */
    static getSessions(): Map<string, SessionData>;
    /**
     * Get session QR codes
     * @returns Map of session QR codes
     */
    static getSessionQRs(): Map<string, string>;
    /**
     * Create WhatsApp connection for a session
     * @param sessionId - Unique session identifier
     * @param options - Connection options
     * @returns Session data
     */
    static createConnection(sessionId: string, options?: ConnectionOptions): Promise<SessionData>;
    /**
     * Setup event handlers for WhatsApp socket
     * @param sessionId - Session identifier
     * @param socket - WhatsApp socket
     * @param sessionData - Session data
     * @param saveCreds - Save credentials function
     * @param clearAuth - Clear auth function
     */
    private static setupEventHandlers;
    /**
     * Send message through WhatsApp
     * @param sessionId - Session identifier
     * @param jid - Target JID
     * @param message - Message content
     * @param options - Message options
     * @returns Message result
     */
    static sendMessage(sessionId: string, jid: string, message: any, options?: any): Promise<import("@whiskeysockets/baileys").proto.WebMessageInfo | undefined>;
    /**
     * Delete session and cleanup
     * @param sessionId - Session identifier
     */
    static deleteSession(sessionId: string): Promise<void>;
    /**
     * Wait for QR code generation
     * @param sessionId - Session identifier
     * @param maxAttempts - Maximum attempts to wait
     * @returns QR code or authentication status
     */
    static waitForQR(sessionId: string, maxAttempts?: number): Promise<string | 'authenticated' | null>;
}
//# sourceMappingURL=whatsapp.d.ts.map