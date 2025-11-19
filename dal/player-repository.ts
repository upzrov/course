import { Player } from "../bll/models/player";

import type { IRepository } from "./repository";

export interface IPlayerRepository extends IRepository<Player> {
  findByLastName(lastName: string): Promise<Player[]>;
  searchByNameOrLastName(term: string): Promise<Player[]>;
}
