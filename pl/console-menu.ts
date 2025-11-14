import type {
  GameService,
  PlayerService,
  StadiumService,
} from "../bll/services";
import { GameMenuHandler } from "./handlers/game-menu-handler";
import { PlayerMenuHandler } from "./handlers/player-menu-handler";
import { SearchMenuHandler } from "./handlers/search-menu-handler";
import { StadiumMenuHandler } from "./handlers/stadium-menu-handler";

export class ConsoleMenu {
  private playerMenuHandler: PlayerMenuHandler;
  private gameMenuHandler: GameMenuHandler;
  private stadiumMenuHandler: StadiumMenuHandler;
  private searchMenuHandler: SearchMenuHandler;

  constructor(
    private playerService: PlayerService,
    private gameService: GameService,
    private stadiumService: StadiumService
  ) {
    this.playerMenuHandler = new PlayerMenuHandler(playerService);
    this.gameMenuHandler = new GameMenuHandler(gameService);
    this.stadiumMenuHandler = new StadiumMenuHandler(
      stadiumService,
      gameService
    );
    this.searchMenuHandler = new SearchMenuHandler(
      playerService,
      gameService,
      stadiumService
    );
  }

  async run(): Promise<void> {
    while (true) {
      console.log("\nГоловне меню:");
      console.log("1. Управління гравцями");
      console.log("2. Управління іграми");
      console.log("3. Управління стадіонами");
      console.log("4. Пошук");
      console.log("0. Вийти з програми");

      const choice = prompt("Ваш вибір: ");

      switch (choice) {
        case "1":
          await this.playerMenuHandler.handleMenu();
          break;
        case "2":
          await this.gameMenuHandler.handleMenu();
          break;
        case "3":
          await this.stadiumMenuHandler.handleMenu();
          break;
        case "4":
          await this.searchMenuHandler.handleMenu();
          break;
        case "0":
          console.log("До побачення!");
          return;
        default:
          console.log("Невірний вибір. Спробуйте ще раз.");
      }
    }
  }
}
