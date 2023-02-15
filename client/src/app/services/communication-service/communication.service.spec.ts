import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CarouselPaginator, Game, GameConfigConst, GameDetails } from '@app/interfaces/game-interfaces';

import { CommunicationService } from './communication.service';

describe('CommunicationService', () => {
    let serviceComponent: CommunicationService;
    let httpMock: HttpTestingController;
    let mockGameCarrousel: CarouselPaginator;
    let game: Game;
    let gameConfig: GameConfigConst;
    let gameDetails: GameDetails;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [],
            providers: [],
        });
        serviceComponent = TestBed.inject(CommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(serviceComponent).toBeTruthy();
    });

    it('Component should have a HttpClient object', () => {
        expect(httpMock).toBeTruthy();
    });

    it('should GET a CarouselPaginator when loadGameCarousel is called', () => {
        mockGameCarrousel = {
            hasNext: false,
            hasPrevious: false,
            gameCards: [
                {
                    id: '',
                    name: '',
                    difficultyLevel: true,
                    soloTopTime: [],
                    oneVsOneTopTime: [],
                    thumbnail: '',
                },
            ],
        };
        serviceComponent.loadGameCarrousel(0).subscribe((response) => {
            expect(response).toEqual(mockGameCarrousel);
        });
        const request = httpMock.expectOne(`${serviceComponent['gameUrl']}/carousel/0`);
        request.flush(mockGameCarrousel);
    });

    it('should GET a game by id when loadGameById is called', () => {
        game = {
            id: 0,
            name: '',
            difficultyLevel: true,
            original: '',
            modified: '',
            soloTopTime: [],
            oneVsOneTopTime: [],
            differencesCount: 0,
            thumbnail: '',
            hintList: [''],
        };
        serviceComponent.loadGameById(0).subscribe((response) => {
            expect(response).toEqual(game);
        });
        const request = httpMock.expectOne(`${serviceComponent['gameUrl']}/0`);
        request.flush(game);
    });

    it('should send a POST request to the server when postGame is called', () => {
        gameDetails = {
            name: '',
            originalImage: '',
            modifiedImage: '',
            nDifference: 0,
            differences: [][0],
            isHard: true,
        };
        serviceComponent.postGame(gameDetails).subscribe();

        const request = httpMock.expectOne(`${serviceComponent['gameUrl']}`);
        expect(request.request.method).toEqual('POST');
        expect(request.request.body).toEqual(gameDetails);
        request.flush({});
    });

    it('should GET a GameConfig when loadConfigConstants is called', () => {
        gameConfig = {
            countdownTime: 0,
            penaltyTime: 0,
            bonusTime: 0,
        };
        serviceComponent.loadConfigConstants().subscribe((response) => {
            expect(response).toEqual(gameConfig);
        });
        const request = httpMock.expectOne(`${serviceComponent['gameUrl']}/constants`);
        request.flush(gameConfig);
    });

    it('should return the result when handleError is called with a result', () => {
        const wrongResult = 'wrong result';
        const handleErrorFn = serviceComponent['handleError']('request', wrongResult);
        handleErrorFn({} as Error).subscribe((result) => {
            expect(result).toEqual(wrongResult);
        });
    });

    it('should return an empty observable when handleError is called without a result', () => {
        const handleErrorFn = serviceComponent['handleError']('request');

        handleErrorFn({} as Error).subscribe((result) => {
            expect(result).toBeUndefined();
        });
    });
});