// Маршрутизатор: сопоставляет метод и путь запроса с обработчиком контроллера.
import { sendError } from './http.js';

/**
 * @param {Array<{ method: string, path: string, handler: Function }>} routes
 */
export function createRouter(routes) {
  return async function handleRequest(req, res) {
    try {
      const { pathname } = new URL(req.url, 'http://localhost');
      const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

      const samePath = routes.filter((r) => r.path === path);
      if (samePath.length === 0) {
        return sendError(res, 404, 'NOT_FOUND', `Маршрут ${req.method} ${path} не найден`);
      }

      const route = samePath.find((r) => r.method === req.method);
      if (!route) {
        const allow = samePath.map((r) => r.method).join(', ');
        return sendError(res, 405, 'METHOD_NOT_ALLOWED', `Метод ${req.method} не поддерживается для ${path}`, {
          Allow: allow,
        });
      }

      await route.handler(req, res);
    } catch (err) {
      console.error('Необработанная ошибка:', err);
      if (!res.headersSent) {
        sendError(res, 500, 'INTERNAL_ERROR', 'Внутренняя ошибка сервера');
      } else {
        res.end();
      }
    }
  };
}
