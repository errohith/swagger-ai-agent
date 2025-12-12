import { Router } from 'express';
import executionController from '../controllers/execution.controller';

const router = Router();

router.post('/run', executionController.runHandler);
router.get('/status/:runId', executionController.statusHandler);
router.post('/retry-failed', executionController.retryHandler);

export default router;
