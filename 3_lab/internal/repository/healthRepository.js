// Repository / Data Access Layer: работа с хранилищем данных.
//
// База данных PostgreSQL будет подключена в следующих лабораторных работах.
// Пока используется хранилище в памяти. Позже появится PostgresHealthRepository
// с тем же методом ping(), который выполнит запрос "SELECT 1" к базе.
// Слой сервисов при этом менять не придется — он зависит только от метода ping().

export class InMemoryHealthRepository {
  /** Проверяет доступность хранилища. */
  async ping() {
    return true;
  }
}
