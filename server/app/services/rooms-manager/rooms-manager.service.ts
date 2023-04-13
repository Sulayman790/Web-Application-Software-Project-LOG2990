// Id comes from database to allow _id
/* eslint-disable no-underscore-dangle */
import { Game } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { HistoryService } from '@app/services/history/history.service';
import { MessageManagerService } from '@app/services/message-manager/message-manager.service';
import { CHARACTERS, KEY_SIZE, MAX_BONUS_TIME_ALLOWED, NOT_FOUND } from '@common/constants';
import { GameEvents, GameModes, MessageEvents, PlayerStatus } from '@common/enums';
import {
    ChatMessage,
    ClientSideGame,
    Coordinate,
    Differences,
    GameConfigConst,
    GameRoom,
    Player,
    PlayerData,
    TimerMode,
} from '@common/game-interfaces';
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as io from 'socket.io';

@Injectable()
export class RoomsManagerService implements OnModuleInit {
    private gameConstants: GameConfigConst;
    private modeTimerMap: { [key: string]: TimerMode };
    private rooms: Map<string, GameRoom>;

    constructor(
        private readonly gameService: GameService,
        private readonly messageManager: MessageManagerService,
        private readonly historyService: HistoryService,
    ) {
        this.rooms = new Map<string, GameRoom>();
        this.modeTimerMap = {
            [GameModes.ClassicSolo]: { isCountdown: false },
            [GameModes.ClassicOneVsOne]: { isCountdown: false, requiresPlayer2: true },
            [GameModes.LimitedSolo]: { isCountdown: true },
            [GameModes.LimitedCoop]: { isCountdown: true, requiresPlayer2: true },
        };
    }

    async onModuleInit() {
        await this.getGameConstants();
    }

    async createRoom(playerPayLoad: PlayerData): Promise<GameRoom> {
        const game = !playerPayLoad.gameId ? await this.gameService.getRandomGame([]) : await this.gameService.getGameById(playerPayLoad.gameId);
        if (!game) return;
        const room = this.buildGameRoom(game, playerPayLoad);
        return room;
    }

    async getGameConstants(): Promise<void> {
        this.gameConstants = await this.gameService.getGameConstants();
    }

    getRoomById(roomId: string): GameRoom {
        if (this.rooms.has(roomId)) return this.rooms.get(roomId);
    }

    getRoomIdFromSocket(socket: io.Socket): string {
        return Array.from(socket.rooms.values())[1];
    }

    getRoomByPlayerId(playerId: string): GameRoom {
        return Array.from(this.rooms.values()).find((room) => room.player1.playerId === playerId || room.player2?.playerId === playerId);
    }

    getHostIdByGameId(gameId: string): string {
        const roomTarget = Array.from(this.rooms.values()).find((room) => room.clientGame.id === gameId);
        return roomTarget?.player1.playerId;
    }

    getCreatedCoopRoom(): GameRoom {
        return Array.from(this.rooms.values()).find((room) => room.clientGame.mode === GameModes.LimitedCoop && !room.player2);
    }

    addAcceptedPlayer(roomId: string, player: Player): void {
        const room = this.getRoomById(roomId);
        room.player2 = player;
        this.updateRoom(room);
    }

    updateRoom(room: GameRoom): void {
        this.rooms.set(room.roomId, room);
    }

    deleteRoom(roomId: string): void {
        this.rooms.delete(roomId);
    }

    isMultiplayerGame(clientGame: ClientSideGame): boolean {
        return clientGame.mode === GameModes.ClassicOneVsOne || clientGame.mode === GameModes.LimitedCoop;
    }

    startGame(socket: io.Socket, server: io.Server): void {
        const room = this.getRoomByPlayerId(socket.id);
        if (!room || ![room.player1.playerId, room.player2?.playerId].includes(socket.id)) {
            this.handleGamePageRefresh(socket, server);
            return;
        }
        this.historyService.createEntry(room);
        socket.join(room.roomId);
        this.updateRoom(room);
        server.to(room.roomId).emit(GameEvents.GameStarted, room);
    }

