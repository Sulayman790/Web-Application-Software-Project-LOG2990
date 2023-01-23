import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PlayerNameDialogBoxComponent } from '@app/components/player-name-dialog-box/player-name-dialog-box.component';
import { Game } from '@app/interfaces/game';

@Component({
    selector: 'app-game-sheet-config',
    templateUrl: './game-sheet-config.component.html',
    styleUrls: ['./game-sheet-config.component.scss'],
})
export class GameSheetConfigComponent {
    @Input() game: Game = {
        id: 1,
        name: 'test',
        difficultyLevel: 1,
        thumbnail: 'test',
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
    };

    playerName: string;
    constructor(public dialog: MatDialog) {}

    openDialog() {
        const dialogRef = this.dialog.open(PlayerNameDialogBoxComponent);
        dialogRef.afterClosed().subscribe((result) => {
            this.playerName = result;
        });
    }
}
