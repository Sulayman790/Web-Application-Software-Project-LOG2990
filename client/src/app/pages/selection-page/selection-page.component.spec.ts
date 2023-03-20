/* eslint-disable no-underscore-dangle */
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { NavBarComponent } from '@app/components/nav-bar/nav-bar.component';
import { routes } from '@app/modules/app-routing.module';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { of } from 'rxjs';
import { SelectionPageComponent } from './selection-page.component';

describe('SelectionPageComponent', () => {
    let component: SelectionPageComponent;
    let fixture: ComponentFixture<SelectionPageComponent>;
    // let roomManagerServiceSpy: jasmine.SpyObj<RoomManagerService>;
    // const cardGameDeletedSubTest = new Subject<string>();

    beforeEach(async () => {
        // roomManagerServiceSpy = jasmine.createSpyObj('RoomManagerService', ['handleRoomEvents', 'disconnect'], {
        //     isGameCardDeleted$: cardGameDeletedSubTest,
        // });
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes(routes), MatGridListModule, FormsModule, MatIconModule],
            declarations: [SelectionPageComponent, NavBarComponent],
            providers: [
                HttpClient,
                HttpHandler,
                {
                    provide: CommunicationService,
                    useValue: jasmine.createSpyObj('CommunicationService', {
                        loadGameCarrousel: of({ hasNext: false, hasPrevious: false, gameCards: [] }),
                    }),
                },
                // {
                //     provide: RoomManagerService,
                //     useValue: roomManagerServiceSpy,
                // },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(SelectionPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load a Carrousel when this one exist', () => {
        component.ngAfterViewInit();
        expect(component.gameCarrousel).toEqual({ hasNext: false, hasPrevious: false, gameCards: [] });
    });

    it('should load the next Carrousel and increase component index when clicking on the next_button', () => {
        component['index'] = 0;
        component.gameCarrousel.hasNext = true;
        component.nextCarrousel();
        expect(component.gameCarrousel).toEqual({ hasNext: true, hasPrevious: false, gameCards: [] });
        expect(component['index']).toEqual(1);
    });

    it('should load the previous Carrousel and decrement component index when clicking on the previous_button', () => {
        component['index'] = 1;
        component.gameCarrousel.hasPrevious = true;
        component.previousCarrousel();
        expect(component.gameCarrousel).toEqual({ hasNext: false, hasPrevious: true, gameCards: [] });
        expect(component['index']).toEqual(0);
    });

    it('should delete a game card', () => {
        /* const game1 = { _id: '1', name: 'game1', difficultyLevel: true, soloTopTime: [], oneVsOneTopTime: [], thumbnail: '' };
        const game2 = { _id: '2', name: 'game1', difficultyLevel: true, soloTopTime: [], oneVsOneTopTime: [], thumbnail: '' };
        const gameCards = [game1, game2];
        component.handleGameCardDelete(gameCards);
        // cardGameDeletedSubTest.next('game1');
        expect(component.gameCarrousel.gameCards.length).toBe(0);
        expect(component.gameCarrousel.gameCards[0]._id).toBe('1');*/
    });
});
