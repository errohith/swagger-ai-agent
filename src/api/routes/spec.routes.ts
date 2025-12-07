import { Router } from 'express';
import specController from '../controllers/spec.controller';

const router = Router();

router.post('/import', specController.importSpecHandler);
router.post('/validate', specController.validateSpecHandler);
router.get('/:specId', specController.getSpecHandler);
router.get('/:specId/operations', specController.listOperationsHandler);

export default router;
