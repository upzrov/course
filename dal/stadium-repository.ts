import { Stadium } from "../bll/models/stadium";

import type { IRepository } from "./repository";

export interface IStadiumRepository extends IRepository<Stadium> {
  findByName(name: string): Promise<Stadium | null>;
}