    async loadNextGame(room: GameRoom, playedGameIds: string[]): Promise<string> {
        const game = await this.gameService.getRandomGame(playedGameIds);
        if (!game) return;
        const gameMode = room.clientGame.mode;
        room.clientGame = this.buildClientGameVersion(game);
        room.clientGame.mode = gameMode;
        room.originalDifferences = structuredClone(JSON.parse(fs.readFileSync(`assets/${game.name}/differences.json`, 'utf-8')));
        this.updateRoom(room);
        return game._id.toString();
    }

    validateCoords(socket: io.Socket, coords: Coordinate, server: io.Server): void {
        const roomId = this.getRoomIdFromSocket(socket);
        const room = this.rooms.get(roomId);

        if (!room) return;

        const player = room.player1.playerId === socket.id ? room.player1 : room.player2;
        const index = room.originalDifferences.findIndex((difference) =>
            difference.some((coord: Coordinate) => coord.x === coords.x && coord.y === coords.y),
        );
        const localMessage = index !== NOT_FOUND ? this.differenceFound(room, player, index) : this.differenceNotFound(room, player);
        const differencesData = {
            currentDifference: player.diffData.currentDifference,
            differencesFound: player.diffData.differencesFound,
        } as Differences;
        server.to(room.roomId).emit(MessageEvents.LocalMessage, localMessage);
        server.to(room.roomId).emit(GameEvents.RemoveDiff, { differencesData, playerId: socket.id, cheatDifferences: room.originalDifferences });
    }

    updateTimers(server: io.Server) {
        for (const room of this.rooms.values()) {
            const modeInfo = this.modeTimerMap[room?.clientGame?.mode];
            if (!modeInfo || (modeInfo.requiresPlayer2 && !room.player2)) continue;

            this.updateTimer(room, server, modeInfo.isCountdown);
        }
    }

    addHintPenalty(socket: io.Socket, server: io.Server): void {
        const roomId = this.getRoomIdFromSocket(socket);
        const room = this.getRoomById(roomId);
        if (!room) return;
        const { clientGame, gameConstants, timer } = room;
        let penaltyTime = gameConstants.penaltyTime;

        if (this.isLimitedModeGame(clientGame)) penaltyTime = -penaltyTime;

        if (timer + penaltyTime < 0) {
            this.countdownOver(room, server);
        } else {
            room.timer += penaltyTime;
            this.rooms.set(room.roomId, room);
            server.to(room.roomId).emit(GameEvents.TimerUpdate, room.timer);
        }
    }

    isLimitedModeGame(clientGame: ClientSideGame): boolean {
        return clientGame.mode === GameModes.LimitedSolo || clientGame.mode === GameModes.LimitedCoop;
    }

    leaveRoom(room: GameRoom, server: io.Server): void {
        [room.player1, room.player2].forEach((player) => {
            const socket = server.sockets.sockets.get(player?.playerId);
            if (socket) socket.rooms.delete(room.roomId);
        });
    }
    abandonGame(socket: io.Socket, server: io.Server): void {
        const room = this.getRoomByPlayerId(socket.id);
        if (!room) return;
        const player: Player = room.player1.playerId === socket.id ? room.player1 : room.player2;
        const opponent: Player = room.player1.playerId === socket.id ? room.player2 : room.player1;
        this.historyService.markPlayer(room.roomId, player.name, PlayerStatus.Quitter);
        if (this.isMultiplayerGame(room.clientGame) && opponent) {
            if (room.clientGame.mode === GameModes.ClassicOneVsOne) this.historyService.markPlayer(room.roomId, opponent.name, PlayerStatus.Winner);
            const localMessage =
                room.clientGame.mode === GameModes.ClassicOneVsOne
                    ? this.handleOneVsOneAbandon(player, room, server)
                    : this.handleCoopAbandon(opponent, room, server);
            server.to(room.roomId).emit(MessageEvents.LocalMessage, localMessage);
        } else {
            this.historyService.closeEntry(room.roomId, server);
            this.deleteRoom(room.roomId);
        }
        socket.leave(room.roomId);
    }

