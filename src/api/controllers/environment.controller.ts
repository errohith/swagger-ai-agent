import { Request, Response, NextFunction } from 'express';
import { validateCreateEnvironmentBody, validateUpdateEnvironmentBody } from '../validators/environment.validator';
import { CreateEnvironmentUseCase } from '../../application/environment/createEnvironment.usecase';
import { ListEnvironmentsUseCase } from '../../application/environment/listEnvironments.usecase';
import { UpdateEnvironmentUseCase } from '../../application/environment/updateEnvironment.usecase';
import { DeleteEnvironmentUseCase } from '../../application/environment/deleteEnvironment.usecase';
import RepositoryFactory from '../../infrastructure/persistence/RepositoryFactory';

const repo = RepositoryFactory.getEnvironmentRepository();

export async function createEnvironmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = validateCreateEnvironmentBody(req.body);
    const usecase = new CreateEnvironmentUseCase(repo);
    const result = await usecase.execute(body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function listEnvironmentsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { specId } = req.query;
    if (!specId || typeof specId !== 'string') {
      return res.status(400).json({ error: 'specId is required' });
    }
    const usecase = new ListEnvironmentsUseCase(repo);
    const result = await usecase.execute({ specId });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateEnvironmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const body = validateUpdateEnvironmentBody(req.body);
    const usecase = new UpdateEnvironmentUseCase(repo);
    const result = await usecase.execute({ ...body, id });
    if (!result) return res.status(404).json({ error: 'environment not found' });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteEnvironmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const usecase = new DeleteEnvironmentUseCase(repo);
    await usecase.execute({ id });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
