import { Component } from '@angular/core';

import { BudgetPage } from '../budget/budget';
// import { ContactPage } from '../contact/contact'; // TODO remove
import { AjouterPage } from '../ajouter/ajouter'; // TODO remove
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
