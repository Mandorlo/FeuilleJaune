import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { BudgetLineComponent } from './budget-line';

@NgModule({
  declarations: [
    BudgetLineComponent,
  ],
  imports: [
    IonicModule,
  ],
  exports: [
    BudgetLineComponent
  ]
})
export class BudgetLineComponentModule {}
