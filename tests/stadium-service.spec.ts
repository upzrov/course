import { beforeEach, describe, expect, it, jest, mock } from "bun:test";

import { StadiumService } from "../bll/services/stadium-service";
import { Stadium } from "../bll/models/stadium";
import {
  BusinessLogicException,
  NotFoundException,
  ValidationException,
} from "../bll/exceptions";

import type { IStadiumRepository } from "../dal/stadium-repository";

const mockStadiumRepository: IStadiumRepository = {
  add: mock(),
  getById: mock(),
  getAll: mock(),
  update: mock(),
  delete: mock(),
  findByName: mock(),
};

let stadiumService: StadiumService;

const buildStadium = () => new Stadium("Olimpiyskiy", 50000, 250);

beforeEach(() => {
  jest.clearAllMocks();
  stadiumService = new StadiumService(mockStadiumRepository);
});

describe("StadiumService", () => {
  describe("createStadium", () => {
    it("creates a stadium with valid data", async () => {
      const stadium = buildStadium();
      (mockStadiumRepository.findByName as jest.Mock).mockResolvedValue(null);
      (mockStadiumRepository.add as jest.Mock).mockResolvedValue(stadium);

      const saved = await stadiumService.createStadium(
        stadium.name,
        stadium.capacity,
        stadium.ticketPrice
      );

      expect(saved).toBe(stadium);
      expect(mockStadiumRepository.add).toHaveBeenCalled();
    });

    it("validates input data", async () => {
      expect(stadiumService.createStadium("", 1000, 100)).rejects.toThrow(
        ValidationException
      );
      expect(stadiumService.createStadium("Test", -1, 100)).rejects.toThrow(
        ValidationException
      );
      expect(stadiumService.createStadium("Test", 1000, -1)).rejects.toThrow(
        ValidationException
      );
    });

    it("prevents duplicate stadium names", async () => {
      const stadium = buildStadium();
      (mockStadiumRepository.findByName as jest.Mock).mockResolvedValue(
        stadium
      );

      expect(
        stadiumService.createStadium(
          stadium.name,
          stadium.capacity,
          stadium.ticketPrice
        )
      ).rejects.toThrow(BusinessLogicException);
    });
  });

  describe("deleteStadium", () => {
    it("deletes existing stadium", async () => {
      const stadium = buildStadium();
      (mockStadiumRepository.getById as jest.Mock).mockResolvedValue(stadium);
      (mockStadiumRepository.delete as jest.Mock).mockResolvedValue(undefined);

      await stadiumService.deleteStadium(stadium.id);

      expect(mockStadiumRepository.delete).toHaveBeenCalledWith(stadium.id);
    });

    it("throws if stadium not found", async () => {
      (mockStadiumRepository.getById as jest.Mock).mockResolvedValue(null);

      expect(stadiumService.deleteStadium("missing")).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("updates", () => {
    it("updates capacity", async () => {
      const stadium = buildStadium();
      (mockStadiumRepository.getById as jest.Mock).mockResolvedValue(stadium);
      (mockStadiumRepository.update as jest.Mock).mockResolvedValue(stadium);

      const updated = await stadiumService.updateCapacity(stadium.id, 60000);

      expect(updated.capacity).toBe(60000);
    });

    it("rejects negative capacity", async () => {
      expect(stadiumService.updateCapacity("id", -1)).rejects.toThrow(
        ValidationException
      );
    });

    it("updates ticket price", async () => {
      const stadium = buildStadium();
      (mockStadiumRepository.getById as jest.Mock).mockResolvedValue(stadium);
      (mockStadiumRepository.update as jest.Mock).mockResolvedValue(stadium);

      const updated = await stadiumService.updateTicketPrice(stadium.id, 300);

      expect(updated.ticketPrice).toBe(300);
    });

    it("rejects negative price", async () => {
      expect(stadiumService.updateTicketPrice("id", -1)).rejects.toThrow(
        ValidationException
      );
    });

    it("renames stadium", async () => {
      const stadium = buildStadium();
      (mockStadiumRepository.getById as jest.Mock).mockResolvedValue(stadium);
      (mockStadiumRepository.findByName as jest.Mock).mockResolvedValue(null);
      (mockStadiumRepository.update as jest.Mock).mockResolvedValue(stadium);

      const updated = await stadiumService.renameStadium(
        stadium.id,
        "Arena Lviv"
      );

      expect(updated.name).toBe("Arena Lviv");
    });

    it("rejects duplicate name on rename", async () => {
      const stadium = buildStadium();
      (mockStadiumRepository.findByName as jest.Mock).mockResolvedValue({
        ...stadium,
        id: "another-id",
      });

      (mockStadiumRepository.getById as jest.Mock).mockResolvedValue(stadium);

      expect(
        stadiumService.renameStadium(stadium.id, stadium.name)
      ).rejects.toThrow(BusinessLogicException);
    });
  });

  describe("queries", () => {
    it("returns stadium by id", async () => {
      const stadium = buildStadium();
      (mockStadiumRepository.getById as jest.Mock).mockResolvedValue(stadium);

      const result = await stadiumService.getStadiumById(stadium.id);

      expect(result).toBe(stadium);
    });

    it("throws when stadium missing", async () => {
      (mockStadiumRepository.getById as jest.Mock).mockResolvedValue(null);

      expect(stadiumService.getStadiumById("missing")).rejects.toThrow(
        NotFoundException
      );
    });

    it("returns all stadiums", async () => {
      const stadiums = [buildStadium()];
      (mockStadiumRepository.getAll as jest.Mock).mockResolvedValue(stadiums);

      const result = await stadiumService.getAllStadiums();

      expect(result).toEqual(stadiums);
    });

    it("searches stadiums by name fragment", async () => {
      const stadiums = [buildStadium(), new Stadium("Arena Lviv", 30000, 150)];
      (mockStadiumRepository.getAll as jest.Mock).mockResolvedValue(stadiums);

      const result = await stadiumService.findStadiumsByName("arena");

      expect(result).toEqual([stadiums[1]!]);
    });
  });
});
