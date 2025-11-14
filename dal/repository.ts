// Базовий узагальнений інтерфейс репозиторію
export interface IRepository<T extends { id: string }> {
  add(entity: T): Promise<T>;
  getById(id: string): Promise<T | null>;
  getAll(): Promise<T[]>;
  update(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}
