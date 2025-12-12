import { Router } from 'express';
import swaggerMcpController from '../controllers/mcp/swaggerMcp.controller';

const router = Router();

router.post('/swagger/list-operations', swaggerMcpController.listOperationsHandler);
router.post('/swagger/plan-run', swaggerMcpController.planRunHandler);
router.post('/swagger/execute-operation', swaggerMcpController.executeOperationHandler);
router.post('/swagger/generate-axios-tests', swaggerMcpController.generateTestsHandler);

export default router;
