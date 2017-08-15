import { Component } from '@angular/core';

import { HomePage } from '../home/home';
import { FjmgmtPage } from '../fjmgmt/fjmgmt';
import { ChartsPage } from '../charts/charts';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = ChartsPage;
  tab3Root = FjmgmtPage;

  constructor() {

  }
}
