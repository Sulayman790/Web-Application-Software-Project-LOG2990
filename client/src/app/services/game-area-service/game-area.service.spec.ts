// Needed to ignore what drawImage does in 'loadImage should properly load an image'
/* eslint-disable @typescript-eslint/no-empty-function */
// Needed to get contexts from test canvas in 'setAllData should get the imageData of the two contexts'
/* eslint-disable @typescript-eslint/no-non-null-assertion */
// Needed for the pre-calculated expectedIndexList in 'should convert 2D coordinates to pixel indexes'
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import {
    BACK_BUTTON,
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    FLASH_WAIT_TIME,
    FORWARD_BUTTON,
    LEFT_BUTTON,
    MIDDLE_BUTTON,
    RIGHT_BUTTON,
} from '@app/constants/constants';
import { Coordinate } from '@common/coordinate';
import { GameAreaService } from './game-area.service';

describe('GameAreaService', () => {
    let gameAreaService: GameAreaService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        gameAreaService = TestBed.inject(GameAreaService);
    });

    it('should be created', () => {
        expect(gameAreaService).toBeTruthy();
    });

    it('should detect left click on screen and call saveCoord', () => {
        const saveCoordSpy = spyOn(gameAreaService, 'saveCoord');
        expect(gameAreaService.detectLeftClick({ button: LEFT_BUTTON } as MouseEvent)).toBeTruthy();
        expect(saveCoordSpy).toHaveBeenCalled();
    });

    it('saveCoord should properly save mouse position', () => {
        const expectedMousePosition = { x: 15, y: 18 };
        const clickEvent: MouseEvent = { offsetX: 15, offsetY: 18 } as MouseEvent;
        gameAreaService.saveCoord(clickEvent);
        expect(gameAreaService['mousePosition']).toEqual(expectedMousePosition);
    });

    it('should not detect left click if clicking is disabled', () => {
        gameAreaService['clickDisabled'] = true;
        expect(gameAreaService.detectLeftClick({ button: LEFT_BUTTON } as MouseEvent)).toBeFalse();
    });

    it('should not detect other button options as a left click', () => {
        expect(gameAreaService.detectLeftClick({ button: MIDDLE_BUTTON } as MouseEvent)).toBeFalse();
        expect(gameAreaService.detectLeftClick({ button: RIGHT_BUTTON } as MouseEvent)).toBeFalse();
        expect(gameAreaService.detectLeftClick({ button: BACK_BUTTON } as MouseEvent)).toBeFalse();
        expect(gameAreaService.detectLeftClick({ button: FORWARD_BUTTON } as MouseEvent)).toBeFalse();
    });

    it('convert2DCoordToPixelIndex should convert 2D coordinates to pixel indexes', () => {
        const differenceCoord: Coordinate[] = [
            { x: 12, y: 15 },
            { x: 0, y: 0 },
            { x: 20, y: 100 },
            { x: 30, y: 0 },
        ];
        const expectedIndexList: number[] = [38448, 0, 256080, 120];
        const resultingIndexList: number[] = gameAreaService.convert2DCoordToPixelIndex(differenceCoord);
        expect(resultingIndexList).toEqual(expectedIndexList);
    });

    it('setAllData should get the imageData of the two contexts', () => {
        const originalCanvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const modifiedCanvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const originalCanvasForeground: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const modifiedCanvasForeground: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

        gameAreaService['originalContext'] = originalCanvas.getContext('2d')!;
        gameAreaService['modifiedContext'] = modifiedCanvas.getContext('2d')!;
        gameAreaService['originalContextFrontLayer'] = originalCanvasForeground.getContext('2d')!;
        gameAreaService['modifiedContextFrontLayer'] = modifiedCanvasForeground.getContext('2d')!;

        gameAreaService['originalContext'].createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
        gameAreaService['modifiedContext'].createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
        gameAreaService['originalContextFrontLayer'].createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
        gameAreaService['modifiedContextFrontLayer'].createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);

        const originalGetImageDataSpy = spyOn(gameAreaService['originalContext'], 'getImageData');
        const modifiedGetImageDataSpy = spyOn(gameAreaService['modifiedContext'], 'getImageData');
        const originalFrontLayerGetImageDataSpy = spyOn(gameAreaService['originalContextFrontLayer'], 'getImageData');
        const modifiedFrontLayerGetImageDataSpy = spyOn(gameAreaService['modifiedContextFrontLayer'], 'getImageData');

        gameAreaService.setAllData();

        const expectedOriginal = gameAreaService['originalContext'].getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        const expectedModified = gameAreaService['modifiedContext'].getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        const expectedOriginalFrontLayer = gameAreaService['originalContextFrontLayer'].getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        const expectedModifiedFrontLayer = gameAreaService['modifiedContextFrontLayer'].getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        expect(originalGetImageDataSpy).toHaveBeenCalled();
        expect(modifiedGetImageDataSpy).toHaveBeenCalled();
        expect(originalFrontLayerGetImageDataSpy).toHaveBeenCalled();
        expect(modifiedFrontLayerGetImageDataSpy).toHaveBeenCalled();
        expect(gameAreaService['originalPixelData']).toEqual(expectedOriginal);
        expect(gameAreaService['modifiedPixelData']).toEqual(expectedModified);
        expect(gameAreaService['originalFrontPixelData']).toEqual(expectedOriginalFrontLayer);
        expect(gameAreaService['modifiedFrontPixelData']).toEqual(expectedModifiedFrontLayer);
    });

    it('loadImage should properly load an image', (done) => {
        const canvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const context: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
        const drawImageSpy = spyOn(context, 'drawImage').and.callFake(() => {});

        gameAreaService.loadImage(context, 'assets/img/RatCoon.png');
        setTimeout(() => {
            expect(drawImageSpy).toHaveBeenCalled();
            done();
        }, 350);
    });

    it('should correctly eliminate disparities from the altered canvas', () => {
        const originalCanvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const modifiedCanvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

        gameAreaService['originalContext'] = originalCanvas.getContext('2d')!;
        gameAreaService['modifiedContext'] = modifiedCanvas.getContext('2d')!;

        const putImageDataSpy = spyOn(gameAreaService['modifiedContext'], 'putImageData');
        const flashCorrectPixelsSpy = spyOn(gameAreaService, 'flashCorrectPixels').and.callFake(() => {});

        gameAreaService['originalContext'].fillRect(0, 0, 3, 1);
        gameAreaService['modifiedContext'].createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);

        const rectangleDifference = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 1, y: 2 },
            { x: 1, y: 3 },
        ];

        gameAreaService['originalPixelData'] = gameAreaService['originalContext'].getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        gameAreaService['modifiedPixelData'] = gameAreaService['modifiedContext'].getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        gameAreaService.replaceDifference(rectangleDifference);

        expect(putImageDataSpy).toHaveBeenCalled();
        expect(flashCorrectPixelsSpy).toHaveBeenCalled();

        expect(gameAreaService['modifiedContext'].getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)).toEqual(
            gameAreaService['modifiedContext'].getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT),
        );
    });

    it('showError should display an error on the left canvas and play error sound effect', () => {
        const canvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
        gameAreaService['originalContextFrontLayer'] = context;
        const initialImageData: ImageData = context.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
        const playErrorSoundSpy = spyOn(gameAreaService, 'playErrorSound').and.callFake(() => {});
        const methodSpy = spyOn(context, 'fillText');
        gameAreaService['mousePosition'] = { x: 100, y: 150 };
        gameAreaService.showError(true);
        expect(context.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)).toEqual(initialImageData);
        expect(methodSpy).toHaveBeenCalled();
        expect(playErrorSoundSpy).toHaveBeenCalled();
    });

    it('showError should display an error on the right canvas and play error sound effect', () => {
        const canvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
        gameAreaService['modifiedContextFrontLayer'] = context;
        const initialImageData: ImageData = context.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
        const playErrorSoundSpy = spyOn(gameAreaService, 'playErrorSound').and.callFake(() => {});
        const methodSpy = spyOn(context, 'fillText');
        gameAreaService['mousePosition'] = { x: 100, y: 150 };
        gameAreaService.showError(false);
        expect(context.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)).toEqual(initialImageData);
        expect(methodSpy).toHaveBeenCalled();
        expect(playErrorSoundSpy).toHaveBeenCalled();
    });

    it('flashCorrectPixels should flash the difference pixels on both canvas and play correct sound effect', (done) => {
        const currentDifference = [
            { x: 100, y: 150 },
            { x: 100, y: 200 },
            { x: 126, y: 154 },
        ];
        const originalCanvasFrontLayer: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        gameAreaService['originalContextFrontLayer'] = originalCanvasFrontLayer.getContext('2d')!;
        const modifiedCanvasFrontLayer: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        gameAreaService['modifiedContextFrontLayer'] = modifiedCanvasFrontLayer.getContext('2d')!;
        const ogPutImageDataSpy = spyOn(gameAreaService['originalContextFrontLayer'], 'putImageData');
        const mdPutImageDataSpy = spyOn(gameAreaService['modifiedContextFrontLayer'], 'putImageData');
        const ogClearRect = spyOn(gameAreaService['originalContextFrontLayer'], 'clearRect');
        const mdClearRect = spyOn(gameAreaService['modifiedContextFrontLayer'], 'clearRect');
        const ogInitialImageData = (gameAreaService['originalFrontPixelData'] = gameAreaService['originalContextFrontLayer'].createImageData(
            CANVAS_WIDTH,
            CANVAS_HEIGHT,
        ));
        const mdInitialImageData = (gameAreaService['modifiedFrontPixelData'] = gameAreaService['modifiedContextFrontLayer'].createImageData(
            CANVAS_WIDTH,
            CANVAS_HEIGHT,
        ));
        const playCorrectSoundSpy = spyOn(gameAreaService, 'playCorrectSound').and.callFake(() => {});

        gameAreaService.flashCorrectPixels(currentDifference);

        setTimeout(() => {
            expect(ogPutImageDataSpy).toHaveBeenCalled();
            expect(mdPutImageDataSpy).toHaveBeenCalled();
            expect(ogClearRect).toHaveBeenCalled();
            expect(mdClearRect).toHaveBeenCalled();
            expect(playCorrectSoundSpy).toHaveBeenCalled();
            expect(gameAreaService['originalFrontPixelData']).toEqual(ogInitialImageData);
            expect(gameAreaService['modifiedFrontPixelData']).toEqual(mdInitialImageData);
            done();
        }, FLASH_WAIT_TIME);
    });

    it('playErrorSound should call play on incorrectSoundEffect', () => {
        const playSpy = spyOn(gameAreaService['incorrectSoundEffect'], 'play').and.returnValue(Promise.resolve());
        gameAreaService.playErrorSound();
        expect(playSpy).toHaveBeenCalled();
    });

    it('playCorrectSound should call play on correctSoundEffect', () => {
        const playSpy = spyOn(gameAreaService['correctSoundEffect'], 'play').and.returnValue(Promise.resolve());
        gameAreaService.playCorrectSound();
        expect(playSpy).toHaveBeenCalled();
    });

    it('getOgContext should return originalContext', () => {
        const canvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
        gameAreaService['originalContext'] = context;
        const returnedContext = gameAreaService.getOgContext();
        expect(returnedContext).toEqual(context);
    });

    it('getMdContext should return modifiedContext', () => {
        const canvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
        gameAreaService['modifiedContext'] = context;
        const returnedContext = gameAreaService.getMdContext();
        expect(returnedContext).toEqual(context);
    });

    it('getOgFrontContext should return originalContextFrontLayer', () => {
        const canvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
        gameAreaService['originalContextFrontLayer'] = context;
        const returnedContext = gameAreaService.getOgFrontContext();
        expect(returnedContext).toEqual(context);
    });

    it('getMdFrontContext should return modifiedContextFrontLayer', () => {
        const canvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
        gameAreaService['modifiedContextFrontLayer'] = context;
        const returnedContext = gameAreaService.getMdFrontContext();
        expect(returnedContext).toEqual(context);
    });

    it('getMousePosition should return mousePosition', () => {
        gameAreaService['mousePosition'] = { x: 15, y: 150 };
        const returnedMousePosition = gameAreaService.getMousePosition();
        expect(returnedMousePosition).toEqual(gameAreaService['mousePosition']);
    });

    it('setOgContext should set originalContext', () => {
        const canvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
        gameAreaService.setOgContext(context);
        expect(gameAreaService['originalContext']).toEqual(context);
    });

    it('setOgFrontContext should set originalContextFrontLayer', () => {
        const canvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
        gameAreaService.setOgFrontContext(context);
        expect(gameAreaService['originalContextFrontLayer']).toEqual(context);
    });

    it('setMdContext should set modifiedContext', () => {
        const canvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
        gameAreaService.setMdContext(context);
        expect(gameAreaService['modifiedContext']).toEqual(context);
    });

    it('setMdFrontContext should set modifiedContextFrontLayer', () => {
        const canvas: HTMLCanvasElement = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
        gameAreaService.setMdFrontContext(context);
        expect(gameAreaService['modifiedContextFrontLayer']).toEqual(context);
    });
});