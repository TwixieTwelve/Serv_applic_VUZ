// Composition Root: здесь создаются объекты всех слоев и связываются между собой
// (внедрение зависимостей через конструктор). Repository -> Service -> Controller -> Router.
import http from 'node:http';
import { InMemoryHealthRepository } from './repository/healthRepository.js';
import { HealthService } from './service/healthService.js';
import { HealthController } from './controller/healthController.js';
import { createRouter } from './controller/router.js';

export const API_PREFIX = '/api/v1';

export function createApp(config, overrides = {}) {
  // Data Access Layer
  const healthRepository = overrides.healthRepository ?? new InMemoryHealthRepository();

  // Service Layer
  const healthService = new HealthService({ repository: healthRepository, config, clock: overrides.clock });

  // API / Transport Layer
  const healthController = new HealthController(healthService);

  const router = createRouter([
    { method: 'GET', path: `${API_PREFIX}/health`, handler: healthController.getHealth },
  ]);

  return http.createServer(router);
}
