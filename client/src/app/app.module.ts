import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { CreationGameDialogComponent } from '@app/components/creation-game-dialog/creation-game-dialog.component';
import { GameInfosComponent } from '@app/components/game-infos/game-infos.component';
import { GameSheetComponent } from '@app/components/game-sheet/game-sheet.component';
import { PlayerNameDialogBoxComponent } from '@app/components/player-name-dialog-box/player-name-dialog-box.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { CreationPageComponent } from '@app/pages/creation-page/creation-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { SelectionPageComponent } from '@app/pages/selection-page/selection-page.component';
import { SoloGameViewComponent } from '@app/pages/solo-game-view/solo-game-view.component';
import { CanvasUnderButtonsComponent } from './components/canvas-under-buttons/canvas-under-buttons.component';
import { ImageCanvasComponent } from './components/image-canvas/image-canvas.component';
import { SoloGameViewDialogComponent } from './components/solo-game-view-dialog/solo-game-view-dialog.component';
import { ConfigPageComponent } from './pages/config-page/config-page.component';
/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        CreationPageComponent,
        MainPageComponent,
        MaterialPageComponent,
        SelectionPageComponent,
        SoloGameViewComponent,
        GameSheetComponent,
        PlayerNameDialogBoxComponent,
        GameInfosComponent,
        ImageCanvasComponent,
        ConfigPageComponent,
        CreationGameDialogComponent,
        CanvasUnderButtonsComponent,
        SoloGameViewDialogComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        MatDialogModule,
        OverlayModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        RouterModule,
        MatGridListModule,
        MatExpansionModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
