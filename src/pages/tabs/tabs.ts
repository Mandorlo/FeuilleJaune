import { Component } from '@angular/core';

import { BudgetPage } from '../budget/budget';
import { AjouterPage } from '../ajouter/ajouter';
import { Ajouter2Page } from '../ajouter2/ajouter2';
import { FeuillejaunePage } from '../feuillejaune/feuillejaune';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = Ajouter2Page;
  tab2Root = BudgetPage;
  tab3Root = FeuillejaunePage;

  constructor() {

  }
}
