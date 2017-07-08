import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AjouterPage } from './ajouter';

@NgModule({
  declarations: [
    AjouterPage,
  ],
  imports: [
    IonicPageModule.forChild(AjouterPage),
  ],
  exports: [
    AjouterPage
  ]
})
export class AjouterPageModule {}
