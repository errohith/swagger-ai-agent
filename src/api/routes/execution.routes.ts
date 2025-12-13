import { Router } from 'express';
import executionController from '../controllers/execution.controller';

const router = Router();

// List all executions (optionally filtered by specId)
router.get('/', executionController.listExecutionsHandler);

// Get single execution by runId
router.get('/:runId', executionController.getExecutionHandler);

// Execute tests
router.post('/run', executionController.runHandler);
router.post('/execute', executionController.runHandler); // Alias for frontend

// Get execution status
router.get('/status/:runId', executionController.statusHandler);

// Retry failed tests
router.post('/retry-failed', executionController.retryHandler);

export default router;
