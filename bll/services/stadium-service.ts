import {
  BusinessLogicException,
  NotFoundException,
  ValidationException,
} from "../exceptions";
import { Stadium } from "../models/stadium";

import type { IStadiumRepository } from "../../dal/stadium-repository";

export class StadiumService {
  constructor(private readonly stadiumRepository: IStadiumRepository) {}

  async createStadium(
    name: string,
    capacity: number,
    ticketPrice: number
  ): Promise<Stadium> {
    if (!name.trim()) {
      throw new ValidationException("Stadium name is required.");
    }
    if (capacity < 0) {
      throw new ValidationException("Stadium capacity cannot be negative.");
    }
    if (ticketPrice < 0) {
      throw new ValidationException("Ticket price cannot be negative.");
    }

    const duplicate = await this.stadiumRepository.findByName(name);
    if (duplicate) {
      throw new BusinessLogicException(
        "Stadium with the same name already exists."
      );
    }

    const stadium = new Stadium(name, capacity, ticketPrice);
    return this.stadiumRepository.add(stadium);
  }

  async deleteStadium(id: string): Promise<void> {
    const stadium = await this.stadiumRepository.getById(id);
    if (!stadium) {
      throw new NotFoundException("Stadium", id);
    }
    await this.stadiumRepository.delete(id);
  }

  async updateCapacity(id: string, capacity: number): Promise<Stadium> {
    if (capacity < 0) {
      throw new ValidationException("Capacity cannot be negative.");
    }
    const stadium = await this.getStadiumById(id);
    stadium.capacity = capacity;
    return this.stadiumRepository.update(stadium);
  }

  async updateTicketPrice(id: string, price: number): Promise<Stadium> {
    if (price < 0) {
      throw new ValidationException("Ticket price cannot be negative.");
    }
    const stadium = await this.getStadiumById(id);
    stadium.ticketPrice = price;
    return this.stadiumRepository.update(stadium);
  }

  async renameStadium(id: string, name: string): Promise<Stadium> {
    if (!name.trim()) {
      throw new ValidationException("Stadium name cannot be empty.");
    }

    const existing = await this.stadiumRepository.findByName(name);
    if (existing && existing.id !== id) {
      throw new BusinessLogicException(
        "Another stadium with the same name already exists."
      );
    }

    const stadium = await this.getStadiumById(id);
    stadium.name = name;
    return this.stadiumRepository.update(stadium);
  }

  async getStadiumById(id: string): Promise<Stadium> {
    const stadium = await this.stadiumRepository.getById(id);
    if (!stadium) {
      throw new NotFoundException("Stadium", id);
    }
    return stadium;
  }

  async getAllStadiums(): Promise<Stadium[]> {
    return this.stadiumRepository.getAll();
  }

  async findStadiumsByName(name: string): Promise<Stadium[]> {
    const stadiums = await this.getAllStadiums();
    return stadiums.filter((stadium) =>
      stadium.name.toLowerCase().includes(name.toLowerCase())
    );
  }
}

