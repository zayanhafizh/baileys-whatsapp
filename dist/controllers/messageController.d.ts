import { Request, Response } from 'express';
/**
 * Message Controller
 * Handles all message-related API endpoints
 */
export declare class MessageController {
    /**
     * POST /:sessionId/messages/send - Send single message
     */
    static sendMessage: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * POST /:sessionId/messages/send/bulk - Send bulk messages
     */
    static sendBulkMessages: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * GET /:sessionId/chats/:jid? - Get chat history
     */
    static getChatHistory: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * GET /:sessionId/contacts - Get contact list
     */
    static getContacts: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=messageController.d.ts.map