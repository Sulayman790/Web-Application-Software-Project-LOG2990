import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { GAME_CARROUSEL_SIZE } from '@common/constants';
import { Game, GameCard, GameCarrousel, PlayerTime } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class DatabaseService {
    private createdGames: CreateGameDto[];
    private games: Game[];
    private gameCardsList: GameCard[];
    private carrouselGames: GameCarrousel[];
    private defaultBestTimes: PlayerTime[];

    constructor() {
        this.defaultBestTimes = [
            { name: 'rxjs', time: 100 },
            { name: 'ts', time: 200 },
            { name: 'angular', time: 250 },
        ];
        this.createdGames = [];
        this.games = [
            {
                id: 1,
                name: 'Bouffon',
                difficultyLevel: 1,
                thumbnail: 'test',
                original: '@assets/Bouffon/original.bmp',
                modified: '@assets/Bouffon/modified.bmp',
                soloTopTime: [
                    { name: 'top1', time: 1 },
                    { name: 'top2', time: 2 },
                    { name: 'top3', time: 3 },
                ],
                oneVsOneTopTime: [
                    { name: 'test1', time: 1 },
                    { name: 'test2', time: 2 },
                    { name: 'test3', time: 3 },
                ],
                differencesCount: 10,
                hintList: [],
            },
        ];
        this.gameCardsList = [];
        this.carrouselGames = [];
    }

    getGamesCarrousel(): GameCarrousel[] {
        this.gameCardsList = this.buildGameCardsList();
        this.carrouselGames = this.buildGameCarrouselList();
        return this.carrouselGames;
    }

    getGameById(id: string): Game | void {
        return this.games.find((game) => game.id === +id);
    }

    saveFiles(gameName: string, data: Buffer): void {
        const dirName = `assets/${gameName}`;

        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName);
            fs.writeFileSync(`assets/${gameName}/original.bmp`, data);
            fs.writeFileSync(`assets/${gameName}/modified.bmp`, data);
        }
    }

    addGame(gameData: Game): void {
        this.games.push(gameData);
    }

    buildGameCarrouselList(): GameCarrousel[] {
        for (let i = 0; i < this.gameCardsList.length; i += GAME_CARROUSEL_SIZE) {
            const j = i;
            const gameCarrousel: GameCarrousel = {
                hasNext: i + GAME_CARROUSEL_SIZE < this.gameCardsList.length,
                hasPrevious: j > 0,
                gameCards: this.gameCardsList.slice(j, i + GAME_CARROUSEL_SIZE),
            };
            this.carrouselGames.push(gameCarrousel);
        }
        return this.carrouselGames;
    }

    buildGameCardsList(): GameCard[] {
        return this.createdGames.map((game) => ({
            id: game.id,
            name: game.name,
            difficultyLevel: game.isHard,
            soloTopTime: this.defaultBestTimes,
            oneVsOneTopTime: this.defaultBestTimes,
            thumbnail: game.thumbnail,
        }));
    }
}
