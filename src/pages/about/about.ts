import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { AjouterPage } from '../ajouter/ajouter';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  ajouterPage = AjouterPage;

  constructor(public navCtrl: NavController) {

  }

}
