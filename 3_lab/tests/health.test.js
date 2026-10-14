// Тесты: node --test  (встроенный тестовый модуль Node.js, без зависимостей)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../internal/app.js';
import { loadConfig, parseEnv } from '../internal/config/config.js';

const config = loadConfig({ APP_NAME: 'Electronic Library API', APP_ENV: 'test', HTTP_PORT: '8080' });

async function withServer(app, fn) {
  await new Promise((resolve) => app.listen(0, resolve)); // 0 — любой свободный порт
  const { port } = app.address();
  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => app.close(resolve));
  }
}

test('GET /api/v1/health возвращает 200 и информацию о сервисе', async () => {
  await withServer(createApp(config), async (base) => {
    const res = await fetch(`${base}/api/v1/health`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /^application\/json/);

    const body = await res.json();
    assert.equal(body.status, 'pass');
    assert.equal(body.app_name, 'Electronic Library API');
    assert.equal(body.version, '1.0.0');
    assert.equal(body.environment, 'test');
    assert.equal(typeof body.uptime_seconds, 'number');
    assert.equal(body.checks.storage, 'pass');
  });
});

test('uptime считается от момента запуска', async () => {
  let now = 1_000_000;
  const app = createApp(config, { clock: () => now });
  now += 65_000; // прошло 65 секунд
  await withServer(app, async (base) => {
    const body = await (await fetch(`${base}/api/v1/health`)).json();
    assert.equal(body.uptime_seconds, 65);
  });
});

test('если хранилище недоступно — 503 и status "fail"', async () => {
  const brokenRepo = { ping: async () => { throw new Error('connection refused'); } };
  await withServer(createApp(config, { healthRepository: brokenRepo }), async (base) => {
    const res = await fetch(`${base}/api/v1/health`);
    assert.equal(res.status, 503);
    const body = await res.json();
    assert.equal(body.status, 'fail');
    assert.equal(body.checks.storage, 'fail');
  });
});

test('неизвестный маршрут — 404 в формате ErrorResponse', async () => {
  await withServer(createApp(config), async (base) => {
    const res = await fetch(`${base}/api/v1/unknown`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.code, 'NOT_FOUND');
    assert.ok(body.message && body.timestamp);
  });
});

test('неподдерживаемый метод — 405 и заголовок Allow', async () => {
  await withServer(createApp(config), async (base) => {
    const res = await fetch(`${base}/api/v1/health`, { method: 'POST' });
    assert.equal(res.status, 405);
    assert.equal(res.headers.get('allow'), 'GET');
  });
});

test('parseEnv: кавычки, комментарии, пустые строки', () => {
  const env = parseEnv('# comment\n\nAPP_NAME="Electronic Library API"\nHTTP_PORT=8080   # порт\nAPP_ENV=development\n');
  assert.deepEqual(env, { APP_NAME: 'Electronic Library API', HTTP_PORT: '8080', APP_ENV: 'development' });
});

test('loadConfig: неверный порт и окружение — ошибка конфигурации', () => {
  assert.throws(() => loadConfig({ HTTP_PORT: 'abc' }), /HTTP_PORT/);
  assert.throws(() => loadConfig({ HTTP_PORT: '70000' }), /HTTP_PORT/);
  assert.throws(() => loadConfig({ APP_ENV: 'prod' }), /APP_ENV/);
});

test('loadConfig: значения по умолчанию', () => {
  const c = loadConfig({});
  assert.equal(c.httpPort, 8080);
  assert.equal(c.appEnv, 'development');
});
