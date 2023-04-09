import { TestBed } from '@angular/core/testing';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { SocketTestHelper } from '@app/services/client-socket-service/client-socket.service.spec';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { GameCardEvents, GameModes, PlayerEvents, RoomEvents } from '@common/enums';
import { LimitedGameDetails, RoomAvailability } from '@common/game-interfaces';
import { Socket } from 'socket.io-client';

class SocketClientServiceMock extends ClientSocketService {
    override connect() {
        return;
    }
    override disconnect() {
        return;
    }
}

describe('RoomManagerService', () => {
    let service: RoomManagerService;
    let mockGameId: string;
    let mockRoomId: string;
    let mockPlayerName: string;
    let mockGameMode: GameModes;
    let mockLimitedGameDetails: LimitedGameDetails;
    let socketHelper: SocketTestHelper;
    let socketServiceMock: SocketClientServiceMock;

    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;
        mockLimitedGameDetails = {
            playerName: mockPlayerName,
            gameMode: mockGameMode,
        };

        TestBed.configureTestingModule({
            providers: [{ provide: ClientSocketService, useValue: socketServiceMock }],
        });
        service = TestBed.inject(RoomManagerService);
        mockGameId = 'mockGameId';
        mockPlayerName = 'mockPlayerName';
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('joinedPlayerNamesByGameId$ should return joinedPlayerNames asObservable', () => {
        expect(service.joinedPlayerNamesByGameId$).toEqual(service['joinedPlayerNames'].asObservable());
    });

    it('isNameTaken$ should return isPlayerNameTaken asObservable', () => {
        expect(service.isNameTaken$).toEqual(service['isPlayerNameTaken'].asObservable());
    });

    it('createdRoomId$ should return createdRoomId asObservable', () => {
        expect(service.createdRoomId$).toEqual(service['createdRoomId'].asObservable());
    });

    it('roomId$ should return isPlayerAccepted asObservable', () => {
        expect(service.roomId$).toEqual(service['isPlayerAccepted'].asObservable());
    });

    it('deletedGameId$ should return deletedGameId asObservable', () => {
        expect(service.deletedGameId$).toEqual(service['deletedGameId'].asObservable());
    });

    it('oneVsOneRoomsAvailabilityByRoomId$ should return oneVsOneRoomsAvailabilityByGameId asObservable', () => {
        expect(service.oneVsOneRoomsAvailabilityByRoomId$).toEqual(service['oneVsOneRoomsAvailabilityByGameId'].asObservable());
    });

    it('refusedPlayerId$ should return refusedPlayerId asObservable', () => {
        expect(service.refusedPlayerId$).toEqual(service['refusedPlayerId'].asObservable());
    });

    it('createSoloRoom should call clientSocket.send with CreateSoloGame and gameId and playerName', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.createSoloRoom(mockGameId, mockPlayerName);
        expect(sendSpy).toHaveBeenCalledWith(RoomEvents.CreateClassicSoloRoom, { gameId: mockGameId, playerName: mockPlayerName });
    });

    it('createOneVsOneRoom should call clientSocket.send with CreateOneVsOneRoom and gameId', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.createOneVsOneRoom(mockGameId, mockPlayerName);
        expect(sendSpy).toHaveBeenCalledWith(RoomEvents.CreateOneVsOneRoom, { gameId: mockGameId, playerName: mockPlayerName });
    });

    it('createLimitedRoom should call clientSocket.send with CreateSoloLimitedRoom and gameId and playerName', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.createLimitedRoom(mockLimitedGameDetails);
        expect(sendSpy).toHaveBeenCalledWith(RoomEvents.CreateSoloLimitedRoom, { playerName: mockPlayerName, gameMode: mockGameMode });
    });

    it('deleteCreatedCoopRoom should call clientSocket.send with DeleteCreatedCoopRoom and roomId', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.deleteCreatedCoopRoom(mockRoomId);
        expect(sendSpy).toHaveBeenCalledWith(RoomEvents.DeleteCreatedCoopRoom, mockRoomId);
    });

    it('deleteCreatedCoopRoom should call clientSocket.send with DeleteCreatedCoopRoom and roomId', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.getJoinedPlayerNames(mockGameId);
        expect(sendSpy).toHaveBeenCalledWith(PlayerEvents.GetJoinedPlayerNames, mockGameId);
    });

    it('updateRoomOneVsOneAvailability should call clientSocket.send with UpdateRoomOneVsOneAvailability and gameId', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.updateRoomOneVsOneAvailability(mockGameId);
        expect(sendSpy).toHaveBeenCalledWith(RoomEvents.UpdateRoomOneVsOneAvailability, mockGameId);
    });

    it('checkRoomOneVsOneAvailability should call clientSocket.send with CheckRoomOneVsOneAvailability and gameId', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.checkRoomOneVsOneAvailability(mockGameId);
        expect(sendSpy).toHaveBeenCalledWith(RoomEvents.CheckRoomOneVsOneAvailability, mockGameId);
    });

    it('deleteCreatedOneVsOneRoom should call clientSocket.send with DeleteCreatedRoom and gameId', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.deleteCreatedOneVsOneRoom(mockGameId);
        expect(sendSpy).toHaveBeenCalledWith(RoomEvents.DeleteCreatedOneVsOneRoom, mockGameId);
    });

    it('updateWaitingPlayerNameList should call clientSocket.send with UpdateWaitingPlayerNameList and gameId and playerName', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.updateWaitingPlayerNameList(mockGameId, mockPlayerName);
        expect(sendSpy).toHaveBeenCalledWith(PlayerEvents.UpdateWaitingPlayerNameList, { gameId: mockGameId, playerName: mockPlayerName });
    });

    it('isPlayerNameIsAlreadyTaken should call clientSocket.send with CheckIfPlayerNameIsAvailable and gameId and playerName', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.isPlayerNameIsAlreadyTaken(mockGameId, mockPlayerName);
        expect(sendSpy).toHaveBeenCalledWith(PlayerEvents.CheckIfPlayerNameIsAvailable, {
            gameId: mockGameId,
            playerName: mockPlayerName,
        });
    });

    it('refusePlayer should call clientSocket.send with RefusePlayer and gameId and playerName', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.refusePlayer(mockGameId, mockPlayerName);
        expect(sendSpy).toHaveBeenCalledWith(PlayerEvents.RefusePlayer, { gameId: mockGameId, playerName: mockPlayerName });
    });

    it('acceptPlayer should call clientSocket.send with AcceptPlayer, gameId, roomId and playerName', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.acceptPlayer(mockGameId, mockRoomId, mockPlayerName);
        expect(sendSpy).toHaveBeenCalledWith(PlayerEvents.AcceptPlayer, {
            gameId: mockGameId,
            roomId: mockRoomId,
            playerName: mockPlayerName,
        });
    });

    it('cancelJoining should call clientSocket.send with CancelJoining and roomId and playerName', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.cancelJoining(mockGameId);
        expect(sendSpy).toHaveBeenCalledWith(PlayerEvents.CancelJoining, mockGameId);
    });

    it('checkIfAnyCoopRoomExists should call clientSocket.send with gameDetails', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.checkIfAnyCoopRoomExists(mockLimitedGameDetails);
        expect(sendSpy).toHaveBeenCalledWith(RoomEvents.CheckIfAnyCoopRoomExists, mockLimitedGameDetails);
    });

    it('disconnect should call clientSocket.disconnect', () => {
        const disconnectSpy = spyOn(socketServiceMock, 'disconnect');
        service.disconnect();
        expect(disconnectSpy).toHaveBeenCalled();
    });

    it('gameCardCreated should call clientSocket.send with GameCardCreated', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.gameCardCreated();
        expect(sendSpy).toHaveBeenCalledWith(GameCardEvents.GameCardCreated);
    });

    it('gameCardCreated should call clientSocket.send with GameCardCreated', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.gameCardDeleted(mockGameId);
        expect(sendSpy).toHaveBeenCalledWith(GameCardEvents.GameCardDeleted, mockGameId);
    });

    it('allGamesDeleted should call clientSocket.send with AllGamesDeleted', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.allGamesDeleted();
        expect(sendSpy).toHaveBeenCalledWith(GameCardEvents.AllGamesDeleted);
    });

    it('resetTopTime should call clientSocket.send with ResetTopTime', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.resetTopTime(mockGameId);
        expect(sendSpy).toHaveBeenCalledWith(GameCardEvents.ResetTopTime, mockGameId);
    });

    it('resetAllTopTimes should call clientSocket.send with ResetAllTopTimes', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.resetAllTopTimes();
        expect(sendSpy).toHaveBeenCalledWith(GameCardEvents.ResetAllTopTimes);
    });

    it('gameConstantsUpdated should call clientSocket.send with GameConstantsUpdated', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.gameConstantsUpdated();
        expect(sendSpy).toHaveBeenCalledWith(GameCardEvents.GameConstantsUpdated);
    });

    it('getSocketId should return ', () => {
        const socketId = service.getSocketId();
        expect(socketServiceMock.socket.id).toEqual(socketId);
    });

    it('should call createdRoomId.next when RoomEvents.RoomSoloCreated is received', () => {
        service.handleRoomEvents();
        const roomIdSpy = spyOn(service['createdRoomId'], 'next');
        socketHelper.peerSideEmit(RoomEvents.RoomSoloCreated, mockGameId);
        expect(roomIdSpy).toHaveBeenCalledOnceWith(mockGameId);
    });

    it('should call oneVsOneRoomsAvailabilityByGameId.next when RoomEvents.RoomOneVsOneAvailable is received', () => {
        service.handleRoomEvents();
        const mockAvailability = { gameId: mockGameId, isAvailableToJoin: true } as RoomAvailability;
        const availabilitySpy = spyOn(service['oneVsOneRoomsAvailabilityByGameId'], 'next');
        socketHelper.peerSideEmit(RoomEvents.RoomOneVsOneAvailable, mockAvailability);
        expect(availabilitySpy).toHaveBeenCalledOnceWith(mockAvailability);
    });

    it('should call oneVsOneRoomsAvailabilityByGameId.next when RoomEvents.OneVsOneRoomDeleted is received', () => {
        service.handleRoomEvents();
        const mockAvailability = { gameId: mockGameId, isAvailableToJoin: true } as RoomAvailability;
        const availabilitySpy = spyOn(service['oneVsOneRoomsAvailabilityByGameId'], 'next');
        socketHelper.peerSideEmit(RoomEvents.OneVsOneRoomDeleted, mockAvailability);
        expect(availabilitySpy).toHaveBeenCalledOnceWith(mockAvailability);
    });

    it('should call joinedPlayerNames.next when GameEvents.WaitingPlayerNameListUpdated is received', () => {
        service.handleRoomEvents();
        const mockPlayerNamesList = ['Alice', 'Bob'] as string[];
        const joinedNextSpy = spyOn(service['joinedPlayerNames'], 'next');
        socketHelper.peerSideEmit(PlayerEvents.WaitingPlayerNameListUpdated, mockPlayerNamesList);
        expect(joinedNextSpy).toHaveBeenCalledOnceWith(mockPlayerNamesList);
    });

    it('should call isPlayerNameTaken.next when PlayerEvents.PlayerNameTaken is received', () => {
        service.handleRoomEvents();
        const mockNameList = {
            gameId: mockGameId,
            isNameAvailable: true,
        };
        const isPlayerNextSpy = spyOn(service['isPlayerNameTaken'], 'next');
        socketHelper.peerSideEmit(PlayerEvents.PlayerNameTaken, mockNameList);
        expect(isPlayerNextSpy).toHaveBeenCalledOnceWith(mockNameList);
    });

    it('should call createdRoomId.next when RoomEvents.RoomOneVsOneCreated is received', () => {
        service.handleRoomEvents();
        const roomIdSpy = spyOn(service['createdRoomId'], 'next');
        socketHelper.peerSideEmit(RoomEvents.RoomOneVsOneCreated, mockGameId);
        expect(roomIdSpy).toHaveBeenCalledOnceWith(mockGameId);
    });

    it('should call roomId.next when RoomEvents.RoomLimitedCreated is received', () => {
        service.handleRoomEvents();
        const roomIdSpy = spyOn(service['createdRoomId'], 'next');
        socketHelper.peerSideEmit(RoomEvents.RoomLimitedCreated, mockGameId);
        expect(roomIdSpy).toHaveBeenCalledOnceWith(mockGameId);
    });

    it('ngOnDestroy should call disconnect', () => {
        const disconnectSpy = spyOn(socketServiceMock, 'disconnect');
        service.ngOnDestroy();
        expect(disconnectSpy).toHaveBeenCalled();
    });

    it('should call isLimitedCoopRoomAvailable.next when RoomEvents.LimitedCoopRoomJoined is received', () => {
        service.handleRoomEvents();
        const isLimitedCoopRoomAvailableSpy = spyOn(service['isLimitedCoopRoomAvailable'], 'next');
        socketHelper.peerSideEmit(RoomEvents.LimitedCoopRoomJoined, true);
        expect(isLimitedCoopRoomAvailableSpy).toHaveBeenCalledOnceWith(true);
    });

    it('should call isPlayerAccepted.next when PlayerEvents.isAccepted is received', () => {
        service.handleRoomEvents();
        const isPlayerAcceptedSpy = spyOn(service['isPlayerAccepted'], 'next');
        socketHelper.peerSideEmit(PlayerEvents.PlayerAccepted, true);
        expect(isPlayerAcceptedSpy).toHaveBeenCalledOnceWith(true);
    });

    it('should call refusedPlayerId.next when PlayerEvents.PlayerRefused is received', () => {
        service.handleRoomEvents();
        const refusedPlayerIdSpy = spyOn(service['refusedPlayerId'], 'next');
        socketHelper.peerSideEmit(PlayerEvents.PlayerRefused, mockPlayerName);
        expect(refusedPlayerIdSpy).toHaveBeenCalledOnceWith(mockPlayerName);
    });

    it('should call deletedGameId.next when GameCardEvents.GameDeleted is received', () => {
        service.handleRoomEvents();
        const deletedGameIdSpy = spyOn(service['deletedGameId'], 'next');
        socketHelper.peerSideEmit(GameCardEvents.GameDeleted, mockGameId);
        expect(deletedGameIdSpy).toHaveBeenCalledOnceWith(mockGameId);
    });

    it('should call isReloadNeeded.next when GameCardEvents.RequestReload is received', () => {
        service.handleRoomEvents();
        const reloadNeededSpy = spyOn(service['isReloadNeeded'], 'next');
        socketHelper.peerSideEmit(GameCardEvents.RequestReload);
        expect(reloadNeededSpy).toHaveBeenCalledOnceWith(true);
    });
});
