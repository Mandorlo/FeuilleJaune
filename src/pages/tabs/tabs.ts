import { Component } from '@angular/core';

import { BudgetPage } from '../budget/budget';
import { ContactPage } from '../contact/contact';
import { AjouterPage } from '../ajouter/ajouter';
import { FeuillejaunePage } from '../feuillejaune/feuillejaune';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = AjouterPage;
  tab2Root = BudgetPage;
  tab3Root = FeuillejaunePage;

  constructor() {

  }
}