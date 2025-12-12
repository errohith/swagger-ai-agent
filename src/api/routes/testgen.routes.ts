import { Router } from 'express';
import testgenController from '../controllers/testgen.controller';

const router = Router();

router.post('/generate-axios-tests', testgenController.generateHandler);
router.get('/spec/:specId/preview', testgenController.previewHandler);

export default router;
