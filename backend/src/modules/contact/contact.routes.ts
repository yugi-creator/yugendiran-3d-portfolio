import { Router } from 'express';
import { ContactController } from './contact.controller.js';
import { ContactService } from './contact.service.js';
import { DrizzleContactRepository } from './contact.repository.js';
import { ResendEmailService } from '../../services/email/email.service.js';
import { RedisRateLimiter } from '../../lib/redis.js';

export function createContactRouter(customController?: ContactController): Router {
  const router = Router();

  let controllerInstance: ContactController | null = null;
  const getController = () => {
    if (customController) return customController;
    if (!controllerInstance) {
      const repository = new DrizzleContactRepository();
      const emailService = new ResendEmailService();
      const rateLimiter = new RedisRateLimiter();
      const service = new ContactService(repository, emailService, rateLimiter);
      controllerInstance = new ContactController(service);
    }
    return controllerInstance;
  };

  router.post('/', (req, res, next) => getController().submit(req, res, next));

  return router;
}

export const contactRouter = createContactRouter();
