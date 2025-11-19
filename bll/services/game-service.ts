import { GameResult } from "../enums";
import {
  BusinessLogicException,
  NotFoundException,
  ValidationException,
} from "../exceptions";
import { Game } from "../models/game";

import type { IGameRepository } from "../../dal/game-repository";

export class GameService {
  constructor(private readonly gameRepository: IGameRepository) {}

  async createGame(
    gameDate: Date,
    location: string,
    opponentTeam: string
  ): Promise<Game> {
    if (!location.trim()) {
      throw new ValidationException("Game location is required.");
    }
    if (!opponentTeam.trim()) {
      throw new ValidationException("Opponent team name is required.");
    }

    const game = new Game(gameDate, location, opponentTeam);
    return this.gameRepository.add(game);
  }

  async deleteGame(id: string): Promise<void> {
    const game = await this.gameRepository.getById(id);
    if (!game) {
      throw new NotFoundException("Game", id);
    }
    await this.gameRepository.delete(id);
  }

  async addPlayerToGame(gameId: string, playerId: string): Promise<Game> {
    if (!playerId.trim()) {
      throw new ValidationException("Player id is required.");
    }

    const game = await this.getGameById(gameId);
    if (game.playerIds.includes(playerId)) {
      throw new BusinessLogicException(
        "Player is already assigned to this game."
      );
    }

    game.addPlayer(playerId);
    return this.gameRepository.update(game);
  }

  async removePlayerFromGame(gameId: string, playerId: string): Promise<Game> {
    const game = await this.getGameById(gameId);
    if (!game.playerIds.includes(playerId)) {
      throw new BusinessLogicException("Player is not assigned to this game.");
    }
    game.removePlayer(playerId);
    return this.gameRepository.update(game);
  }

  async updateGameDate(gameId: string, newDate: Date): Promise<Game> {
    const game = await this.getGameById(gameId);
    game.gameDate = newDate;
    return this.gameRepository.update(game);
  }

  async updateGameLocation(gameId: string, newLocation: string): Promise<Game> {
    if (!newLocation.trim()) {
      throw new ValidationException("Location cannot be empty.");
    }

    const game = await this.getGameById(gameId);
    game.location = newLocation;
    return this.gameRepository.update(game);
  }

  async updateSpectators(gameId: string, spectators: number): Promise<Game> {
    if (!Number.isFinite(spectators) || spectators < 0) {
      throw new ValidationException(
        "Spectators count must be a non-negative number."
      );
    }

    const game = await this.getGameById(gameId);
    game.spectators = spectators;
    return this.gameRepository.update(game);
  }

  async setGameResult(
    gameId: string,
    result: GameResult,
    spectators?: number
  ): Promise<Game> {
    const game = await this.getGameById(gameId);
    if (spectators !== undefined) {
      if (!Number.isFinite(spectators) || spectators < 0) {
        throw new ValidationException(
          "Spectators count must be a non-negative number."
        );
      }
      game.spectators = spectators;
    }
    game.result = result;
    return this.gameRepository.update(game);
  }

  async getGameById(id: string): Promise<Game> {
    const game = await this.gameRepository.getById(id);
    if (!game) {
      throw new NotFoundException("Game", id);
    }
    return game;
  }

  async getAllGames(): Promise<Game[]> {
    return this.gameRepository.getAll();
  }

  async getGamesSortedByDate(): Promise<Game[]> {
    const games = await this.getAllGames();
    return games.sort((a, b) => a.gameDate.getTime() - b.gameDate.getTime());
  }

  async getGamesByResult(result: GameResult): Promise<Game[]> {
    const games = await this.getAllGames();
    return games.filter((game) => game.result === result);
  }

  async findGamesByDateAndOpponent(
    gameDate: Date,
    opponentTeam: string
  ): Promise<Game[]> {
    const games = await this.getAllGames();
    const targetDate = gameDate.toDateString();
    return games.filter(
      (game) =>
        game.gameDate.toDateString() === targetDate &&
        game.opponentTeam.toLowerCase() === opponentTeam.toLowerCase()
    );
  }

  async getGamesByLocation(location: string): Promise<Game[]> {
    const games = await this.getAllGames();
    return games.filter(
      (game) => game.location.toLowerCase() === location.toLowerCase()
    );
  }
}
