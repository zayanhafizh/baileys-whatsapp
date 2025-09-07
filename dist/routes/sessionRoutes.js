"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionRoutes = void 0;
const express_1 = require("express");
const controllers_1 = require("@/controllers");
const middleware_1 = require("@/middleware");
const router = (0, express_1.Router)();
exports.sessionRoutes = router;
// Session management routes
router.get('/sessions', middleware_1.authenticateApiKey, controllers_1.SessionController.listSessions);
router.get('/sessions/:sessionId', middleware_1.authenticateApiKey, controllers_1.SessionController.findSession);
router.get('/sessions/:sessionId/status', middleware_1.authenticateApiKey, controllers_1.SessionController.getSessionStatus);
router.get('/sessions/:sessionId/qr', middleware_1.authenticateApiKey, controllers_1.SessionController.getQRCode);
router.post('/sessions/add', middleware_1.authenticateApiKey, controllers_1.SessionController.addSession);
router.delete('/sessions/:sessionId', middleware_1.authenticateApiKey, controllers_1.SessionController.deleteSession);
// Session history route
router.get('/sessions-history', middleware_1.authenticateApiKey, controllers_1.SessionController.getSessionsHistory);
//# sourceMappingURL=sessionRoutes.js.map