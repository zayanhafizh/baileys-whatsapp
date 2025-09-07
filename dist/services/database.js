"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = exports.prisma = void 0;
const client_1 = require("@prisma/client");
// Initialize Prisma Client
exports.prisma = new client_1.PrismaClient();
/**
 * Database Service Class
 * Handles all database operations for WhatsApp sessions and chat history
 */
class DatabaseService {
    /**
     * Create or get session from database
     * @param sessionId - Unique session identifier
     * @returns Session record from database
     */
    static async createSessionRecord(sessionId) {
        try {
            const existingSession = await exports.prisma.whatsappSession.findUnique({
                where: { sessionId }
            });
            if (existingSession) {
                await exports.prisma.whatsappSession.update({
                    where: { sessionId },
                    data: {
                        status: 'connecting',
                        updatedAt: new Date()
                    }
                });
                return existingSession;
            }
            const session = await exports.prisma.whatsappSession.create({
                data: {
                    sessionId,
                    status: 'connecting',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
            return session;
        }
        catch (error) {
            console.error('Error creating session record:', error);
            return null;
        }
    }
    /**
     * Update session status in database
     * @param sessionId - Session identifier
     * @param status - New session status
     */
    static async updateSessionStatus(sessionId, status) {
        try {
            await exports.prisma.whatsappSession.update({
                where: { sessionId },
                data: {
                    status,
                    updatedAt: new Date()
                }
            });
        }
        catch (error) {
            console.error('Error updating session status:', error);
        }
    }
    /**
     * Save chat history to database
     * @param sessionId - Session identifier
     * @param phoneNumber - Phone number of contact
     * @param message - Message content
     * @param messageType - Type of message
     * @param direction - Message direction (incoming/outgoing)
     * @param metadata - Additional message metadata
     */
    static async saveChatHistory(sessionId, phoneNumber, message, messageType = 'text', direction = 'outgoing', metadata = {}) {
        try {
            await exports.prisma.chatHistory.create({
                data: {
                    sessionId,
                    phoneNumber,
                    message,
                    messageType,
                    direction,
                    metadata: JSON.stringify(metadata),
                    timestamp: new Date()
                }
            });
        }
        catch (error) {
            console.error('Error saving chat history:', error);
        }
    }
    /**
     * Get chat history for a session
     * @param sessionId - Session identifier
     * @param phoneNumber - Optional phone number filter
     * @param page - Page number for pagination
     * @param limit - Number of records per page
     * @param cursor - Cursor for cursor-based pagination
     * @returns Chat history with pagination info
     */
    static async getChatHistory(sessionId, phoneNumber, page = 1, limit = 25, cursor) {
        try {
            const where = { sessionId };
            if (phoneNumber) {
                where.phoneNumber = phoneNumber;
            }
            const chatHistory = await exports.prisma.chatHistory.findMany({
                where,
                orderBy: { timestamp: 'desc' },
                skip: cursor ? undefined : (page - 1) * limit,
                take: limit,
                ...(cursor && { cursor: { id: cursor } })
            });
            const total = await exports.prisma.chatHistory.count({ where });
            return {
                data: chatHistory.map(chat => ({
                    ...chat,
                    metadata: chat.metadata ? JSON.parse(chat.metadata) : {}
                })),
                cursor: chatHistory.length > 0 ? chatHistory[chatHistory.length - 1].id : null,
                total
            };
        }
        catch (error) {
            console.error('Error fetching chat history:', error);
            throw error;
        }
    }
    /**
     * Get sessions history with pagination
     * @param page - Page number
     * @param limit - Number of records per page
     * @returns Sessions with pagination info
     */
    static async getSessionsHistory(page = 1, limit = 20) {
        try {
            const sessions = await exports.prisma.whatsappSession.findMany({
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    _count: {
                        select: { chatHistory: true }
                    }
                }
            });
            const total = await exports.prisma.whatsappSession.count();
            return {
                data: sessions,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        }
        catch (error) {
            console.error('Error fetching sessions history:', error);
            throw error;
        }
    }
    /**
     * Delete session from database
     * @param sessionId - Session identifier
     */
    static async deleteSession(sessionId) {
        try {
            // Delete related chat history first
            await exports.prisma.chatHistory.deleteMany({
                where: { sessionId }
            });
            // Delete session
            await exports.prisma.whatsappSession.delete({
                where: { sessionId }
            });
        }
        catch (error) {
            console.error('Error deleting session:', error);
        }
    }
    /**
     * Save authentication data to database
     * @param sessionId - Session identifier
     * @param key - Authentication key name
     * @param value - Authentication data value
     */
    static async saveAuthData(sessionId, key, value) {
        try {
            await exports.prisma.authData.upsert({
                where: {
                    sessionId_key: {
                        sessionId,
                        key
                    }
                },
                update: {
                    value,
                    updatedAt: new Date()
                },
                create: {
                    sessionId,
                    key,
                    value,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
        }
        catch (error) {
            console.error('Error saving auth data:', error);
            throw error;
        }
    }
    /**
     * Get authentication data from database
     * @param sessionId - Session identifier
     * @returns Array of authentication data
     */
    static async getAuthData(sessionId) {
        try {
            const authData = await exports.prisma.authData.findMany({
                where: { sessionId },
                select: {
                    key: true,
                    value: true
                }
            });
            return authData;
        }
        catch (error) {
            console.error('Error getting auth data:', error);
            return [];
        }
    }
    /**
     * Clear all authentication data for a session
     * @param sessionId - Session identifier
     */
    static async clearAuthData(sessionId) {
        try {
            await exports.prisma.authData.deleteMany({
                where: { sessionId }
            });
        }
        catch (error) {
            console.error('Error clearing auth data:', error);
        }
    }
    /**
     * Disconnect from database
     */
    static async disconnect() {
        await exports.prisma.$disconnect();
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=database.js.map