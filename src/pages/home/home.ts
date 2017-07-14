import { Component } from '@angular/core';
import { App, NavController } from 'ionic-angular';
import { TransactionService } from '../../services/transaction.service';

import { AjouterPage } from '../ajouter/ajouter';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private transactions;

  constructor(public navCtrl: NavController, private trService: TransactionService, private appCtrl: App) {
    // this.trService = trService;
    trService.getAll().then(data => {
      this.transactions = data;
    }).catch(err => {
      console.log(err)
    })
  }

  ionViewDidLoad() {

  }

  showAjouterPage() {
    this.appCtrl.getRootNav().push(AjouterPage);
  }

  enregistrer() {
    this.trService.set(this.transactions).then(_ => {
      console.log("enregistré !")
    }).catch(err => {
      console.log(err)
    })
  }

}
