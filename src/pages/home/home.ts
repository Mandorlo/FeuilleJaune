import { Component } from '@angular/core';
import { App, NavController, ModalController } from 'ionic-angular';
import { TransactionService } from '../../services/transaction.service';

import { AjouterPage } from '../ajouter/ajouter';
import { Ajouter2Page } from '../ajouter2/ajouter2';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private transactions;

  constructor(public navCtrl: NavController,
              private trService: TransactionService,
              public modalCtrl: ModalController,
              private appCtrl: App) {
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
    // this.appCtrl.getRootNav().push(Ajouter2Page);
    let modal = this.modalCtrl.create(Ajouter2Page, {opt: "optional parameters"});
    modal.present();
  }

  enregistrer() {
    this.trService.set(this.transactions).then(_ => {
      console.log("enregistré !")
    }).catch(err => {
      console.log(err)
    })
  }

}
