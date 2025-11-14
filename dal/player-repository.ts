import { Player } from "../bll/models/player";

import type { IRepository } from "./repository";

// Специфічні методи для гравців, якщо будуть потрібні
export interface IPlayerRepository extends IRepository<Player> {
  // Наприклад:
  findByLastName(lastName: string): Promise<Player[]>;
  searchByNameOrLastName(term: string): Promise<Player[]>;
}
