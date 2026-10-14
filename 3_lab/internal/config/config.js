// Config: загрузка конфигурации приложения из переменных окружения (.env).
import fs from 'node:fs';

const ALLOWED_ENVS = ['development', 'test', 'production'];

/**
 * Разбирает содержимое .env-файла в объект { KEY: 'value' }.
 * Поддерживает комментарии (#), пустые строки и значения в кавычках.
 */
export function parseEnv(content) {
  const result = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#')) continue;

    const eq = line.indexOf('=');
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();

    const quote = value[0];
    if ((quote === '"' || quote === "'") && value.endsWith(quote) && value.length >= 2) {
      value = value.slice(1, -1);
    } else {
      // комментарий в конце строки: HTTP_PORT=8080 # порт
      const hash = value.indexOf(' #');
      if (hash !== -1) value = value.slice(0, hash).trim();
    }
    result[key] = value;
  }
  return result;
}

/**
 * Читает .env-файл и переносит значения в process.env.
 * Переменные, уже заданные в системе, имеют приоритет и не перезаписываются.
 * Если файла нет (например, на сервере), просто ничего не делает.
 */
export function loadEnvFile(filePath, env = process.env) {
  if (!fs.existsSync(filePath)) return false;
  const vars = parseEnv(fs.readFileSync(filePath, 'utf8'));
  for (const [key, value] of Object.entries(vars)) {
    if (env[key] === undefined) env[key] = value;
  }
  return true;
}

function readVersion() {
  const pkgUrl = new URL('../../package.json', import.meta.url);
  return JSON.parse(fs.readFileSync(pkgUrl, 'utf8')).version;
}

/**
 * Формирует и проверяет объект конфигурации.
 * При ошибке бросает исключение — приложение не должно стартовать с неверными настройками.
 */
export function loadConfig(env = process.env) {
  const errors = [];

  const appName = env.APP_NAME?.trim() || 'Electronic Library API';

  const appEnv = env.APP_ENV?.trim() || 'development';
  if (!ALLOWED_ENVS.includes(appEnv)) {
    errors.push(`APP_ENV должен быть одним из: ${ALLOWED_ENVS.join(', ')} (получено "${appEnv}")`);
  }

  const rawPort = env.HTTP_PORT?.trim() || '8080';
  const httpPort = Number(rawPort);
  if (!/^\d+$/.test(rawPort) || httpPort < 1 || httpPort > 65535) {
    errors.push(`HTTP_PORT должен быть целым числом от 1 до 65535 (получено "${rawPort}")`);
  }

  if (errors.length > 0) {
    throw new Error(`Ошибка конфигурации:\n - ${errors.join('\n - ')}`);
  }

  return Object.freeze({
    appName,
    appEnv,
    httpPort,
    version: readVersion(),
  });
}
