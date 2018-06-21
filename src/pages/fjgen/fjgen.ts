import { Component, Output, EventEmitter } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController } from 'ionic-angular';

import { ParamService } from '../../services/param.service';
import { FjService } from '../../services/fj.service';
import { CurrencyService } from '../../services/currency.service';

import moment from 'moment';


@Component({
  selector: 'page-fjgen',
  templateUrl: 'fjgen.html',
})
export class FjgenPage {
  @Output('onSaved') onSaved: EventEmitter<string> = new EventEmitter<string>();

  private tr_engine_ready: boolean = false;
  private saving_ongoing: boolean = false;

  public transactions = [];
  public curr_month = moment().format("YYYY-MM") + "-01";
  public fj_currencies: Array<Object> = [];
  public curr_currency: string;
  public solde_mois_prec: any = { 'banque': 0, 'caisse': 0 };
  public last_months = [];
  public curr_fj: Object;
  public fjdata_test;
  public edit_fj: boolean = false;
  public fj_list: any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private paramService: ParamService,
    private currencyService: CurrencyService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private fjService: FjService) {
      
    let curr_month_param = this.navParams.get("month");
    this.curr_currency = 'EUR'; //this.navParams.get("currency");

    if (curr_month_param) {
      this.getFJMonth(curr_month_param).catch(err => console.log(err))
    } else {
      this.setupNewFJ().catch(err => {
        console.log('ERROR in setting up new FJ : ', err)
      })
    }
  }

  get curr_currency_label() {
    return this.paramService.getCurrencyObj(this.curr_currency)['label']
  }

  get curr_month_pretty() {
    let pretty = moment(this.curr_month).format("MMMM YYYY");
    return pretty[0].toUpperCase() + pretty.substr(1)
  }

  get info() {
    return {currency:this.curr_currency, month:this.curr_month}
  }

  ionViewDidLoad() {
    console.log('FjgenPage : Hosanna nell\'alto dei cieli !');
  }

  // called by the constructor
  async setupNewFJ(lastmonth = null) {
    if (!lastmonth) lastmonth = await this.fjService.getMonthOfNewFJ();
    this.last_months = [lastmonth]
    this.curr_month = lastmonth

    console.log("creating new FJ for month ", lastmonth);
    this.edit_fj = false;
    let fj = await this.fjService.genFjData(this.curr_month)
    this.fj_currencies = Object.getOwnPropertyNames(fj.data).map(c => this.paramService.getCurrencyObj(c))
    console.log('FJDATA', this.fj_currencies, fj)
    this.curr_fj = fj
    this.curr_currency = this.fj_currencies[0]['id']
    this.tr_engine_ready = true;
    return true
  }

  async getFJMonth(curr_month_param) {
    let myFJ = await this.fjService.getFjData(curr_month_param);
    if (myFJ) {
      console.log("editing fj: ", curr_month_param);
      this.edit_fj = true;
      this.fj_currencies = Object.getOwnPropertyNames(myFJ.data).map(c => this.paramService.getCurrencyObj(c))
      this.curr_currency = this.fj_currencies[0]['id'];
      console.log('FJDATA EDITION', this.curr_currency, myFJ)
      this.curr_fj = myFJ
      this.tr_engine_ready = true;
      this.curr_month = moment(curr_month_param).format("YYYY-MM") + "-01";
    } else {
      return this.setupNewFJ(curr_month_param)
    }
  }

  presentToast(msg, temps = 2000) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: temps
    });
    toast.present();
  }

  createFJ() { // le bouton sauver fj
    this.saving_ongoing = true;
    
    // on prépare les options
    let opt = {
      'personne': this.paramService.personne,
      'maison': this.paramService.maison,
      'curr_month': this.curr_month,
      'already_exists': this.edit_fj,
      'currency': this.paramService.currency
    }

    if (!opt.personne) {
      this.presentToast("Il faut spécifier une personne dans les paramètres");
      this.saving_ongoing = false;
      return
    } else if (!opt.maison) {
      this.presentToast("Il faut spécifier une maison dans les paramètres");
      this.saving_ongoing = false;
      return
    }

    this.fjService.saveFJ(this.curr_fj, opt).then(res => {
      this.saving_ongoing = false;
      console.log("FJ sauvée ! Merci Seigneur !", res);
      this.onSaved.emit("FJ sauvée ! Merci Seigneur !")
      this.navCtrl.pop();
    }).catch(err => {
      this.onSaved.emit("Erreur lors de l'enregistrement de la FJ :(")
      this.saving_ongoing = false;
      console.log(err)
    });
  }

  reload(prompt = true) {
    let alert = this.alertCtrl.create({
      title: 'Recalculer',
      message: 'Veux-tu vraiment recalculer tous les montants ? Cela écrasera les montants modifiés à la main.',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => {
            console.log('Recalcul des montants annulé.');
          }
        },
        {
          text: 'Recalculer',
          handler: () => {
            console.log('Recalcul des montants...');
            this.reloadcore();
          }
        }
      ]
    });
    if (prompt) alert.present();
    else this.reloadcore();
  }

  reloadcore() {
    this.tr_engine_ready = false;
    this.fjService.genFjData(this.curr_month).then(fj => {
      console.log('FJDATA reloaded', fj)
      this.curr_fj = fj
      this.fj_currencies = Object.getOwnPropertyNames(fj.data).map(c => {return {val: c, label:this.paramService.symbolCurrency(c)}})
      this.curr_currency = this.fj_currencies[0]['val']
      this.tr_engine_ready = true;
    }).catch(err => {
      console.log(err)
    })
  }

  convert(montant, currency) {
    if (!this.paramService.currency) throw {
      'errnum': 'GLOBAL_CURRENCY_UNDEFINED',
      'fun': 'fgen.ts > convert'
    }
    return this.currencyService.convert(montant, currency, this.paramService.currency)
  }

  soustotal(cat_type) {
    return this.fjService.soustotal(this.curr_fj, this.curr_currency, cat_type)
  }
}
