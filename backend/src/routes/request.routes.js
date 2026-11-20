import { Router } from 'express';
import * as controller from '../controllers/request.controller.js';

const router = Router();

router.get('/meta', controller.getMetadata);
router.get('/dashboard', controller.getDashboard);


router.post('/requests', controller.create);
router.get('/requests', controller.list);
router.get('/requests/:id', controller.getById);
router.patch('/requests/:id/status', controller.advanceStatus);
router.get('/requests/:id/history', controller.getHistory);
router.put('/requests/:id', controller.update);
router.delete('/requests/:id', controller.remove);

export default router;