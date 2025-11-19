import type { Identifiable } from "../bll/models/identifiable";

// Базовий узагальнений інтерфейс репозиторію
export interface IRepository<T extends Identifiable> {
  add(entity: T): Promise<T>;
  getById(id: string): Promise<T | null>;
  getAll(): Promise<T[]>;
  update(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}
