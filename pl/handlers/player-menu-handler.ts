import { HealthStatus, PlayerStatus } from "../../bll/enums";
import {
  BusinessLogicException,
  NotFoundException,
  ValidationException,
} from "../../bll/exceptions";
import { InputValidator } from ".././input-validator";

import type { PlayerService } from "../../bll/services";

export class PlayerMenuHandler {
  constructor(private playerService: PlayerService) {}

  async handleMenu(): Promise<void> {
    while (true) {
      console.log("Управління гравцями:");
      console.log("1. Додати нового гравця");
      console.log("2. Показати всіх гравців");
      console.log("3. Знайти гравця за ім'ям або прізвищем");
      console.log("4. Переглянути інформацію про гравця");
      console.log("5. Оновити дані гравця");
      console.log("6. Видалити гравця");
      console.log("0. Повернутися до головного меню");

      const choice = prompt("Ваш вибір: ");

      try {
        switch (choice) {
          case "1":
            await this.addNewPlayer();
            break;
          case "2":
            await this.listAllPlayers();
            break;
          case "3":
            await this.findPlayerByLastName();
            break;
          case "4":
            await this.showPlayerInfo();
            break;
          case "5":
            await this.modifyPlayerMenu();
            break;
          case "6":
            await this.deletePlayer();
            break;
          case "0":
            return; // Повернення до головного меню
          default:
            console.log("Невірний вибір.");
        }
      } catch (error: any) {
        // Єдине місце обробки помилок BLL та DAL
        if (
          error instanceof BusinessLogicException ||
          error instanceof NotFoundException ||
          error instanceof ValidationException
        ) {
          console.error(`[ПОМИЛКА БІЗНЕС-ЛОГІКИ]: ${error.message}`);
        } else {
          console.error(`[КРИТИЧНА ПОМИЛКА]: ${error.message}`);
        }
      }
    }
  }

  private async listAllPlayers(): Promise<void> {
    const players = await this.playerService.getAllPlayers();
    if (players.length === 0) {
      console.log("Список гравців порожній.");
      return;
    }
    console.table(
      players.map((p) => ({
        ID: p.id,
        "Ім'я": p.firstName,
        Прізвище: p.lastName,
        "Дата народження": p.birthDate.toLocaleDateString(),
        Статус: p.status,
        Зарплатня: p.salary,
      }))
    );
  }

  private async addNewPlayer(): Promise<void> {
    const firstName = InputValidator.getNonEmptyString("Введіть ім'я гравця:");
    const lastName = InputValidator.getNonEmptyString(
      "Введіть прізвище гравця:"
    );
    const birthDate = InputValidator.getDate("Введіть дату народження");
    const salary = InputValidator.getNumber(
      "Введіть зарплатню (0, якщо вільний агент):"
    );

    const player = await this.playerService.createPlayer(
      firstName,
      lastName,
      birthDate,
      salary
    );
    console.log(
      `\nГравець ${player.firstName} ${player.lastName} (ID: ${player.id}) успішно доданий.`
    );
  }

  private async deletePlayer(): Promise<void> {
    const id = InputValidator.getNonEmptyString(
      "Введіть ID гравця для видалення:"
    );

    // BLL перевірить, чи можна його видаляти
    await this.playerService.deletePlayer(id);
    console.log(`Гравець з ID: ${id} успішно видалений.`);
  }

  async findPlayerByLastName(): Promise<void> {
    const term = InputValidator.getNonEmptyString(
      "Введіть ім'я або прізвище для пошуку:"
    );
    const players = await this.playerService.findPlayersByNameOrSurname(term);

    if (players.length === 0) {
      console.log(`Гравців за запитом "${term}" не знайдено.`);
      return;
    }

    console.log(`Знайдені гравці за запитом "${term}":`);
    console.table(
      players.map((p) => ({
        ID: p.id,
        "Ім'я": p.firstName,
        Прізвище: p.lastName,
      }))
    );
  }

  private async showPlayerInfo(): Promise<void> {
    const id = InputValidator.getNonEmptyString("Введіть ID гравця:");
    const player = await this.playerService.getPlayerById(id);

    console.log("\nІнформація про гравця:");
    console.log(`ID: ${player.id}`);
    console.log(`Ім'я: ${player.firstName}`);
    console.log(`Прізвище: ${player.lastName}`);
    console.log(`Дата народження: ${player.birthDate.toLocaleDateString()}`);
    console.log(`Статус: ${player.status}`);
    console.log(`Статус здоров'я: ${player.healthStatus}`);
    console.log(`Зарплатня: ${player.salary}`);
  }

