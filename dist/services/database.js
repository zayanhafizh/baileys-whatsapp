"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = exports.prisma = void 0;
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
class DatabaseService {
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
    static async deleteSession(sessionId) {
        try {
            await exports.prisma.chatHistory.deleteMany({
                where: { sessionId }
            });
            await exports.prisma.whatsappSession.delete({
                where: { sessionId }
            });
        }
        catch (error) {
            console.error('Error deleting session:', error);
        }
    }
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
    static async disconnect() {
        await exports.prisma.$disconnect();
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=database.js.map