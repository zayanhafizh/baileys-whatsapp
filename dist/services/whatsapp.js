"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const baileys_1 = require("@whiskeysockets/baileys");
const qrcode_1 = __importDefault(require("qrcode"));
const fs_1 = __importDefault(require("fs"));
const pino_1 = __importDefault(require("pino"));
const utils_1 = require("@/utils");
const databaseAuth_1 = require("@/utils/databaseAuth");
const database_1 = require("./database");
// Logger
const logger = (0, pino_1.default)({ level: 'silent' });
/**
 * WhatsApp Service Class
 * Handles WhatsApp connections, messaging, and session management
 */
class WhatsAppService {
    /**
     * Get all active sessions
     * @returns Map of active sessions
     */
    static getSessions() {
        return this.sessions;
    }
    /**
     * Get session QR codes
     * @returns Map of session QR codes
     */
    static getSessionQRs() {
        return this.sessionQRs;
    }
    /**
     * Create WhatsApp connection for a session
     * @param sessionId - Unique session identifier
     * @param options - Connection options
     * @returns Session data
     */
    static async createConnection(sessionId, options = {}) {
        try {
            // Check if session already exists and is authenticated
            if (this.sessions.has(sessionId)) {
                const existingSession = this.sessions.get(sessionId);
                if (existingSession.isAuthenticated) {
                    console.log(`Session ${sessionId} already authenticated, skipping creation`);
                    return existingSession;
                }
                // Clean up existing session before recreating
                console.log(`Cleaning up existing session ${sessionId} before recreating`);
                if (existingSession.socket) {
                    try {
                        await existingSession.socket.end(undefined);
                    }
                    catch (error) {
                        console.error('Error ending existing socket:', error);
                    }
                }
                this.sessions.delete(sessionId);
                this.sessionQRs.delete(sessionId);
            }
            // Clean up any existing auth folder (legacy cleanup)
            const authDir = `auth_info_${sessionId}`;
            if (fs_1.default.existsSync(authDir)) {
                console.log(`Removing legacy auth directory: ${authDir}`);
                fs_1.default.rmSync(authDir, { recursive: true, force: true });
            }
            // Use database auth state instead of file system
            const { state, saveCreds, clearAuth } = await (0, databaseAuth_1.useDatabaseAuthState)(sessionId);
            await database_1.DatabaseService.createSessionRecord(sessionId);
            // Enhanced socket configuration
            const socket = (0, baileys_1.makeWASocket)({
                auth: state,
                logger,
                printQRInTerminal: false,
                browser: ['WhatsApp Multi-Session API', 'Chrome', '3.0.0'],
                defaultQueryTimeoutMs: 60000,
                keepAliveIntervalMs: 30000,
                connectTimeoutMs: 60000,
                qrTimeout: 40000,
                emitOwnEvents: true,
                fireInitQueries: true,
                generateHighQualityLinkPreview: true,
                syncFullHistory: false,
                shouldSyncHistoryMessage: () => false,
                markOnlineOnConnect: false,
                retryRequestDelayMs: 250,
                maxMsgRetryCount: 5,
                appStateMacVerification: {
                    patch: true,
                    snapshot: true
                },
                ...options
            });
            const sessionData = {
                socket,
                isAuthenticated: false,
                authDir: `db_auth_${sessionId}`, // Just for reference, not used for actual storage
                status: 'connecting',
                startTime: Date.now()
            };
            this.sessions.set(sessionId, sessionData);
            // Set up event handlers
            this.setupEventHandlers(sessionId, socket, sessionData, saveCreds, clearAuth);
            return sessionData;
        }
        catch (error) {
            console.error(`[${sessionId}] Error creating WhatsApp connection:`, error);
            // Clean up on error
            this.sessions.delete(sessionId);
            this.sessionQRs.delete(sessionId);
            throw error;
        }
    }
    /**
     * Setup event handlers for WhatsApp socket
     * @param sessionId - Session identifier
     * @param socket - WhatsApp socket
     * @param sessionData - Session data
     * @param saveCreds - Save credentials function
     * @param clearAuth - Clear auth function
     */
    static setupEventHandlers(sessionId, socket, sessionData, saveCreds, clearAuth) {
        // Track reconnection attempts
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 3;
        // Enhanced event handler for connection updates
        socket.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr, isNewLogin, isOnline } = update;
            console.log(`[${sessionId}] Connection update:`, {
                connection,
                isNewLogin,
                isOnline,
                hasQR: !!qr,
                lastDisconnect: lastDisconnect?.error?.message
            });
            if (qr) {
                console.log(`[${sessionId}] QR Code received, generating data URL...`);
                try {
                    const qrImage = await qrcode_1.default.toDataURL(qr, {
                        margin: 2,
                        width: 256,
                        color: {
                            dark: '#000000',
                            light: '#FFFFFF'
                        }
                    });
                    this.sessionQRs.set(sessionId, qrImage);
                    await database_1.DatabaseService.updateSessionStatus(sessionId, 'waiting_qr_scan');
                    console.log(`[${sessionId}] QR Code generated and stored`);
                }
                catch (qrError) {
                    console.error(`[${sessionId}] Error generating QR code:`, qrError);
                }
            }
            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const shouldReconnect = statusCode !== baileys_1.DisconnectReason.loggedOut;
                console.log(`[${sessionId}] Connection closed:`, {
                    statusCode,
                    reason: Object.keys(baileys_1.DisconnectReason).find(key => baileys_1.DisconnectReason[key] === statusCode),
                    shouldReconnect,
                    error: lastDisconnect?.error?.message
                });
                await database_1.DatabaseService.updateSessionStatus(sessionId, 'disconnected');
                sessionData.isAuthenticated = false;
                this.sessionQRs.delete(sessionId);
                if (shouldReconnect && reconnectAttempts < maxReconnectAttempts) {
                    reconnectAttempts++;
                    console.log(`[${sessionId}] Attempting reconnection ${reconnectAttempts}/${maxReconnectAttempts} in 5 seconds...`);
                    setTimeout(() => {
                        console.log(`[${sessionId}] Reconnecting...`);
                        this.createConnection(sessionId, {}).catch(error => {
                            console.error(`[${sessionId}] Reconnection failed:`, error);
                        });
                    }, 5000);
                }
                else if (reconnectAttempts >= maxReconnectAttempts) {
                    console.log(`[${sessionId}] Max reconnection attempts reached, stopping reconnection`);
                    this.sessions.delete(sessionId);
                    this.sessionQRs.delete(sessionId);
                }
                else {
                    console.log(`[${sessionId}] Session logged out, cleaning up...`);
                    this.sessions.delete(sessionId);
                    this.sessionQRs.delete(sessionId);
                    // Clear auth data from database on logout
                    await clearAuth();
                }
            }
            else if (connection === 'connecting') {
                console.log(`[${sessionId}] Connecting to WhatsApp...`);
                await database_1.DatabaseService.updateSessionStatus(sessionId, 'connecting');
            }
            else if (connection === 'open') {
                console.log(`[${sessionId}] WhatsApp connection opened successfully`);
                sessionData.isAuthenticated = true;
                reconnectAttempts = 0; // Reset reconnection attempts on successful connection
                this.sessionQRs.delete(sessionId);
                await database_1.DatabaseService.updateSessionStatus(sessionId, 'connected');
                // Get and log connection info
                try {
                    const info = socket.user;
                    console.log(`[${sessionId}] Authenticated as:`, {
                        id: info?.id,
                        name: info?.name,
                        isOnline
                    });
                }
                catch (error) {
                    console.log(`[${sessionId}] Could not get user info:`, error.message);
                }
            }
        });
        // Enhanced event handler for credentials update
        socket.ev.on('creds.update', async () => {
            try {
                await saveCreds();
                console.log(`[${sessionId}] Credentials updated and saved to database`);
            }
            catch (error) {
                console.error(`[${sessionId}] Error saving credentials:`, error);
            }
        });
        // Event handler for incoming messages
        socket.ev.on('messages.upsert', async (messageUpdate) => {
            const { messages } = messageUpdate;
            for (const message of messages) {
                if (message.key.fromMe)
                    continue;
                const phoneNumber = message.key.remoteJid?.replace('@s.whatsapp.net', '').replace('@g.us', '');
                if (!phoneNumber)
                    continue;
                let messageText = '';
                let messageType = 'unknown';
                let metadata = {};
                if (message.message?.conversation) {
                    messageText = message.message.conversation;
                    messageType = 'text';
                }
                else if (message.message?.extendedTextMessage?.text) {
                    messageText = message.message.extendedTextMessage.text;
                    messageType = 'text';
                }
                else if (message.message?.imageMessage) {
                    messageText = message.message.imageMessage.caption || '[Image]';
                    messageType = 'image';
                    metadata = {
                        mimetype: message.message.imageMessage.mimetype,
                        fileLength: message.message.imageMessage.fileLength
                    };
                }
                else if (message.message?.documentMessage) {
                    messageText = message.message.documentMessage.title || '[Document]';
                    messageType = 'document';
                    metadata = {
                        fileName: message.message.documentMessage.fileName,
                        mimetype: message.message.documentMessage.mimetype,
                        fileLength: message.message.documentMessage.fileLength
                    };
                }
                else if (message.message?.audioMessage) {
                    messageText = '[Audio]';
                    messageType = 'audio';
                    metadata = {
                        mimetype: message.message.audioMessage.mimetype,
                        seconds: message.message.audioMessage.seconds
                    };
                }
                await database_1.DatabaseService.saveChatHistory(sessionId, phoneNumber, messageText, messageType, 'incoming', metadata);
            }
        });
    }
    /**
     * Send message through WhatsApp
     * @param sessionId - Session identifier
     * @param jid - Target JID
     * @param message - Message content
     * @param options - Message options
     * @returns Message result
     */
    static async sendMessage(sessionId, jid, message, options = {}) {
        const sessionData = this.sessions.get(sessionId);
        if (!sessionData || !sessionData.isAuthenticated || !sessionData.socket) {
            throw new Error('Session not found or not authenticated');
        }
        const result = await sessionData.socket.sendMessage(jid, message, options);
        // Save to database
        const phoneNumber = (0, utils_1.extractPhoneNumber)(jid);
        const messageText = message.text || JSON.stringify(message);
        await database_1.DatabaseService.saveChatHistory(sessionId, phoneNumber, messageText, 'text', 'outgoing');
        return result;
    }
    /**
     * Delete session and cleanup
     * @param sessionId - Session identifier
     */
    static async deleteSession(sessionId) {
        const sessionData = this.sessions.get(sessionId);
        if (sessionData) {
            if (sessionData.socket) {
                try {
                    await sessionData.socket.logout();
                    await sessionData.socket.end(undefined);
                }
                catch (error) {
                    console.error(`Error ending session ${sessionId}:`, error);
                }
            }
            // Clear auth data from database
            await database_1.DatabaseService.clearAuthData(sessionId);
            this.sessions.delete(sessionId);
            this.sessionQRs.delete(sessionId);
            await database_1.DatabaseService.updateSessionStatus(sessionId, 'logged_out');
        }
    }
    /**
     * Wait for QR code generation
     * @param sessionId - Session identifier
     * @param maxAttempts - Maximum attempts to wait
     * @returns QR code or authentication status
     */
    static async waitForQR(sessionId, maxAttempts = 20) {
        let attempts = 0;
        return new Promise((resolve) => {
            const checkQR = () => {
                const session = this.sessions.get(sessionId);
                const qr = this.sessionQRs.get(sessionId);
                if (qr) {
                    console.log(`[${sessionId}] QR code found after ${attempts * 500}ms`);
                    resolve(qr);
                }
                else if (session && session.isAuthenticated) {
                    console.log(`[${sessionId}] Session authenticated while waiting for QR`);
                    resolve('authenticated');
                }
                else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(checkQR, 500);
                }
                else {
                    console.log(`[${sessionId}] QR wait timeout after ${maxAttempts * 500}ms`);
                    resolve(null);
                }
            };
            checkQR();
        });
    }
}
exports.WhatsAppService = WhatsAppService;
WhatsAppService.sessions = new Map();
WhatsAppService.sessionQRs = new Map();
//# sourceMappingURL=whatsapp.js.map