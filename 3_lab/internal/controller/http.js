// Вспомогательные функции транспортного слоя: отправка JSON и ошибок
// в едином формате ErrorResponse из спецификации openapi.yaml (ЛР2).

export function sendJson(res, statusCode, body, headers = {}) {
  const payload = JSON.stringify(body, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    ...headers,
  });
  res.end(payload);
}

export function sendError(res, statusCode, code, message, headers = {}) {
  sendJson(res, statusCode, { code, message, timestamp: new Date().toISOString() }, headers);
}
