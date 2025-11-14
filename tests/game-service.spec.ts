import { beforeEach, describe, expect, it, jest, mock } from "bun:test";

import { GameService } from "../bll/services/game-service";
import { Game } from "../bll/models/game";
import { GameResult } from "../bll/enums";
import {
  BusinessLogicException,
  NotFoundException,
  ValidationException,
} from "../bll/exceptions";

import type { IGameRepository } from "../dal/game-repository";

const mockGameRepository: IGameRepository = {
  add: mock(),
  getById: mock(),
  getAll: mock(),
  update: mock(),
  delete: mock(),
};

let gameService: GameService;

const buildGame = () =>
  new Game(new Date("2024-06-01T18:00:00Z"), "Kyiv", "Shakhtar");

beforeEach(() => {
  jest.clearAllMocks();
  gameService = new GameService(mockGameRepository);
});

describe("GameService", () => {
  describe("createGame", () => {
    it("creates a game with valid data", async () => {
      const game = buildGame();
      (mockGameRepository.add as jest.Mock).mockResolvedValue(game);

      const saved = await gameService.createGame(
        game.gameDate,
        game.location,
        game.opponentTeam
      );

      expect(saved).toBe(game);
      expect(mockGameRepository.add).toHaveBeenCalledWith(
        expect.objectContaining({
          gameDate: game.gameDate,
          location: game.location,
          opponentTeam: game.opponentTeam,
        })
      );
    });

    it("validates location and opponent team", async () => {
      expect(
        gameService.createGame(new Date(), "", "Opponent")
      ).rejects.toThrow(ValidationException);

      expect(
        gameService.createGame(new Date(), "Location", "   ")
      ).rejects.toThrow(ValidationException);
    });
  });

  describe("deleteGame", () => {
    it("deletes existing game", async () => {
      const game = buildGame();
      (mockGameRepository.getById as jest.Mock).mockResolvedValue(game);
      (mockGameRepository.delete as jest.Mock).mockResolvedValue(undefined);

      await gameService.deleteGame(game.id);

      expect(mockGameRepository.delete).toHaveBeenCalledWith(game.id);
    });

    it("throws for missing game", async () => {
      (mockGameRepository.getById as jest.Mock).mockResolvedValue(null);

      expect(gameService.deleteGame("missing")).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("player management", () => {
    it("adds player to a game", async () => {
      const game = buildGame();
      (mockGameRepository.getById as jest.Mock).mockResolvedValue(game);
      (mockGameRepository.update as jest.Mock).mockImplementation(
        (updated: Game) => Promise.resolve(updated)
      );

      await gameService.addPlayerToGame(game.id, "player-1");

      expect(game.playerIds).toContain("player-1");
      expect(mockGameRepository.update).toHaveBeenCalled();
    });

    it("prevents duplicate players", async () => {
      const game = buildGame();
      game.addPlayer("player-1");

      (mockGameRepository.getById as jest.Mock).mockResolvedValue(game);

      expect(gameService.addPlayerToGame(game.id, "player-1")).rejects.toThrow(
        BusinessLogicException
      );
    });

    it("removes player from a game", async () => {
      const game = buildGame();
      game.addPlayer("player-1");

      (mockGameRepository.getById as jest.Mock).mockResolvedValue(game);
      (mockGameRepository.update as jest.Mock).mockImplementation(
        (updated: Game) => Promise.resolve(updated)
      );

      await gameService.removePlayerFromGame(game.id, "player-1");

      expect(game.playerIds).not.toContain("player-1");
      expect(mockGameRepository.update).toHaveBeenCalled();
    });

    it("throws when removing absent player", async () => {
      const game = buildGame();

      (mockGameRepository.getById as jest.Mock).mockResolvedValue(game);

      expect(
        gameService.removePlayerFromGame(game.id, "player-1")
      ).rejects.toThrow(BusinessLogicException);
    });
  });

  describe("updates", () => {
    it("updates game date", async () => {
      const game = buildGame();
      (mockGameRepository.getById as jest.Mock).mockResolvedValue(game);
      (mockGameRepository.update as jest.Mock).mockImplementation(
        (updated: Game) => Promise.resolve(updated)
      );

      const newDate = new Date("2024-07-01T18:00:00Z");
      const updated = await gameService.updateGameDate(game.id, newDate);

      expect(updated.gameDate).toEqual(newDate);
    });

    it("updates game location", async () => {
      const game = buildGame();
      (mockGameRepository.getById as jest.Mock).mockResolvedValue(game);
      (mockGameRepository.update as jest.Mock).mockResolvedValue(game);

      await gameService.updateGameLocation(game.id, "Lviv");

      expect(game.location).toBe("Lviv");
    });

    it("validates empty location update", async () => {
      expect(gameService.updateGameLocation("id", "")).rejects.toThrow(
        ValidationException
      );
    });

    it("updates spectators", async () => {
      const game = buildGame();
      (mockGameRepository.getById as jest.Mock).mockResolvedValue(game);
      (mockGameRepository.update as jest.Mock).mockResolvedValue(game);

      await gameService.updateSpectators(game.id, 5000);

      expect(game.spectators).toBe(5000);
    });

    it("validates spectators count", async () => {
      expect(gameService.updateSpectators("id", -1)).rejects.toThrow(
        ValidationException
      );
    });

    it("sets game result and spectators", async () => {
      const game = buildGame();
      (mockGameRepository.getById as jest.Mock).mockResolvedValue(game);
      (mockGameRepository.update as jest.Mock).mockResolvedValue(game);

      await gameService.setGameResult(game.id, GameResult.Win, 1000);

      expect(game.result).toBe(GameResult.Win);
      expect(game.spectators).toBe(1000);
    });
  });

  describe("queries", () => {
    it("returns game by id", async () => {
      const game = buildGame();
      (mockGameRepository.getById as jest.Mock).mockResolvedValue(game);

      const result = await gameService.getGameById(game.id);

      expect(result).toBe(game);
    });

    it("throws when game not found", async () => {
      (mockGameRepository.getById as jest.Mock).mockResolvedValue(null);

      expect(gameService.getGameById("missing")).rejects.toThrow(
        NotFoundException
      );
    });

    it("returns games sorted by date", async () => {
      const early = new Game(new Date("2024-01-01"), "Kyiv", "Team A");
      const late = new Game(new Date("2024-02-01"), "Kyiv", "Team B");

      (mockGameRepository.getAll as jest.Mock).mockResolvedValue([late, early]);

      const sorted = await gameService.getGamesSortedByDate();

      expect(sorted[0]).toBe(early);
      expect(sorted[1]).toBe(late);
    });

    it("filters games by result", async () => {
      const win = buildGame();
      win.result = GameResult.Win;
      const loss = buildGame();
      loss.result = GameResult.Loss;

      (mockGameRepository.getAll as jest.Mock).mockResolvedValue([win, loss]);

      const wins = await gameService.getGamesByResult(GameResult.Win);

      expect(wins).toEqual([win]);
    });

    it("finds games by date and opponent", async () => {
      const targetDate = new Date("2024-05-01");
      const match = new Game(targetDate, "Kyiv", "Opponent");
      const other = new Game(new Date("2024-05-02"), "Kyiv", "Different");
      (mockGameRepository.getAll as jest.Mock).mockResolvedValue([
        match,
        other,
      ]);

      const result = await gameService.findGamesByDateAndOpponent(
        targetDate,
        "Opponent"
      );

      expect(result).toEqual([match]);
    });

    it("finds games by location", async () => {
      const kyivGame = new Game(new Date(), "Kyiv", "Opponent");
      const lvivGame = new Game(new Date(), "Lviv", "Opponent");

      (mockGameRepository.getAll as jest.Mock).mockResolvedValue([
        kyivGame,
        lvivGame,
      ]);

      const result = await gameService.getGamesByLocation("Kyiv");

      expect(result).toEqual([kyivGame]);
    });
  });
});
