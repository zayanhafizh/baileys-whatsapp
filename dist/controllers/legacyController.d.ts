import { Request, Response } from 'express';
/**
 * Legacy Controller
 * Handles backward compatibility endpoints
 */
export declare class LegacyController {
    /**
     * GET /status - Backward compatibility status endpoint
     */
    static getStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
    /**
     * GET /qr - Backward compatibility QR endpoint
     */
    static getQR: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=legacyController.d.ts.map