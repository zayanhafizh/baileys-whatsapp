"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticateApiKey = void 0;
/**
 * API Key Authentication Middleware
 * Validates API key from headers before allowing access to protected routes
 */
const authenticateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] ||
        req.headers['authorization']?.toString().replace('Bearer ', '');
    if (!apiKey) {
        res.status(401).json({
            success: false,
            message: 'API key is required'
        });
        return;
    }
    const validApiKeys = process.env.API_KEYS ?
        process.env.API_KEYS.split(',') :
        ['farabimusic'];
    if (!validApiKeys.includes(apiKey)) {
        res.status(401).json({
            success: false,
            message: 'Invalid API key'
        });
        return;
    }
    // Add API key to request for later use
    req.apiKey = apiKey;
    next();
};
exports.authenticateApiKey = authenticateApiKey;
/**
 * Optional API Key Authentication Middleware
 * Validates API key if present but doesn't require it
 */
const optionalAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] ||
        req.headers['authorization']?.toString().replace('Bearer ', '');
    if (apiKey) {
        const validApiKeys = process.env.API_KEYS ?
            process.env.API_KEYS.split(',') :
            ['farabimusic'];
        if (validApiKeys.includes(apiKey)) {
            req.apiKey = apiKey;
        }
    }
    next();
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map