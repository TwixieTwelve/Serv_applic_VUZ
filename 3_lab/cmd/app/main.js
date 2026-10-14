// Точка входа в приложение: загрузка конфигурации и запуск HTTP-сервера.
import { fileURLToPath } from 'node:url';
import { loadEnvFile, loadConfig } from '../../internal/config/config.js';
import { createApp, API_PREFIX } from '../../internal/app.js';

// .env лежит в корне проекта (на два уровня выше этого файла)
loadEnvFile(fileURLToPath(new URL('../../.env', import.meta.url)));

let config;
try {
  config = loadConfig();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const server = createApp(config);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Порт ${config.httpPort} уже занят. Укажите другой HTTP_PORT в .env`);
  } else {
    console.error('Ошибка сервера:', err);
  }
  process.exit(1);
});

server.listen(config.httpPort, () => {
  console.log(`${config.appName} v${config.version} [${config.appEnv}]`);
  console.log(`Сервер запущен: http://localhost:${config.httpPort}${API_PREFIX}/health`);
});

// Корректное завершение по Ctrl+C или сигналу остановки
function shutdown(signal) {
  console.log(`\nПолучен ${signal}, остановка сервера...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
