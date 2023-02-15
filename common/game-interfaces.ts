import { Coordinate } from '@common/coordinate';

export interface GameDetails {
    id?: number;
    name: string;
    originalImage: string;
    modifiedImage: string;
    nDifference: number;
    differences: Coordinate[][];
    isHard: boolean;
}

export interface ServerSideGame {
    id: string;
    name: string;
    original: string;
    modified: string;
    differences: Coordinate[][];
    differencesCount: number;
    isHard: boolean;
}

export interface ClientSideGame {
    id: string;
    name: string;
    player: string;
    mode: string;
    original: string;
    modified: string;
    isHard: boolean;
    differencesCount: number;
}

export interface GameCard {
    id: string;
    name: string;
    difficultyLevel: boolean;
    soloTopTime: PlayerTime[];
    oneVsOneTopTime: PlayerTime[];
    thumbnail: string;
}

export interface CarouselPaginator {
    hasNext: boolean;
    hasPrevious: boolean;
    gameCards: GameCard[];
}

export interface GameConfigConst {
    countdownTime: number;
    penaltyTime: number;
    bonusTime: number;
}

export interface PlayerTime {
    name: string;
    time: number;
}

export interface PlayRoom {
    roomId: string;
    serverGame: ServerSideGame;
    clientGame: ClientSideGame;
    endMessage: string;
    timer: number;
    differencesData: Differences;
}

export interface Differences {
    currentDifference: Coordinate[];
    differencesFound: number;
}

export enum GameEvents {
    ValidateCoords = 'validateCoords',
    Penalty = 'penalty',
    CheckStatus = 'checkStatus',
    CreateSoloGame = 'createSoloGame',
    EndGame = 'endGame',
    TimerStarted = 'timerStarted',
    RemoveDiff = 'removeDiff',
}