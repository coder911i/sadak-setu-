import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

// User Management
router.get('/users', AdminController.getAllUsers);
router.post('/users', AdminController.createUser);
router.patch('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);

// Audit Logs
router.get('/audit-logs', AdminController.getAuditLogs);

// System Configuration
router.get('/config', AdminController.getConfig);
router.patch('/config', AdminController.setConfig);

export default router;
