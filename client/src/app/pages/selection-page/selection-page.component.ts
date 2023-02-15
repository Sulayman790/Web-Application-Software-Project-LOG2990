import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { CarouselPaginator } from '@app/interfaces/game-interfaces';
import { CommunicationService } from '@app/services/communication-service/communication.service';

@Component({
    selector: 'app-selection-page',
    templateUrl: './selection-page.component.html',
    styleUrls: ['./selection-page.component.scss'],
})
export class SelectionPageComponent implements AfterViewInit {
    gameCarrousel: CarouselPaginator;
    readonly homeRoute: string = '/home';
    private index: number = 0;
    constructor(private readonly communicationService: CommunicationService, public router: Router) {
        this.gameCarrousel = { hasNext: false, hasPrevious: false, gameCards: [] };
    }

    ngAfterViewInit(): void {
        this.communicationService.loadGameCarrousel(this.index).subscribe((gameCarrousel) => {
            if (gameCarrousel) {
                this.gameCarrousel = gameCarrousel;
            }
        });
    }

    hasNext() {
        if (this.gameCarrousel.hasNext) {
            this.communicationService.loadGameCarrousel(++this.index).subscribe((gameCarrousel) => {
                if (gameCarrousel) {
                    this.gameCarrousel = gameCarrousel;
                }
            });
        }
    }

    hasPrevious() {
        if (this.gameCarrousel.hasPrevious) {
            this.communicationService.loadGameCarrousel(--this.index).subscribe((gameCarrousel) => {
                if (gameCarrousel) {
                    this.gameCarrousel = gameCarrousel;
                }
            });
        }
    }
}