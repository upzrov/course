import { GameService, PlayerService, StadiumService } from "../bll/services";
import { ConsoleMenu } from "./console-menu";
import { PlayerFileRepository } from "../dal/player-file-repository";
import { GameFileRepository } from "../dal/game-file-repository";
import { StadiumFileRepository } from "../dal/stadium-file-repository";

const playerRepository = new PlayerFileRepository();
const gameRepository = new GameFileRepository();
const stadiumRepository = new StadiumFileRepository();

const playerService = new PlayerService(playerRepository);
const gameService = new GameService(gameRepository);
const stadiumService = new StadiumService(stadiumRepository);

const app = new ConsoleMenu(playerService, gameService, stadiumService);
app.run();
