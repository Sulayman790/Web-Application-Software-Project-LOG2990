import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
// import { CanvasPosition } from '@app/enum/canvas-position';
import { ImageCanvasComponent } from './image-canvas.component';
import { CanvasUnderButtonsComponent } from '@app/components/canvas-under-buttons/canvas-under-buttons.component';

describe('ImageCanvasComponent', () => {
    let component: ImageCanvasComponent;
    let fixture: ComponentFixture<ImageCanvasComponent>;
    // let imageService: ImageService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ImageCanvasComponent, CanvasUnderButtonsComponent],
            imports: [MatDialogModule, MatIconModule, MatTooltipModule, HttpClientTestingModule],
            providers: [
                {
                    provide: MatDialog,
                },
            ],
        }).compileComponents();
        // imageService = TestBed.inject(ImageService);
        fixture = TestBed.createComponent(ImageCanvasComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
