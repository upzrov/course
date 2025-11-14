import { HealthStatus, PlayerStatus } from "../enums";
import {
  BusinessLogicException,
  NotFoundException,
  ValidationException,
} from "../exceptions";
import { Player } from "../models/player";

import type { IPlayerRepository } from "../../dal/player-repository";

export class PlayerService {
  private playerRepository: IPlayerRepository;

  constructor(playerRepository: IPlayerRepository) {
    this.playerRepository = playerRepository;
  }

  async createPlayer(
    firstName: string,
    lastName: string,
    birthDate: Date,
    salary: number
  ): Promise<Player> {
    if (!firstName || !lastName) {
      throw new ValidationException("First name and last name are required.");
    }
    if (salary < 0) {
      throw new BusinessLogicException("Salary cannot be negative.");
    }

    // Перевірка на "повноліття" (як приклад бізнес-логіки)
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 16) {
      throw new BusinessLogicException("Player must be at least 16 years old.");
    }

    const player = new Player(firstName, lastName, birthDate, salary);
    player.status = PlayerStatus.Active; // Бізнес-правило: новий гравець одразу активний

    return await this.playerRepository.add(player);
  }

  async deletePlayer(id: string): Promise<void> {
    const player = await this.playerRepository.getById(id);
    if (!player) {
      throw new NotFoundException("Player", id);
    }

    // Бізнес-правило: не можна видалити гравця, якщо він не вільний агент
    if (player.status !== PlayerStatus.FreeAgent) {
      throw new BusinessLogicException(
        "Cannot delete a player who is not a free agent."
      );
    }

    await this.playerRepository.delete(id);
  }

  async updatePlayerSalary(id: string, newSalary: number): Promise<Player> {
    if (newSalary < 0) {
      throw new BusinessLogicException("Salary cannot be negative.");
    }

    const player = await this.playerRepository.getById(id);
    if (!player) {
      throw new NotFoundException("Player", id);
    }

    player.salary = newSalary;
    return await this.playerRepository.update(player);
  }

  async updatePlayerFirstName(
    id: string,
    newFirstName: string
  ): Promise<Player> {
    if (!newFirstName || newFirstName.trim() === "") {
      throw new ValidationException("First name cannot be empty.");
    }

    const player = await this.playerRepository.getById(id);
    if (!player) {
      throw new NotFoundException("Player", id);
    }

    player.firstName = newFirstName;
    return await this.playerRepository.update(player);
  }

  async updatePlayerLastName(id: string, newLastName: string): Promise<Player> {
    if (!newLastName || newLastName.trim() === "") {
      throw new ValidationException("Last name cannot be empty.");
    }

    const player = await this.playerRepository.getById(id);
    if (!player) {
      throw new NotFoundException("Player", id);
    }

    player.lastName = newLastName;
    return await this.playerRepository.update(player);
  }

  async updatePlayerBirthDate(id: string, newBirthDate: Date): Promise<Player> {
    // Перевірка на "повноліття"
    const age = new Date().getFullYear() - newBirthDate.getFullYear();
    if (age < 16) {
      throw new BusinessLogicException("Player must be at least 16 years old.");
    }

    const player = await this.playerRepository.getById(id);
    if (!player) {
      throw new NotFoundException("Player", id);
    }

    player.birthDate = newBirthDate;
    return await this.playerRepository.update(player);
  }

  async updatePlayerStatus(
    id: string,
    newStatus: PlayerStatus
  ): Promise<Player> {
    const player = await this.playerRepository.getById(id);
    if (!player) {
      throw new NotFoundException("Player", id);
    }
    player.status = newStatus;
    return await this.playerRepository.update(player);
  }

  async updatePlayerHealthStatus(
    id: string,
    newHealthStatus: HealthStatus
  ): Promise<Player> {
    const player = await this.playerRepository.getById(id);
    if (!player) {
      throw new NotFoundException("Player", id);
    }
    player.healthStatus = newHealthStatus;
    return await this.playerRepository.update(player);
  }

  async getPlayerById(id: string): Promise<Player> {
    const player = await this.playerRepository.getById(id);
    if (!player) {
      throw new NotFoundException("Player", id);
    }
    return player;
  }

  async getAllPlayers(): Promise<Player[]> {
    return await this.playerRepository.getAll();
  }

  async findPlayersByLastName(lastName: string): Promise<Player[]> {
    return await this.playerRepository.findByLastName(lastName);
  }

  async findPlayersByNameOrSurname(term: string): Promise<Player[]> {
    return await this.playerRepository.searchByNameOrLastName(term);
  }
}
