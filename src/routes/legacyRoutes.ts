import { Router } from 'express';
import { LegacyController } from '@/controllers';
import { authenticateApiKey } from '@/middleware';

const router = Router();

// Legacy backward compatibility routes
router.get('/status', LegacyController.getStatus);
router.get('/qr', authenticateApiKey, LegacyController.getQR);

export { router as legacyRoutes }; 