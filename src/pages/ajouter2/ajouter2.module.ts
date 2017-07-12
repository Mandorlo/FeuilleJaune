import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Ajouter2Page } from './ajouter2';

@NgModule({
  declarations: [
    Ajouter2Page,
  ],
  imports: [
    IonicPageModule.forChild(Ajouter2Page),
  ],
  exports: [
    Ajouter2Page
  ]
})
export class Ajouter2PageModule {}