    handleDisconnect(room: GameRoom): void {
        if (room && !room.player2) this.deleteRoom(room.roomId);
    }

    private differenceFound(room: GameRoom, player: Player, index: number): ChatMessage {
        this.addBonusTime(room);
        player.diffData.differencesFound++;
        player.diffData.currentDifference = room.originalDifferences[index];
        room.originalDifferences.splice(index, 1);
        this.updateRoom(room);
        return this.messageManager.getLocalMessage(room.clientGame.mode, true, player.name);
    }

    private differenceNotFound(room: GameRoom, player: Player): ChatMessage {
        player.diffData.currentDifference = [];
        this.updateRoom(room);
        return this.messageManager.getLocalMessage(room.clientGame.mode, false, player.name);
    }

    private handleCoopAbandon(opponent: Player, room: GameRoom, server: io.Server): ChatMessage {
        server.to(opponent.playerId).emit(GameEvents.GameModeChanged);
        room.clientGame.mode = GameModes.LimitedSolo;
        this.updateRoom(room);
        return this.messageManager.getQuitMessage(opponent.name);
    }

    private addBonusTime(room: GameRoom): void {
        if (!this.isLimitedModeGame(room.clientGame)) return;
        room.timer += room.gameConstants.bonusTime;

        if (room.timer > MAX_BONUS_TIME_ALLOWED) {
            room.timer = MAX_BONUS_TIME_ALLOWED;
        }
        this.updateRoom(room);
    }

    private updateTimer(room: GameRoom, server: io.Server, isCountdown: boolean): void {
        if (isCountdown) room.timer--;
        else room.timer++;
        this.updateRoom(room);
        server.to(room.roomId).emit(GameEvents.TimerUpdate, room.timer);
        if (room.timer === 0) this.countdownOver(room, server);
    }

    private countdownOver(room: GameRoom, server: io.Server): void {
        room.endMessage = 'Temps écoulé !';
        server.to(room.roomId).emit(GameEvents.EndGame, room.endMessage);
        this.deleteRoom(room.roomId);
        this.leaveRoom(room, server);
    }

    private generateRoomId(): string {
        let id = '';
        for (let i = 0; i < KEY_SIZE; i++) id += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
        return id;
    }

    private handleGamePageRefresh(socket: io.Socket, server: io.Server): void {
        server.to(socket.id).emit(GameEvents.GamePageRefreshed);
    }

    private handleOneVsOneAbandon(player: Player, room: GameRoom, server: io.Server): ChatMessage {
        room.endMessage = "L'adversaire a abandonné la partie!";
        server.to(room.roomId).emit(GameEvents.EndGame, room.endMessage);
        this.leaveRoom(room, server);
        this.historyService.closeEntry(room.roomId, server);
        this.deleteRoom(room.roomId);
        return this.messageManager.getQuitMessage(player.name);
    }

    private buildClientGameVersion(game: Game): ClientSideGame {
        const clientGame: ClientSideGame = {
            id: game._id.toString(),
            name: game.name,
            mode: '',
            original: 'data:image/png;base64,'.concat(fs.readFileSync(`assets/${game.name}/original.bmp`, 'base64')),
            modified: 'data:image/png;base64,'.concat(fs.readFileSync(`assets/${game.name}/modified.bmp`, 'base64')),
            isHard: game.isHard,
            differencesCount: game.nDifference,
        };
        return clientGame;
    }

    private buildGameRoom(game: Game, playerPayLoad: PlayerData): GameRoom {
        const gameConstants = this.gameConstants;
        const diffData = { currentDifference: [], differencesFound: 0 } as Differences;
        const player = { name: playerPayLoad.playerName, diffData } as Player;
        const room: GameRoom = {
            roomId: this.generateRoomId(),
            clientGame: this.buildClientGameVersion(game),
            timer: 0,
            endMessage: '',
            originalDifferences: structuredClone(JSON.parse(fs.readFileSync(`assets/${game.name}/differences.json`, 'utf-8'))),
            player1: player,
            gameConstants,
        };
        room.clientGame.mode = playerPayLoad.gameMode;
        return room;
    }
}
