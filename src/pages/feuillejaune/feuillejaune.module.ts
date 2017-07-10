import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FeuillejaunePage } from './feuillejaune';

@NgModule({
  declarations: [
    FeuillejaunePage,
  ],
  imports: [
    IonicPageModule.forChild(FeuillejaunePage),
  ],
  exports: [
    FeuillejaunePage
  ]
})
export class FeuillejaunePageModule {}
