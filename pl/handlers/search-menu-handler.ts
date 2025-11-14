import { GameResult } from "../../bll/enums";
import {
  BusinessLogicException,
  NotFoundException,
  ValidationException,
} from "../../bll/exceptions";
import { InputValidator } from ".././input-validator";

import type {
  GameService,
  PlayerService,
  StadiumService,
} from "../../bll/services";

export class SearchMenuHandler {
  constructor(
    private playerService: PlayerService,
    private gameService: GameService,
    private stadiumService: StadiumService
  ) {}

  async handleMenu(): Promise<void> {
    while (true) {
      console.log("\nПошук:");
      console.log("1. Пошук гравця за ім'ям або прізвищем");
      console.log("2. Пошук гри за датою та командою-противником");
      console.log("3. Пошук стадіону за назвою");
      console.log("0. Повернутись до головного меню");

      const choice = prompt("Ваш вибір: ");

      try {
        switch (choice) {
          case "1":
            await this.findPlayerByLastName();
            break;
          case "2":
            await this.searchGameByDateAndOpponent();
            break;
          case "3":
            await this.searchStadiumByName();
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

  private async findPlayerByLastName(): Promise<void> {
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

  private async searchGameByDateAndOpponent(): Promise<void> {
    const date = InputValidator.getDate("Введіть дату гри");
    const opponent = InputValidator.getNonEmptyString(
      "Введіть назву команди-противника:"
    );

    const games = await this.gameService.findGamesByDateAndOpponent(
      date,
      opponent
    );

    if (games.length === 0) {
      console.log("Ігор за заданими критеріями не знайдено.");
      return;
    }

    console.table(
      games.map((game) => ({
        ID: game.id,
        Дата: game.gameDate.toLocaleString(),
        Локація: game.location,
        "Команда-суперник": game.opponentTeam,
        Результат: this.getGameResultLabel(game.result),
      }))
    );
  }

  private async searchStadiumByName(): Promise<void> {
    const name = InputValidator.getNonEmptyString("Введіть назву стадіону:");
    const stadiums = await this.stadiumService.findStadiumsByName(name);

    if (stadiums.length === 0) {
      console.log("Стадіонів за заданою назвою не знайдено.");
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

  private getGameResultLabel(result: GameResult): string {
    switch (result) {
      case GameResult.Win:
        return "Виграш";
      case GameResult.Loss:
        return "Поразка";
      case GameResult.Draw:
        return "Нічия";
      case GameResult.NotPlayed:
      default:
        return "Ще не проведена";
    }
  }
}
