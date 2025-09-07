import { Request, Response } from 'express';
/**
 * Session Controller
 * Handles all session-related API endpoints
 */
export declare class SessionController {
    /**
     * GET /sessions - List all active sessions
     */
    static listSessions: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * GET /sessions/:sessionId - Find specific session
     */
    static findSession: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * GET /sessions/:sessionId/status - Get session status
     */
    static getSessionStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * GET /sessions/:sessionId/qr - Get QR code for session
     */
    static getQRCode: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * POST /sessions/add - Add new session
     */
    static addSession: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * DELETE /sessions/:sessionId - Delete session
     */
    static deleteSession: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * GET /sessions-history - Get sessions history
     */
    static getSessionsHistory: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=sessionController.d.ts.map