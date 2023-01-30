import { Injectable } from '@angular/core';
import { Pixel } from '@app/interfaces/pixel';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/creation-page';
import { CanvasPosition } from '@app/enum/canvas-position';

@Injectable({
    providedIn: 'root',
})
export class ImageService {
    leftBackgroundContext: CanvasRenderingContext2D;
    rightBackgroundContext: CanvasRenderingContext2D;
    leftBackground: string = '';
    rightBackground: string = '';

    resetBackground(canvasPosition: CanvasPosition) {
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.resetLeftBackground();
                break;
            case CanvasPosition.Right:
                this.resetRightBackground();
                break;
        }
    }

    resetLeftBackground() {
        this.leftBackground = '';
        this.leftBackgroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.leftBackgroundContext.drawImage(new Image(), 0, 0);
    }

    resetRightBackground() {
        this.rightBackground = '';
        this.rightBackgroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.rightBackgroundContext.drawImage(new Image(), 0, 0);
    }

    resetBothBackgrounds() {
        this.resetLeftBackground();
        this.resetRightBackground();
    }

    setBackground(canvasPosition: CanvasPosition, image: string) {
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.setLeftBackground(image);
                break;
            case CanvasPosition.Right:
                this.setRightBackground(image);
                break;
        }
    }

    //TODO: Possible to avoid code duplication?
    setLeftBackground(image: string) {
        const imageToDraw = new Image();
        imageToDraw.src = image;
        this.leftBackground = image;
        this.leftBackgroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.leftBackgroundContext.drawImage(imageToDraw, 0, 0);
    }

    setRightBackground(image: string){
        const imageToDraw = new Image();
        imageToDraw.src = image;
        this.rightBackground = image;
        this.rightBackgroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.rightBackgroundContext.drawImage(imageToDraw, 0, 0);
    }

    setBackgroundContext(canvasPosition: CanvasPosition, context: CanvasRenderingContext2D){
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.leftBackgroundContext = context;
                break;
            case CanvasPosition.Right:
                this.rightBackgroundContext = context;
                break;
        }
    }

    setBothBackgrounds(image: string) {
        this.setLeftBackground(image);
        this.setRightBackground(image);
    }
    
    transformContextToPixelArray(context: CanvasRenderingContext2D): Pixel[] {
        const imageData = context.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        const data = imageData.data;
        const pixelArray: Pixel[] = [];
        for (let i = 0; i < data.length; i += 4) {
            const pixel : Pixel = {
                red: data[i],
                green: data[i + 1],
                blue: data[i + 2],
                alpha: data[i + 3],
            };
            pixelArray.push(pixel);
        }
        console.log(pixelArray);
        return pixelArray;
    }

    //Pixel[y][x] is the pixel at position (x,y)
    transformPixelArrayToPixelMatrix(pixelArray: Pixel[]): Pixel[][] {
        const pixelMatrix: Pixel[][] = [];
        for (let i = 0; i < IMG_HEIGHT; i++) {
            pixelMatrix.push(pixelArray.slice(i * IMG_WIDTH, (i + 1) * IMG_WIDTH));
        }
        return pixelMatrix;
    }
}
