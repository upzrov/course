import { Game } from "../bll/models/game";

import type { IRepository } from "./repository";

export interface IGameRepository extends IRepository<Game> {}

