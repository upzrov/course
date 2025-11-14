import { promises as fs } from "fs";
import * as path from "path";
import { Game } from "../bll/models/game";
import { GameResult } from "../bll/enums";

import type { IGameRepository } from "./game-repository";

export class GameFileRepository implements IGameRepository {
  private readonly filePath: string;

  constructor(storagePath: string = "data") {
    this.filePath = path.join(process.cwd(), storagePath, "games.json");
    fs.mkdir(path.dirname(this.filePath), { recursive: true }).catch(
      console.error
    );
  }

  private async readStore(): Promise<Game[]> {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      const parsed = JSON.parse(data) as any[];
      return parsed.map((raw) => {
        const game = new Game(
          new Date(raw._gameDate),
          raw._location,
          raw._opponentTeam
        );
        Object.assign(game, {
          _id: raw._id,
          _playerIds: raw._playerIds || [],
          _spectators: raw._spectators || 0,
          _result: raw._result || GameResult.NotPlayed,
        });
        return game;
      });
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return [];
      }
      throw new Error(`Failed to read game store: ${error.message}`);
    }
  }

  private async writeStore(games: Game[]): Promise<void> {
    try {
      await fs.writeFile(
        this.filePath,
        JSON.stringify(games, null, 2),
        "utf-8"
      );
    } catch (error: any) {
      throw new Error(`Failed to write game store: ${error.message}`);
    }
  }

  async add(entity: Game): Promise<Game> {
    const games = await this.readStore();
    games.push(entity);
    await this.writeStore(games);
    return entity;
  }

  async getById(id: string): Promise<Game | null> {
    const games = await this.readStore();
    return games.find((game) => game.id === id) ?? null;
  }

  async getAll(): Promise<Game[]> {
    return this.readStore();
  }

  async update(entity: Game): Promise<Game> {
    const games = await this.readStore();
    const index = games.findIndex((game) => game.id === entity.id);
    if (index === -1) {
      throw new Error(`Game with id ${entity.id} not found for update`);
    }
    games[index] = entity;
    await this.writeStore(games);
    return entity;
  }

  async delete(id: string): Promise<void> {
    const games = await this.readStore();
    const filtered = games.filter((game) => game.id !== id);
    if (filtered.length === games.length) {
      throw new Error(`Game with id ${id} not found for deletion`);
    }
    await this.writeStore(filtered);
  }
}