  private async modifyPlayerMenu(): Promise<void> {
    const playerId = InputValidator.getNonEmptyString("Введіть ID гравця:");

    // Перевіряємо, чи гравець існує
    await this.playerService.getPlayerById(playerId);

    while (true) {
      console.log("\nОберіть операцію:");
      console.log("1. Змінити ім'я");
      console.log("2. Змінити прізвище");
      console.log("3. Змінити дату народження");
      console.log("4. Змінити статус гравця");
      console.log("5. Змінити статус здоров'я");
      console.log("6. Змінити зарплатню");
      console.log("0. Повернутися до меню гравців");

      const choice = prompt("Ваш вибір: ");

      try {
        switch (choice) {
          case "1":
            await this.updatePlayerFirstName(playerId);
            break;
          case "2":
            await this.updatePlayerLastName(playerId);
            break;
          case "3":
            await this.updatePlayerBirthDate(playerId);
            break;
          case "4":
            await this.updatePlayerStatus(playerId);
            break;
          case "5":
            await this.updatePlayerHealthStatus(playerId);
            break;
          case "6":
            await this.updatePlayerSalary(playerId);
            break;
          case "0":
            return;
          default:
            console.log("Невірний вибір.");
        }
      } catch (error: any) {
        if (
          error instanceof BusinessLogicException ||
          error instanceof NotFoundException ||
          error instanceof ValidationException
        ) {
          console.error(`[ПОМИЛКА БІЗНЕС-ЛОГІКИ]: ${error.message}`);
        } else {
          console.error(`[КРИТИЧНА ПОМИЛКА]: ${error.message}`);
        }
      }
    }
  }

  private async updatePlayerFirstName(playerId: string): Promise<void> {
    const newFirstName = InputValidator.getNonEmptyString("Введіть нове ім'я:");
    const player = await this.playerService.updatePlayerFirstName(
      playerId,
      newFirstName
    );
    console.log(`Ім'я гравця оновлено: ${player.firstName}`);
  }

  private async updatePlayerLastName(playerId: string): Promise<void> {
    const newLastName = InputValidator.getNonEmptyString(
      "Введіть нове прізвище:"
    );
    const player = await this.playerService.updatePlayerLastName(
      playerId,
      newLastName
    );
    console.log(`Прізвище гравця оновлено: ${player.lastName}`);
  }

  private async updatePlayerBirthDate(playerId: string): Promise<void> {
    const newBirthDate = InputValidator.getDate("Введіть нову дату народження");
    const player = await this.playerService.updatePlayerBirthDate(
      playerId,
      newBirthDate
    );
    console.log(
      `Дату народження гравця оновлено: ${player.birthDate.toLocaleDateString()}`
    );
  }

  private async updatePlayerStatus(playerId: string): Promise<void> {
    console.log("\nОберіть статус:");
    console.log("0. Active");
    console.log("1. Reserve");
    console.log("2. FreeAgent");

    const statusInput = prompt("Ваш вибір: ");
    const statusValue = parseInt(statusInput || "0", 10);

    if (isNaN(statusValue) || statusValue < 0 || statusValue > 2) {
      throw new ValidationException("Невірний вибір статусу.");
    }

    const newStatus =
      statusValue as (typeof PlayerStatus)[keyof typeof PlayerStatus];

    const player = await this.playerService.updatePlayerStatus(
      playerId,
      newStatus
    );
    console.log(`Статус гравця оновлено: ${player.status}`);
  }

  private async updatePlayerHealthStatus(playerId: string): Promise<void> {
    console.log("\nОберіть статус здоров'я:");
    console.log("0. Healthy");
    console.log("1. Injured");
    console.log("2. Recovering");

    const statusInput = prompt("Ваш вибір: ");
    const statusValue = parseInt(statusInput || "0", 10);

    if (isNaN(statusValue) || statusValue < 0 || statusValue > 2) {
      throw new ValidationException("Невірний вибір статусу здоров'я.");
    }

    const newHealthStatus = statusValue as HealthStatus;

    const player = await this.playerService.updatePlayerHealthStatus(
      playerId,
      newHealthStatus
    );
    console.log(`Статус здоров'я гравця оновлено: ${player.healthStatus}`);
  }

  private async updatePlayerSalary(playerId: string): Promise<void> {
    const newSalary = InputValidator.getNumber("Введіть нову зарплатню:");
    const player = await this.playerService.updatePlayerSalary(
      playerId,
      newSalary
    );
    console.log(`Зарплатню гравця оновлено: ${player.salary}`);
  }
}
