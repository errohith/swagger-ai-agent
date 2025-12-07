import { Router } from 'express';
import * as environmentController from '../controllers/environment.controller';

const router = Router();

router.post('/', environmentController.createEnvironmentHandler);
router.get('/', environmentController.listEnvironmentsHandler);
router.put('/:id', environmentController.updateEnvironmentHandler);
router.delete('/:id', environmentController.deleteEnvironmentHandler);

export default router;
