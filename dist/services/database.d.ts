import { PrismaClient } from '@prisma/client';
import { MessageType, MessageDirection } from '@/types';
export declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
/**
 * Database Service Class
 * Handles all database operations for WhatsApp sessions and chat history
 */
export declare class DatabaseService {
    /**
     * Create or get session from database
     * @param sessionId - Unique session identifier
     * @returns Session record from database
     */
    static createSessionRecord(sessionId: string): Promise<{
        sessionId: string;
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    /**
     * Update session status in database
     * @param sessionId - Session identifier
     * @param status - New session status
     */
    static updateSessionStatus(sessionId: string, status: string): Promise<void>;
    /**
     * Save chat history to database
     * @param sessionId - Session identifier
     * @param phoneNumber - Phone number of contact
     * @param message - Message content
     * @param messageType - Type of message
     * @param direction - Message direction (incoming/outgoing)
     * @param metadata - Additional message metadata
     */
    static saveChatHistory(sessionId: string, phoneNumber: string, message: string, messageType?: MessageType, direction?: MessageDirection, metadata?: any): Promise<void>;
    /**
     * Get chat history for a session
     * @param sessionId - Session identifier
     * @param phoneNumber - Optional phone number filter
     * @param page - Page number for pagination
     * @param limit - Number of records per page
     * @param cursor - Cursor for cursor-based pagination
     * @returns Chat history with pagination info
     */
    static getChatHistory(sessionId: string, phoneNumber?: string, page?: number, limit?: number, cursor?: number): Promise<{
        data: {
            metadata: any;
            sessionId: string;
            id: number;
            phoneNumber: string;
            message: string;
            messageType: string;
            direction: string;
            timestamp: Date;
        }[];
        cursor: number | null;
        total: number;
    }>;
    /**
     * Get sessions history with pagination
     * @param page - Page number
     * @param limit - Number of records per page
     * @returns Sessions with pagination info
     */
    static getSessionsHistory(page?: number, limit?: number): Promise<{
        data: ({
            _count: {
                chatHistory: number;
            };
        } & {
            sessionId: string;
            id: number;
            status: string;
            createdAt: Date;
            updatedAt: Date;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    /**
     * Delete session from database
     * @param sessionId - Session identifier
     */
    static deleteSession(sessionId: string): Promise<void>;
    /**
     * Save authentication data to database
     * @param sessionId - Session identifier
     * @param key - Authentication key name
     * @param value - Authentication data value
     */
    static saveAuthData(sessionId: string, key: string, value: string): Promise<void>;
    /**
     * Get authentication data from database
     * @param sessionId - Session identifier
     * @returns Array of authentication data
     */
    static getAuthData(sessionId: string): Promise<Array<{
        key: string;
        value: string;
    }>>;
    /**
     * Clear all authentication data for a session
     * @param sessionId - Session identifier
     */
    static clearAuthData(sessionId: string): Promise<void>;
    /**
     * Disconnect from database
     */
    static disconnect(): Promise<void>;
}
//# sourceMappingURL=database.d.ts.map