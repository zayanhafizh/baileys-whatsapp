"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.legacyRoutes = void 0;
const express_1 = require("express");
const controllers_1 = require("@/controllers");
const middleware_1 = require("@/middleware");
const router = (0, express_1.Router)();
exports.legacyRoutes = router;
router.get('/status', controllers_1.LegacyController.getStatus);
router.get('/qr', middleware_1.authenticateApiKey, controllers_1.LegacyController.getQR);
//# sourceMappingURL=legacyRoutes.js.map