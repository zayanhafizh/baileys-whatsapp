import { Request, Response, NextFunction } from 'express';
/**
 * Global Error Handler Middleware
 * Catches and formats all unhandled errors
 */
export declare const errorHandler: (error: Error, req: Request, res: Response, next: NextFunction) => void;
/**
 * Async Error Handler Wrapper
 * Wraps async route handlers to catch promises rejections
 */
export declare const asyncHandler: (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Not Found Handler
 * Handles requests to non-existent routes
 */
export declare const notFoundHandler: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map