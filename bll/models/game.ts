import { randomUUIDv7 } from "bun";
import { GameResult } from "../enums";
import type { Identifiable } from "./identifiable";

export class Game implements Identifiable {
  private _id: string;
  private _gameDate: Date;
  private _location: string; // Або ID стадіону
  private _opponentTeam: string;
  private _playerIds: string[] = []; // Склад на гру
  private _spectators = 0;
  private _result = GameResult.NotPlayed;

  constructor(gameDate: Date, location: string, opponentTeam: string) {
    this._id = randomUUIDv7();
    this._gameDate = gameDate;
    this._location = location;
    this._opponentTeam = opponentTeam;
  }

  get id(): string {
    return this._id;
  }
  get gameDate(): Date {
    return this._gameDate;
  }
  set gameDate(value: Date) {
    this._gameDate = value;
  }

  get location(): string {
    return this._location;
  }
  set location(value: string) {
    this._location = value;
  }

  get opponentTeam(): string {
    return this._opponentTeam;
  }
  set opponentTeam(value: string) {
    this._opponentTeam = value;
  }

  get result(): GameResult {
    return this._result;
  }

  set result(value: GameResult) {
    this._result = value;
  }

  get spectators(): number {
    return this._spectators;
  }

  set spectators(value: number) {
    if (value < 0) {
      throw new Error("Spectator count cannot be negative");
    }
    this._spectators = value;
  }

  get playerIds(): string[] {
    return [...this._playerIds];
  }

  set playerIds(ids: string[]) {
    this._playerIds = [...new Set(ids)];
  }

  addPlayer(playerId: string) {
    if (!this._playerIds.includes(playerId)) {
      this._playerIds.push(playerId);
    }
  }

  removePlayer(playerId: string) {
    this._playerIds = this._playerIds.filter((id) => id !== playerId);
  }

  setGameResult(result: GameResult, spectators: number) {
    this.result = result;
    this.spectators = spectators;
  }

  getInfo(): string {
    return `[${this.id}] Date: ${this.gameDate.toLocaleString()} vs ${
      this._opponentTeam
    } at ${this.location}. Result: ${this.result} (${
      this._spectators
    } spectators)`;
  }
}
