import { Component } from '@angular/core';
import { App, NavController, NavParams, ModalController } from 'ionic-angular';

import { TransactionService } from '../../services/transaction.service';

import { Ajouter2Page } from '../ajouter2/ajouter2';
import { TrDetailsPage } from '../tr-details/tr-details';

import _ from 'lodash';

@Component({
  selector: 'page-budget',
  templateUrl: 'budget.html',
})
export class BudgetPage {
  private tr_engine_ready:boolean = false;
  public transactions;
  public nb_tr = 0;
  private modalAddTr;
  public searchText:string = "";

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public modalCtrl: ModalController,
              public appCtrl: App,
              public trService: TransactionService) {
      this.reload();
  }

  ionViewDidLoad() {
    console.log('BudgetPage : I cieli e la terra sono pieni della tua gloria o Signore !');
    this.modalAddTr = this.modalCtrl.create(Ajouter2Page, {opt: "optional parameters"});
    this.modalAddTr.onDidDismiss(data => {
      this.reload();
    });
  }

  ionViewDidEnter() {
    this.reload();
  }

  reload() {
    this.tr_engine_ready = false;
    this.trService.getAll().then(data => {
      if (typeof data == 'object' && data.length) {
        this.transactions = _.orderBy(data, ['date'], ['desc']);
        this.nb_tr = this.transactions.length;
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

  showDetails(tr) {
    this.navCtrl.push(TrDetailsPage, {"tr": tr});
  }

  showAjouterPage() {
    // this.appCtrl.getRootNav().push(Ajouter2Page);
    this.modalAddTr.present();
  }

  onInputSearch(e) {
    let text = e.data;
  }

}
