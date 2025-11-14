import { promises as fs } from "fs";
import * as path from "path";
import { Player } from "../bll/models/player";

import type { IPlayerRepository } from "./player-repository";

// Цей клас реалізує логіку збереження у файл (серіалізація)
export class PlayerFileRepository implements IPlayerRepository {
  private readonly filePath: string;

  constructor(storagePath = "data") {
    // Ми будемо зберігати дані в data/players.json
    this.filePath = path.join(process.cwd(), storagePath, "players.json");

    fs.mkdir(path.dirname(this.filePath), { recursive: true }).catch(
      console.error
    );
  }

  // Допоміжний метод для читання всіх даних
  private async readStore(): Promise<Player[]> {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      const playersData = JSON.parse(data) as any[];
      // Відновлюємо прототипи класів (важливо для серіалізації)
      return playersData.map((data) => {
        const player = new Player(
          data._firstName,
          data._lastName,
          new Date(data._birthDate),
          data._salary
        );
        Object.assign(player, {
          _id: data._id,
          _status: data._status,
          _healthStatus: data._healthStatus,
        });
        return player;
      });
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return []; // Файл не знайдено, повертаємо порожній масив
      }
      throw new Error(`Failed to read data store: ${error.message}`);
    }
  }

  // Допоміжний метод для запису
  private async writeStore(players: Player[]): Promise<void> {
    try {
      await fs.writeFile(
        this.filePath,
        JSON.stringify(players, null, 2),
        "utf-8"
      );
    } catch (error: any) {
      throw new Error(`Failed to write data store: ${error.message}`);
    }
  }

  async add(entity: Player): Promise<Player> {
    const players = await this.readStore();
    players.push(entity);
    await this.writeStore(players);
    return entity;
  }

  async getById(id: string): Promise<Player | null> {
    const players = await this.readStore();
    return players.find((p) => p.id === id) || null;
  }

  async getAll(): Promise<Player[]> {
    return await this.readStore();
  }

  async update(entity: Player): Promise<Player> {
    const players = await this.readStore();
    const index = players.findIndex((p) => p.id === entity.id);
    if (index === -1) {
      throw new Error(`Player with id ${entity.id} not found for update`);
    }
    players[index] = entity;
    await this.writeStore(players);
    return entity;
  }

  async delete(id: string): Promise<void> {
    let players = await this.readStore();
    const initialLength = players.length;
    players = players.filter((p) => p.id !== id);
    if (players.length === initialLength) {
      throw new Error(`Player with id ${id} not found for deletion`);
    }
    await this.writeStore(players);
  }

  async findByLastName(lastName: string): Promise<Player[]> {
    const players = await this.readStore();
    return players.filter(
      (p) => p.lastName.toLowerCase() === lastName.toLowerCase()
    );
  }

  async searchByNameOrLastName(term: string): Promise<Player[]> {
    const value = term.toLowerCase();
    const players = await this.readStore();
    return players.filter(
      (player) =>
        player.firstName.toLowerCase().includes(value) ||
        player.lastName.toLowerCase().includes(value)
    );
  }
}
