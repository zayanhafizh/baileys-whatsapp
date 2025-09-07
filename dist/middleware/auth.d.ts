import { Request, Response, NextFunction } from 'express';
/**
 * API Key Authentication Middleware
 * Validates API key from headers before allowing access to protected routes
 */
export declare const authenticateApiKey: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Optional API Key Authentication Middleware
 * Validates API key if present but doesn't require it
 */
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map