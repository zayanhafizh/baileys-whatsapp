import { Router } from 'express';
import { MessageController } from '@/controllers';
import { authenticateApiKey } from '@/middleware';

const router = Router();

// Message routes (sessionId as parameter)
router.post('/:sessionId/messages/send', authenticateApiKey, MessageController.sendMessage);
router.post('/:sessionId/messages/send/bulk', authenticateApiKey, MessageController.sendBulkMessages);

// Chat history routes
router.get('/:sessionId/chats/:jid?', authenticateApiKey, MessageController.getChatHistory);

// Contact routes
router.get('/:sessionId/contacts', authenticateApiKey, MessageController.getContacts);

export { router as messageRoutes }; 