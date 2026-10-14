// Service / Domain Layer: бизнес-логика проверки состояния сервиса.
// Ничего не знает об HTTP, JSON и заголовках — только о данных приложения.

export class HealthService {
  /**
   * @param {object} deps
   * @param {{ ping(): Promise<boolean> }} deps.repository — любое хранилище с методом ping()
   * @param {{ appName: string, version: string, appEnv: string }} deps.config
   * @param {() => number} [deps.clock] — источник текущего времени (подменяется в тестах)
   */
  constructor({ repository, config, clock = Date.now }) {
    this.repository = repository;
    this.config = config;
    this.clock = clock;
    this.startedAt = clock();
  }

  async getHealth() {
    let storageOk;
    try {
      storageOk = (await this.repository.ping()) === true;
    } catch {
      storageOk = false;
    }

    const now = this.clock();
    return {
      healthy: storageOk,
      appName: this.config.appName,
      version: this.config.version,
      environment: this.config.appEnv,
      uptimeSeconds: Math.floor((now - this.startedAt) / 1000),
      checkedAt: new Date(now),
      checks: { storage: storageOk },
    };
  }
}
