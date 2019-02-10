import { Component, ViewChild } from '@angular/core';
import { App, NavController, NavParams, ModalController } from 'ionic-angular';

import { TransactionService } from '../../services/transaction.service';

import { Ajouter2Page } from '../ajouter2/ajouter2';
import { TrDetailsPage } from '../tr-details/tr-details';

//import _ from 'lodash';
import { sortBy } from '../../services/_.service';

@Component({
  selector: 'page-budget',
  templateUrl: 'budget.html',
})
export class BudgetPage {
  @ViewChild('header_search') headerSearch;

  private marginList:string = "120"; // la margin-top de "ion-list" dépend si le filtre de recherche est visible ou non

  private tr_engine_ready:boolean = false;
  public transactions;
  public nb_tr = 0;
  private modalAddTr;
  public searchText:string = "";

  public filtre_moyen_opt = [{'title': 'Carte bleue', 'val': 'banque'}, {'title': 'Liquide', 'val': 'caisse'}];
  public filtre_moyen_sel = ['banque', 'caisse'];
  public filtre_moyen_sel2:string = "";
  public filtre_inout_opt = [{'title': 'Entrées', 'val': 'in'}, {'title': 'Sorties', 'val': 'out'}]
  public filtre_inout_sel = ['in', 'out'];
  public filtre_inout_sel2:string = '';

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
        this.transactions = sortBy(data, 'date').reverse(); //_.orderBy(data, ['date'], ['desc']);
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
    // let text = e.data;
  }

  onFilterMoyenChange(e) {
    if (this.filtre_moyen_sel.length > 1) this.filtre_moyen_sel2 = "";
    else if (this.filtre_moyen_sel.length) this.filtre_moyen_sel2 = "@moyen " + this.filtre_moyen_sel[0];
    else this.filtre_moyen_sel2 = "@moyen azeraef";
  }

  onFilterInoutChange(e) {
    if (this.filtre_inout_sel.length > 1) this.filtre_inout_sel2 = "";
    else if (this.filtre_inout_sel.length) this.filtre_inout_sel2 = "@inout " + this.filtre_inout_sel[0];
    else this.filtre_inout_sel2 = "@inout azeraef";
  }

  // this is triggered when we develop/collaps the filter "<reveal-div>"
  onFilterToggled($event) {
    setTimeout(_ => this.marginList = ($event) ? "230" : "120", 300);
  }

}
