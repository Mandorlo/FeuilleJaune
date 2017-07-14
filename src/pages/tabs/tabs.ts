import { Component } from '@angular/core';

import { HomePage } from '../home/home';
import { FeuillejaunePage } from '../feuillejaune/feuillejaune';
import { BudgetPage } from '../budget/budget';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = BudgetPage;
  tab3Root = FeuillejaunePage;

  constructor() {

  }
}
