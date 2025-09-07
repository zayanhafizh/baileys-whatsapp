"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRoutes = void 0;
const express_1 = require("express");
const controllers_1 = require("@/controllers");
const middleware_1 = require("@/middleware");
const router = (0, express_1.Router)();
exports.messageRoutes = router;
// Message routes (sessionId as parameter)
router.post('/:sessionId/messages/send', middleware_1.authenticateApiKey, controllers_1.MessageController.sendMessage);
router.post('/:sessionId/messages/send/bulk', middleware_1.authenticateApiKey, controllers_1.MessageController.sendBulkMessages);
// Chat history routes
router.get('/:sessionId/chats/:jid?', middleware_1.authenticateApiKey, controllers_1.MessageController.getChatHistory);
// Contact routes
router.get('/:sessionId/contacts', middleware_1.authenticateApiKey, controllers_1.MessageController.getContacts);
//# sourceMappingURL=messageRoutes.js.map