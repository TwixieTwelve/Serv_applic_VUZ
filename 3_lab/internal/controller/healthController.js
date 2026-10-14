// API / Transport Layer: HTTP-обработчик GET /api/v1/health.
// Вызывает сервис и превращает его результат в HTTP-ответ.
import { sendJson } from './http.js';

export class HealthController {
  /** @param {{ getHealth(): Promise<object> }} healthService */
  constructor(healthService) {
    this.healthService = healthService;
  }

  getHealth = async (req, res) => {
    const health = await this.healthService.getHealth();

    // Перевод доменной модели в формат JSON-ответа API (snake_case).
    const body = {
      status: health.healthy ? 'pass' : 'fail',
      app_name: health.appName,
      version: health.version,
      environment: health.environment,
      uptime_seconds: health.uptimeSeconds,
      timestamp: health.checkedAt.toISOString(),
      checks: {
        storage: health.checks.storage ? 'pass' : 'fail',
      },
    };

    // 200 — сервис здоров, 503 — сервис запущен, но не может работать.
    sendJson(res, health.healthy ? 200 : 503, body, { 'Cache-Control': 'no-store' });
  };
}
