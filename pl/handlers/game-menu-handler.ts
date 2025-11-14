import { GameResult } from "../../bll/enums";
import {
  BusinessLogicException,
  NotFoundException,
  ValidationException,
} from "../../bll/exceptions";
import { InputValidator } from ".././input-validator";

import type { GameService } from "../../bll/services";

export class GameMenuHandler {
  constructor(private gameService: GameService) {}

  async handleMenu(): Promise<void> {
    while (true) {
      console.log("\nУправління іграми:");
      console.log("1. Додати гру");
      console.log("2. Видалити гру");
      console.log("3. Змінити дані про гру");
      console.log("4. Переглянути інформацію про гру");
      console.log("5. Переглянути весь список ігор");
      console.log("6. Відсортувати ігри за датою");
      console.log("7. Показати ігри за результатом");
      console.log("0. Повернутись до головного меню");

      const choice = prompt("Ваш вибір: ");

      try {
        switch (choice) {
          case "1":
            await this.addGame();
            break;
          case "2":
            await this.deleteGame();
            break;
          case "3":
            await this.modifyGameMenu();
            break;
          case "4":
            await this.showGameInfo();
            break;
          case "5":
            await this.listAllGames();
            break;
          case "6":
            await this.listGamesSortedByDate();
            break;
          case "7":
            await this.listGamesByResult();
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

  private async addGame(): Promise<void> {
    const date = InputValidator.getDate("Введіть дату гри");
    const location = InputValidator.getNonEmptyString(
      "Введіть місце проведення гри:"
    );
    const opponent = InputValidator.getNonEmptyString(
      "Введіть назву команди-суперника:"
    );

    const game = await this.gameService.createGame(date, location, opponent);
    console.log(`Гру з ID ${game.id} успішно створено.`);
  }

  private async deleteGame(): Promise<void> {
    const id = InputValidator.getNonEmptyString(
      "Введіть ID гри для видалення:"
    );
    await this.gameService.deleteGame(id);
    console.log(`Гру з ID ${id} успішно видалено.`);
  }

  private async modifyGameMenu(): Promise<void> {
    const gameId = InputValidator.getNonEmptyString("Введіть ID гри:");

    console.log("\nОберіть операцію:");
    console.log("1. Додати гравця до гри");
    console.log("2. Видалити гравця з гри");
    console.log("3. Змінити дату проведення");
    console.log("4. Змінити місце проведення");
    console.log("5. Змінити кількість глядачів");
    console.log("6. Встановити результат гри");

    const choice = prompt("Ваш вибір: ");

    switch (choice) {
      case "1":
        await this.addPlayerToGame(gameId);
        break;
      case "2":
        await this.removePlayerFromGame(gameId);
        break;
      case "3":
        await this.changeGameDate(gameId);
        break;
      case "4":
        await this.changeGameLocation(gameId);
        break;
      case "5":
        await this.changeSpectators(gameId);
        break;
      case "6":
        await this.changeGameResult(gameId);
        break;
      default:
        console.log("Невірний вибір.");
    }
  }

  private async addPlayerToGame(gameId: string): Promise<void> {
    const playerId = InputValidator.getNonEmptyString(
      "Введіть ID гравця, якого потрібно додати:"
    );
    await this.gameService.addPlayerToGame(gameId, playerId);
    console.log(`Гравця ${playerId} додано до гри ${gameId}.`);
  }

  private async removePlayerFromGame(gameId: string): Promise<void> {
    const playerId = InputValidator.getNonEmptyString(
      "Введіть ID гравця, якого потрібно видалити:"
    );
    await this.gameService.removePlayerFromGame(gameId, playerId);
    console.log(`Гравця ${playerId} видалено з гри ${gameId}.`);
  }

  private async changeGameDate(gameId: string): Promise<void> {
    const date = InputValidator.getDate("Введіть нову дату гри");
    await this.gameService.updateGameDate(gameId, date);
    console.log("Дату гри оновлено.");
  }

  private async changeGameLocation(gameId: string): Promise<void> {
    const location = InputValidator.getNonEmptyString(
      "Введіть нове місце проведення:"
    );
    await this.gameService.updateGameLocation(gameId, location);
    console.log("Місце проведення оновлено.");
  }

  private async changeSpectators(gameId: string): Promise<void> {
    const spectators = InputValidator.getNumber(
      "Введіть нову кількість глядачів:"
    );
    await this.gameService.updateSpectators(gameId, spectators);
    console.log("Кількість глядачів оновлено.");
  }

  private async changeGameResult(gameId: string): Promise<void> {
    console.log("\nОберіть результат гри:");
    console.log("1. Виграш");
    console.log("2. Поразка");
    console.log("3. Нічия");
    console.log("4. Ще не проведена");

    const choice = prompt("Ваш вибір: ");
    let result: GameResult;

    switch (choice) {
      case "1":
        result = GameResult.Win;
        break;
      case "2":
        result = GameResult.Loss;
        break;
      case "3":
        result = GameResult.Draw;
        break;
      case "4":
        result = GameResult.NotPlayed;
        break;
      default:
        console.log("Невірний вибір.");
        return;
    }

    const spectatorsInput = prompt(
      "Введіть кількість глядачів (залиште порожнім, щоб не змінювати):"
    );
    let spectators: number | undefined;
    if (spectatorsInput && spectatorsInput.trim() !== "") {
      const parsed = Number(spectatorsInput);
      if (Number.isNaN(parsed)) {
        throw new ValidationException("Некоректне число глядачів.");
      }
      spectators = parsed;
    }

    await this.gameService.setGameResult(gameId, result, spectators);
    console.log("Результат гри оновлено.");
  }

  private async showGameInfo(): Promise<void> {
    const id = InputValidator.getNonEmptyString(
      "Введіть ID гри для перегляду:"
    );
    const game = await this.gameService.getGameById(id);
    console.log(`\nІнформація про гру ${id}:`);
    console.table([
      {
        Дата: game.gameDate.toLocaleString(),
        Локація: game.location,
        "Команда-суперник": game.opponentTeam,
        Результат: this.getGameResultLabel(game.result),
        Глядачі: game.spectators,
        "Гравці (ID)": game.playerIds.join(", ") || "немає",
      },
    ]);
  }

  private async listAllGames(): Promise<void> {
    const games = await this.gameService.getAllGames();
    if (games.length === 0) {
      console.log("Ігор поки що немає.");
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

  private async listGamesSortedByDate(): Promise<void> {
    const games = await this.gameService.getGamesSortedByDate();
    if (games.length === 0) {
      console.log("Ігор поки що немає.");
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

  private async listGamesByResult(): Promise<void> {
    console.log("\nОберіть результат:");
    console.log("1. Виграні");
    console.log("2. Програні");
    console.log("3. Нічиї");
    console.log("4. Ще не проведені");

    const choice = prompt("Ваш вибір: ");
    let result: GameResult;
    let label: string;

    switch (choice) {
      case "1":
        result = GameResult.Win;
        label = "Виграні";
        break;
      case "2":
        result = GameResult.Loss;
        label = "Програні";
        break;
      case "3":
        result = GameResult.Draw;
        label = "Нічиї";
        break;
      case "4":
        result = GameResult.NotPlayed;
        label = "Ще не проведені";
        break;
      default:
        console.log("Невірний вибір.");
        return;
    }

    const games = await this.gameService.getGamesByResult(result);
    if (games.length === 0) {
      console.log(`Ігор з категорії "${label}" не знайдено.`);
      return;
    }

    console.log(`\nІгри з категорії "${label}":`);
    console.table(
      games.map((game) => ({
        ID: game.id,
        Дата: game.gameDate.toLocaleString(),
        Локація: game.location,
        "Команда-суперник": game.opponentTeam,
      }))
    );
  }

  getGameResultLabel(result: GameResult): string {
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
