import { promises as fs } from "fs";
import * as path from "path";
import { Stadium } from "../bll/models/stadium";

import type { IStadiumRepository } from "./stadium-repository";

export class StadiumFileRepository implements IStadiumRepository {
  private readonly filePath: string;

  constructor(storagePath: string = "data") {
    this.filePath = path.join(process.cwd(), storagePath, "stadiums.json");
    fs.mkdir(path.dirname(this.filePath), { recursive: true }).catch(
      console.error
    );
  }

  private async readStore(): Promise<Stadium[]> {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      const parsed = JSON.parse(data) as any[];
      return parsed.map((raw) => {
        const stadium = new Stadium(raw._name, raw._capacity, raw._ticketPrice);
        Object.assign(stadium, {
          _id: raw._id,
        });
        return stadium;
      });
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return [];
      }
      throw new Error(`Failed to read stadium store: ${error.message}`);
    }
  }

  private async writeStore(stadiums: Stadium[]): Promise<void> {
    try {
      await fs.writeFile(
        this.filePath,
        JSON.stringify(stadiums, null, 2),
        "utf-8"
      );
    } catch (error: any) {
      throw new Error(`Failed to write stadium store: ${error.message}`);
    }
  }

  async add(entity: Stadium): Promise<Stadium> {
    const stadiums = await this.readStore();
    stadiums.push(entity);
    await this.writeStore(stadiums);
    return entity;
  }

  async getById(id: string): Promise<Stadium | null> {
    const stadiums = await this.readStore();
    return stadiums.find((stadium) => stadium.id === id) ?? null;
  }

  async getAll(): Promise<Stadium[]> {
    return this.readStore();
  }

  async update(entity: Stadium): Promise<Stadium> {
    const stadiums = await this.readStore();
    const index = stadiums.findIndex((stadium) => stadium.id === entity.id);
    if (index === -1) {
      throw new Error(`Stadium with id ${entity.id} not found for update`);
    }
    stadiums[index] = entity;
    await this.writeStore(stadiums);
    return entity;
  }

  async delete(id: string): Promise<void> {
    const stadiums = await this.readStore();
    const filtered = stadiums.filter((stadium) => stadium.id !== id);
    if (filtered.length === stadiums.length) {
      throw new Error(`Stadium with id ${id} not found for deletion`);
    }
    await this.writeStore(filtered);
  }

  async findByName(name: string): Promise<Stadium | null> {
    const stadiums = await this.readStore();
    return (
      stadiums.find(
        (stadium) => stadium.name.toLowerCase() === name.toLowerCase()
      ) ?? null
    );
  }
}
