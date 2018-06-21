import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController, ToastController } from 'ionic-angular';

import { FjgenPage } from '../fjgen/fjgen';

import { FjService } from '../../services/fj.service';
import { ParamService } from '../../services/param.service';
import { StatsService } from '../../services/stats.service';
import { CurrencyService } from '../../services/currency.service';

import moment from 'moment';
import { _ } from '../../services/_.service';

/**
 * Generated class for the FjDetailsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-fj-details',
  templateUrl: 'fj-details.html',
})
export class FjDetailsPage {
  @ViewChild('maison') maison;

  private curr_fj: Object;
  private fj_currencies: Array<Object>;
  private curr_currency: string;
  private fj_soustotaux;
  private loading: boolean = false;

  private fj_total_depenses:number = 0;
  private moyenne_depenses:number = 0;
  private moyenne_ratio:string = '0';

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private toastCtrl: ToastController,
              private alertCtrl: AlertController,
              private fjService: FjService,
              private statsService: StatsService,
              private currencyService: CurrencyService,
              private paramService: ParamService) {

    this.curr_fj = navParams.get("fj");
    this.fj_currencies = Object.getOwnPropertyNames(this.curr_fj['data']).map(c => this.paramService.getCurrencyObj(c))
    this.curr_currency = this.fj_currencies[0]['id'];
    console.log('curr_currency', this.curr_currency, this.fj_currencies)

    //this.init().catch(err => console.log(err))
  }

  get pretty_month() {
    return moment(this.curr_fj['month'], 'YYYY-MM-DD').format('MMMM YYYY')
  }

  ionViewDidLoad() {
    //this.init().catch(err => console.log(err))
    console.log('ionViewDidLoad FjDetailsPage Lodato sia il Signore !');
  }

  ionViewDidEnter() {
    this.reload().catch(err => console.log(err))
  }

  async reload() {
    this.curr_fj = await this.fjService.getFjData(this.curr_fj['month'])
    this.fj_currencies = Object.getOwnPropertyNames(this.curr_fj['data']).map(c => this.paramService.getCurrencyObj(c))
    this.curr_currency = this.fj_currencies[0]['id'];
    this.init().catch(err => console.log(err))
  }

  ngAfterViewInit() {
    let bg_img = this.paramService.getPhotoMaison(this.curr_fj['maison'])
    if (!bg_img) {
      bg_img = this.paramService.getPhotoMaison(this.curr_fj['maison'])
    }
    this.maison.nativeElement.style.backgroundImage = 'url(' + bg_img + ')';
  }

  async init() {
    this.fj_soustotaux = this.fjService.genSousTotaux(this.curr_fj)
    this.fj_soustotaux['all'] = {}
    // on ajoute une devise 'all' dans les soustotaux
    for (let t in this.fj_soustotaux[this.curr_currency]) {
        this.fj_soustotaux['all'][t] = {}
        this.fj_soustotaux['all'][t].banque = _.sum(this.fj_currencies.map(curr => this.currencyService.convert(this.fj_soustotaux[curr['id']][t].banque, curr['id'])))
        this.fj_soustotaux['all'][t].caisse = _.sum(this.fj_currencies.map(curr => this.currencyService.convert(this.fj_soustotaux[curr['id']][t].caisse, curr['id'])))
    }
    this.fj_soustotaux['pretty'] = this.currencyService.prettyObj(this.fj_soustotaux)

    this.moyenne_depenses = await this.statsService.fjMoyenneDepenses(12)
    this.fj_total_depenses = this.fjService.getTotalFJ(this.curr_fj).bc

    this.moyenne_ratio = (this.fj_total_depenses - this.moyenne_depenses).toFixed(2)
    if (this.fj_total_depenses > this.moyenne_depenses) this.moyenne_ratio = '+' + this.moyenne_ratio;
    this.moyenne_ratio += ' ' + this.paramService.symbolCurrency();

    console.log('sous_totaux', this.fj_soustotaux, this.moyenne_depenses, this.fj_total_depenses, this.moyenne_ratio)
    console.log('THIS FJ : ', this.curr_fj)
  }

  presentToast(msg, temps = 2000) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: temps
    });
    toast.present();
  }

  // ouvre la page pour éditer cette Feuile Jaune
  editFJ(currency) {
    console.log('edit fj', this.curr_fj['month'], currency)
    this.navCtrl.push(FjgenPage, {
      "month": this.curr_fj['month']
    })
  }

  shareFJ() {
    this.loading = true
    this.fjService.shareFJ(this.curr_fj['month']).then(_ => {
      this.presentToast("Feuille Jaune partagée ! Béni soit le Seigneur, Dieu de l'univers !");
      this.loading = false
    }).catch(err => {
      this.presentToast("Impossible de partager la feuille jaune :(");
      console.log(err);
      this.navCtrl.pop();
      this.loading = false
    });
  }

  supprFJ() {
    let alert = this.alertCtrl.create({
      title: 'Supprimer',
      message: 'Veux-tu vraiment supprimer la feuille jaune de ' + this.curr_fj['month'] + ' ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => {
            console.log('Suppression de la feuille jaune annulée.');
          }
        },
        {
          text: 'Supprimer',
          handler: () => {
            console.log('Suppression de la feuille jaune');
            this.supprFJcore();
          }
        }
      ]
    });
    alert.present();
  }

  supprFJcore() {
    this.loading = true;
    this.fjService.deleteFJ([this.curr_fj]).then(res => {
      console.log("Delete completed !", res);
      this.navCtrl.pop();
      this.loading = false
    }).catch(err => {
      console.log("Error while deleting :(", err);
      this.navCtrl.pop();
      this.loading = false
    });
  }
}
