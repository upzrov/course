import { beforeEach, describe, expect, it, jest, mock } from "bun:test";

import { PlayerService } from "../bll/services/player-service";
import { Player } from "../bll/models/player";
import {
  BusinessLogicException,
  NotFoundException,
  ValidationException,
} from "../bll/exceptions";
import { HealthStatus, PlayerStatus } from "../bll/enums";

import type { IPlayerRepository } from "../dal/player-repository";

const mockPlayerRepository: IPlayerRepository = {
  add: mock(),
  getById: mock(),
  getAll: mock(),
  update: mock(),
  delete: mock(),
  findByLastName: mock(),
  searchByNameOrLastName: mock(),
};

let playerService: PlayerService;

const buildPlayer = () =>
  new Player("John", "Doe", new Date("1990-01-01"), 1000);

beforeEach(() => {
  jest.clearAllMocks();
  playerService = new PlayerService(mockPlayerRepository);
});

describe("PlayerService", () => {
  describe("createPlayer", () => {
    it("creates and persists a valid player", async () => {
      const data = {
        firstName: "Lionel",
        lastName: "Messi",
        birthDate: new Date("1987-06-24"),
        salary: 1_000_000,
      };

      (mockPlayerRepository.add as jest.Mock).mockImplementation(
        (player: Player) => Promise.resolve(player)
      );

      const player = await playerService.createPlayer(
        data.firstName,
        data.lastName,
        data.birthDate,
        data.salary
      );

      expect(player).toBeInstanceOf(Player);
      expect(player.firstName).toBe("Lionel");
      expect(player.status).toBe(PlayerStatus.Active);
      expect(mockPlayerRepository.add).toHaveBeenCalledTimes(1);
    });

    it("rejects negative salary", async () => {
      expect(
        playerService.createPlayer("Bad", "Salary", new Date("1990-01-01"), -10)
      ).rejects.toThrow(BusinessLogicException);
    });

    it("rejects players younger than 16", async () => {
      const recentBirthDate = new Date();
      recentBirthDate.setFullYear(recentBirthDate.getFullYear() - 10);

      expect(
        playerService.createPlayer("Too", "Young", recentBirthDate, 1000)
      ).rejects.toThrow("Player must be at least 16 years old.");
    });
  });

  describe("deletePlayer", () => {
    it("deletes a player marked as free agent", async () => {
      const player = buildPlayer();
      player.status = PlayerStatus.FreeAgent;

      (mockPlayerRepository.getById as jest.Mock).mockResolvedValue(player);
      (mockPlayerRepository.delete as jest.Mock).mockResolvedValue(undefined);

      await playerService.deletePlayer(player.id);

      expect(mockPlayerRepository.getById).toHaveBeenCalledWith(player.id);
      expect(mockPlayerRepository.delete).toHaveBeenCalledWith(player.id);
    });

    it("throws when deleting non-free-agent player", async () => {
      const player = buildPlayer();
      player.status = PlayerStatus.Active;

      (mockPlayerRepository.getById as jest.Mock).mockResolvedValue(player);

      expect(playerService.deletePlayer(player.id)).rejects.toThrow(
        BusinessLogicException
      );
      expect(mockPlayerRepository.delete).not.toHaveBeenCalled();
    });

    it("throws if player does not exist", async () => {
      (mockPlayerRepository.getById as jest.Mock).mockResolvedValue(null);

      expect(playerService.deletePlayer("missing-id")).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("update operations", () => {
    it("updates player salary", async () => {
      const player = buildPlayer();
      (mockPlayerRepository.getById as jest.Mock).mockResolvedValue(player);
      (mockPlayerRepository.update as jest.Mock).mockImplementation(
        (updated: Player) => Promise.resolve(updated)
      );

      const updated = await playerService.updatePlayerSalary(player.id, 2000);

      expect(updated.salary).toBe(2000);
      expect(mockPlayerRepository.update).toHaveBeenCalled();
    });

    it("updates player first name", async () => {
      const player = buildPlayer();
      (mockPlayerRepository.getById as jest.Mock).mockResolvedValue(player);
      (mockPlayerRepository.update as jest.Mock).mockImplementation(
        (updated: Player) => Promise.resolve(updated)
      );

      const updated = await playerService.updatePlayerFirstName(
        player.id,
        "Jane"
      );

      expect(updated.firstName).toBe("Jane");
    });

    it("updates player last name", async () => {
      const player = buildPlayer();
      (mockPlayerRepository.getById as jest.Mock).mockResolvedValue(player);
      (mockPlayerRepository.update as jest.Mock).mockImplementation(
        (updated: Player) => Promise.resolve(updated)
      );

      const updated = await playerService.updatePlayerLastName(
        player.id,
        "Smith"
      );

      expect(updated.lastName).toBe("Smith");
    });

    it("updates player birth date with validation", async () => {
      const player = buildPlayer();
      (mockPlayerRepository.getById as jest.Mock).mockResolvedValue(player);
      (mockPlayerRepository.update as jest.Mock).mockImplementation(
        (updated: Player) => Promise.resolve(updated)
      );

      const newBirthDate = new Date("1991-02-02");
      const updated = await playerService.updatePlayerBirthDate(
        player.id,
        newBirthDate
      );

      expect(updated.birthDate).toEqual(newBirthDate);
    });

    it("updates player status", async () => {
      const player = buildPlayer();
      (mockPlayerRepository.getById as jest.Mock).mockResolvedValue(player);
      (mockPlayerRepository.update as jest.Mock).mockImplementation(
        (updated: Player) => Promise.resolve(updated)
      );

      const updated = await playerService.updatePlayerStatus(
        player.id,
        PlayerStatus.Reserve
      );

      expect(updated.status).toBe(PlayerStatus.Reserve);
    });

    it("updates player health status", async () => {
      const player = buildPlayer();
      (mockPlayerRepository.getById as jest.Mock).mockResolvedValue(player);
      (mockPlayerRepository.update as jest.Mock).mockImplementation(
        (updated: Player) => Promise.resolve(updated)
      );

      const updated = await playerService.updatePlayerHealthStatus(
        player.id,
        HealthStatus.Injured
      );

      expect(updated.healthStatus).toBe(HealthStatus.Injured);
    });
  });

  describe("query operations", () => {
    it("returns player by id", async () => {
      const player = buildPlayer();
      (mockPlayerRepository.getById as jest.Mock).mockResolvedValue(player);

      const result = await playerService.getPlayerById(player.id);

      expect(result).toBe(player);
    });

    it("throws when getting missing player", async () => {
      (mockPlayerRepository.getById as jest.Mock).mockResolvedValue(null);

      expect(playerService.getPlayerById("missing-id")).rejects.toThrow(
        NotFoundException
      );
    });

    it("returns all players", async () => {
      const players = [buildPlayer(), buildPlayer()];
      (mockPlayerRepository.getAll as jest.Mock).mockResolvedValue(players);

      const result = await playerService.getAllPlayers();

      expect(result).toHaveLength(2);
    });

    it("searches players by name or surname", async () => {
      const players = [buildPlayer()];
      (
        mockPlayerRepository.searchByNameOrLastName as jest.Mock
      ).mockResolvedValue(players);

      const result = await playerService.findPlayersByNameOrSurname("jo");

      expect(result).toEqual(players);
    });
  });
});
