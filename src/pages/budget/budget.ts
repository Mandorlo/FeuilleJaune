import { Component } from '@angular/core';
import { App, NavController, NavParams } from 'ionic-angular';

import { TransactionService } from '../../services/transaction.service';

import { AjouterPage } from '../ajouter/ajouter';

/**
 * Generated class for the BudgetPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-budget',
  templateUrl: 'budget.html',
})
export class BudgetPage {
  private tr_engine_ready:boolean = false;
  public transactions;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public appCtrl: App,
              public trService: TransactionService) {
      this.reload();
  }

  ionViewDidLoad() {
    console.log('BudgetPage : I cieli e la terra sono pieni della tua gloria o Signore !');
  }

  reload() {
    this.tr_engine_ready = false;
    this.trService.getAll().then(data => {
      if (typeof data == 'object' && data.length) {
        this.transactions = data;
      } else {
        console.log("Le format de la base de transactions n'est pas bon ou la base est vide, on utilise du coup une base vide");
        this.transactions = [];
      }
      this.tr_engine_ready = true;
    }).catch(err => {
      console.log(err);
      console.log("On utilise du coup une base vide");
      this.transactions = [];
      this.tr_engine_ready = true;
    })
  }

  showAjouterPage() {
    this.appCtrl.getRootNav().push(AjouterPage);
  }

}
