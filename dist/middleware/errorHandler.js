"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.asyncHandler = exports.errorHandler = void 0;
/**
 * Global Error Handler Middleware
 * Catches and formats all unhandled errors
 */
const errorHandler = (error, req, res, next) => {
    console.error('Unhandled error:', error);
    const errorResponse = {
        success: false,
        message: 'Internal server error',
        error: error.message
    };
    // Add stack trace in development
    if (process.env.NODE_ENV === 'development') {
        errorResponse.debug = {
            stack: error.stack,
            url: req.url,
            method: req.method,
            body: req.body,
            params: req.params,
            query: req.query
        };
    }
    res.status(500).json(errorResponse);
};
exports.errorHandler = errorHandler;
/**
 * Async Error Handler Wrapper
 * Wraps async route handlers to catch promises rejections
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
/**
 * Not Found Handler
 * Handles requests to non-existent routes
 */
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=errorHandler.js.map