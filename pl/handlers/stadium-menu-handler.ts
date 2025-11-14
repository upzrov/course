import {
  BusinessLogicException,
  NotFoundException,
  ValidationException,
} from "../../bll/exceptions";
import { InputValidator } from "../input-validator";

import type { GameService, StadiumService } from "../../bll/services";

export class StadiumMenuHandler {
  constructor(
    private stadiumService: StadiumService,
    private gameService: GameService
  ) {}

  async handleMenu(): Promise<void> {
    while (true) {
      console.log("\nУправління стадіонами:");
      console.log("1. Додати стадіон");
      console.log("2. Видалити стадіон");
      console.log("3. Змінити дані стадіону");
      console.log("4. Переглянути інформацію про стадіон");
      console.log("5. Переглянути всі стадіони");
      console.log("0. Повернутись до головного меню");

      const choice = prompt("Ваш вибір: ");

      try {
        switch (choice) {
          case "1":
            await this.addStadium();
            break;
          case "2":
            await this.deleteStadium();
            break;
          case "3":
            await this.modifyStadiumMenu();
            break;
          case "4":
            await this.showStadiumInfo();
            break;
          case "5":
            await this.listAllStadiums();
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

  private async addStadium(): Promise<void> {
    const name = InputValidator.getNonEmptyString("Введіть назву стадіону:");
    const capacity = InputValidator.getNumber(
      "Введіть кількість місць на стадіоні:"
    );
    const price = InputValidator.getNumber("Введіть ціну квитка:");

    const stadium = await this.stadiumService.createStadium(
      name,
      capacity,
      price
    );
    console.log(`Стадіон з ID ${stadium.id} успішно створено.`);
  }

  private async deleteStadium(): Promise<void> {
    const id = InputValidator.getNonEmptyString(
      "Введіть ID стадіону для видалення:"
    );
    await this.stadiumService.deleteStadium(id);
    console.log(`Стадіон ${id} видалено.`);
  }

  private async modifyStadiumMenu(): Promise<void> {
    const stadiumId = InputValidator.getNonEmptyString("Введіть ID стадіону:");
    console.log("\nОберіть операцію:");
    console.log("1. Змінити назву");
    console.log("2. Змінити кількість місць");
    console.log("3. Змінити ціну за місце");

    const choice = prompt("Ваш вибір: ");

    switch (choice) {
      case "1":
        await this.renameStadium(stadiumId);
        break;
      case "2":
        await this.changeStadiumCapacity(stadiumId);
        break;
      case "3":
        await this.changeStadiumTicketPrice(stadiumId);
        break;
      default:
        console.log("Невірний вибір.");
    }
  }

  private async renameStadium(stadiumId: string): Promise<void> {
    const name = InputValidator.getNonEmptyString("Нова назва стадіону:");
    await this.stadiumService.renameStadium(stadiumId, name);
    console.log("Назву стадіону оновлено.");
  }

  private async changeStadiumCapacity(stadiumId: string): Promise<void> {
    const capacity = InputValidator.getNumber("Нова кількість місць:");
    await this.stadiumService.updateCapacity(stadiumId, capacity);
    console.log("Місткість стадіону оновлено.");
  }

  private async changeStadiumTicketPrice(stadiumId: string): Promise<void> {
    const price = InputValidator.getNumber("Нова ціна квитка:");
    await this.stadiumService.updateTicketPrice(stadiumId, price);
    console.log("Ціну квитка оновлено.");
  }

  private async showStadiumInfo(): Promise<void> {
    const id = InputValidator.getNonEmptyString(
      "Введіть ID стадіону для перегляду:"
    );
    const stadium = await this.stadiumService.getStadiumById(id);
    const games = await this.gameService.getGamesByLocation(stadium.name);

    console.log(`\nІнформація про стадіон ${stadium.name}:`);
    console.table([
      {
        ID: stadium.id,
        "Кількість місць": stadium.capacity,
        "Ціна за місце": stadium.ticketPrice,
        "Заплановані ігри": games.length,
      },
    ]);

    if (games.length > 0) {
      console.log("Найближчі ігри:");
      console.table(
        games.map((game) => ({
          ID: game.id,
          Дата: game.gameDate.toLocaleString(),
          "Команда-суперник": game.opponentTeam,
        }))
      );
    }
  }

  private async listAllStadiums(): Promise<void> {
    const stadiums = await this.stadiumService.getAllStadiums();
    if (stadiums.length === 0) {
      console.log("Стадіонів поки що немає.");
      return;
    }
    console.table(
      stadiums.map((stadium) => ({
        ID: stadium.id,
        Назва: stadium.name,
        "Кількість місць": stadium.capacity,
        "Ціна за місце": stadium.ticketPrice,
      }))
    );
  }
}
