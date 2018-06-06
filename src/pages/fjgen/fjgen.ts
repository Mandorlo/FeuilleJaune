import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController } from 'ionic-angular';

import { TransactionService } from '../../services/transaction.service';
import { ParamService } from '../../services/param.service';
import { FjService } from '../../services/fj.service';
import { CurrencyService } from '../../services/currency.service';

import { ParamPage } from '../param/param';

import moment from 'moment';
import _ from 'lodash';




@Component({
  selector: 'page-fjgen',
  templateUrl: 'fjgen.html',
})
export class FjgenPage {
  private tr_engine_ready: boolean = false;
  private saving_ongoing: boolean = false;

  public transactions = [];
  public curr_month = moment().format("YYYY-MM") + "-01";
  public curr_month_pretty: string = moment().format("MMM YYYY");
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
    private trService: TransactionService,
    private currencyService: CurrencyService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private fjService: FjService) {
      
    let i = 0
    let curr_month_param = navParams.get("month");
    if (curr_month_param) {
      console.log("editing fj: ", curr_month_param);
      this.edit_fj = true;
      this.fjService.getFjData(curr_month_param).then(fj => {
        console.log('FJDATA EDITION', fj)
        this.curr_fj = fj
        this.fj_currencies = Object.getOwnPropertyNames(fj.data).map(c => {return {val: c, label:this.paramService.symbolCurrency(c)}})
        this.curr_currency = this.fj_currencies[0]['val']
        i++
        this.tr_engine_ready = true;
      })
      this.curr_month = moment(curr_month_param).format("YYYY-MM") + "-01";
      this.curr_month_pretty = moment(curr_month_param).format("MMM YYYY");
    } else {
      this.setupNewFJ().catch(err => {
        console.log('ERROR in setting up new FJ : ', err)
      })
    }
  }

  ionViewDidLoad() {
    console.log('FjgenPage : Hosanna nell\'alto dei cieli !');
  }

  // called by the constructor
  async setupNewFJ() {
    let lastmonth = await this.fjService.getMonthOfNewFJ();
    this.last_months = [lastmonth]
    this.curr_month = lastmonth.date
    this.curr_month_pretty = lastmonth.label

    console.log("creating new FJ");
    this.edit_fj = false;
    let fj = await this.fjService.genFjData(this.curr_month)
    console.log('FJDATA', fj)
    this.curr_fj = fj
    this.fj_currencies = Object.getOwnPropertyNames(fj.data).map(c => {return {val: c, label:this.paramService.symbolCurrency(c)}})
    this.curr_currency = this.fj_currencies[0]['val']
    this.tr_engine_ready = true;
    return true
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
    // on complète fjdata avec les différents totaux
    this.curr_fj['data'][this.curr_currency].soustotaux.revenus.banque = this.soustotal1('banque');
    this.curr_fj['data'][this.curr_currency].soustotaux.revenus.caisse = this.soustotal1('caisse');
    this.curr_fj['data'][this.curr_currency].soustotal_I_banque = this.soustotal_I('banque');
    this.curr_fj['data'][this.curr_currency].soustotal_I_caisse = this.soustotal_I('caisse');
    this.curr_fj['data'][this.curr_currency].soustotal_II_banque = this.soustotal_II('banque');
    this.curr_fj['data'][this.curr_currency].soustotal_II_caisse = this.soustotal_II('caisse');
    this.curr_fj['data'][this.curr_currency].soustotal_III_banque = this.soustotal_III('banque');
    this.curr_fj['data'][this.curr_currency].soustotal_III_caisse = this.soustotal_III('caisse');
    this.curr_fj['data'][this.curr_currency].soustotal_IV_banque = this.soustotal_IV('banque');
    this.curr_fj['data'][this.curr_currency].soustotal_IV_caisse = this.soustotal_IV('caisse');
    this.curr_fj['data'][this.curr_currency].soustotal_V_banque = this.soustotal_V('banque');
    this.curr_fj['data'][this.curr_currency].soustotal_V_caisse = this.soustotal_V('caisse');
    this.curr_fj['data'][this.curr_currency].total_banque = this.total('banque');
    this.curr_fj['data'][this.curr_currency].total_caisse = this.total('caisse');
    this.curr_fj['data'][this.curr_currency].total_bc = (parseFloat(this.curr_fj['data'][this.curr_currency].total_banque) + parseFloat(this.curr_fj['data'][this.curr_currency].total_caisse)).toFixed(2);
    this.curr_fj['data'][this.curr_currency].solde_banque = this.solde('banque');
    this.curr_fj['data'][this.curr_currency].solde_caisse = this.solde("caisse");
    this.curr_fj['data'][this.curr_currency].solde_bc = (parseFloat(this.curr_fj['data'][this.curr_currency].solde_banque) + parseFloat(this.curr_fj['data'][this.curr_currency].solde_caisse)).toFixed(2);

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
      this.navCtrl.pop();
    }).catch(err => {
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

  initFjdata() {

    /* let last_fjdata = (this.fjdata) ? JSON.parse(JSON.stringify(this.fjdata)) : undefined;
    let report_obs = (last_fjdata && last_fjdata.report_mois_precedent && last_fjdata.report_mois_precedent.observations) ? last_fjdata.report_mois_precedent.observations : '';
    this.fjdata = { 'report_mois_precedent': { 'label': 'Report du mois précédent', 'banque': this.solde_mois_prec.banque, 'caisse': this.solde_mois_prec.caisse, 'observations': report_obs } }
    this.updateSoldeLastMonth();
    this.fjdata_test = { 'report_mois_precedent': { 'label': 'Report du mois précédent', 'banque': 'report_mois_prec_B', 'caisse': 'report_mois_prec_C', 'observations': 'report_mois_prec_O' } }
    this.paramService.categories.forEach(el => {
      let rep_obs = (last_fjdata && last_fjdata[el.id] && last_fjdata[el.id].observations) ? last_fjdata[el.id].observations : "";
      this.fjdata[el.id] = { 'label': el.label, 'banque': 0.0, 'caisse': 0.0, 'observations': rep_obs }
      this.fjdata_test[el.id] = { 'label': el.label, 'banque': el.id + '_B', 'caisse': el.id + '_C', 'observations': el.id + '_O' }
    });
    this.paramService.categories_in.forEach(el => {
      let rep_obs = (last_fjdata && last_fjdata[el.id] && last_fjdata[el.id].observations) ? last_fjdata[el.id].observations : "";
      this.fjdata[el.id] = { 'label': el.label, 'banque': 0.0, 'caisse': 0.0, 'observations': rep_obs }
      this.fjdata_test[el.id] = { 'label': el.label, 'banque': el.id + '_B', 'caisse': el.id + '_C', 'observations': el.id + '_O' }
    }); */
  }

  updateSoldeLastMonth() {
    /* let mois_prec = moment(this.curr_month).subtract(1, 'months').format("YYYY-MM-DD");
    let fj_mois_prec = _.find(this.fj_list, { "month": mois_prec });
    // console.log("Trying to get fj last month", fj_mois_prec);
    if (fj_mois_prec) {
      console.log("Found solde précédent du mois " + mois_prec, fj_mois_prec);
      this.solde_mois_prec.banque = fj_mois_prec.data.solde_banque;
      this.solde_mois_prec.caisse = fj_mois_prec.data.solde_caisse;
      if (this.fjdata && this.fjdata.report_mois_precedent) {
        this.fjdata.report_mois_precedent.banque = this.solde_mois_prec.banque;
        this.fjdata.report_mois_precedent.caisse = this.solde_mois_prec.caisse;
      } else {
        this.fjdata.report_mois_precedent.banque = 0;
        this.fjdata.report_mois_precedent.caisse = 0;
      }
    } else {
      console.log("Impossible de trouver le solde du mois précédent " + mois_prec, this.fjdata);
      if (!this.fjdata.report_mois_precedent) this.fjdata.report_mois_precedent = {};
      this.fjdata.report_mois_precedent.banque = 0;
      this.fjdata.report_mois_precedent.caisse = 0;
    } */
  }

  computeAmounts() {
    
  }

  convert(montant, currency) {
    if (!this.paramService.currency) throw {
      'errnum': 'GLOBAL_CURRENCY_UNDEFINED',
      'fun': 'fgen.ts > convert'
    }
    return this.currencyService.convert(montant, currency, this.paramService.currency)
  }

  soustotal1(banque_ou_caisse) {
    let type_list = this.fjService.category_types['revenus']
    return _.sum(type_list.map(cat => this.curr_fj['data'][this.curr_currency][cat][banque_ou_caisse]))
    /* return this.curr_fj['data'][this.curr_currency].salaire[banque_ou_caisse] 
            + this.curr_fj['data'][this.curr_currency].allocation[banque_ou_caisse] 
            + this.curr_fj['data'][this.curr_currency].don[banque_ou_caisse]; */
  }
  soustotal_I(b_or_c) {
    let total = this.soustotal(b_or_c, ['salaire', 'allocation', 'don', 'dime', 'autre', 'remboursement_sante', 'remboursement_pro',
      'remboursement_autre', 'report_mois_precedent', 'avance', 'epargne', 'transfert']);
    // pour le cas de caisse, il ne faut pas compter this.fjdata.transfert.caisse, qui n'est pas défini, il faut compter -this.fjdata.transfert.banque
    if (b_or_c == 'caisse') return (parseFloat(total) - this.curr_fj['data'][this.curr_currency].transfert.banque).toString();
    return total;
  }
  soustotal_II(b_or_c) {
    return this.soustotal(b_or_c, this.paramService.liste_maison)
  }
  soustotal_III(b_or_c) {
    if (!this.paramService.liste_viecourante) this.paramService.liste_viecourante = _.map(_.filter(this.paramService.categories, ['type', 'vie courante']), 'id');
    return this.soustotal(b_or_c, this.paramService.liste_viecourante)
  }
  soustotal_IV(b_or_c) {
    if (!this.paramService.liste_transport) this.paramService.liste_transport = _.map(_.filter(this.paramService.categories, ['type', 'transport']), 'id');
    return this.soustotal(b_or_c, this.paramService.liste_transport)
  }
  soustotal_V(b_or_c) {
    // if (!this.liste_secretariat) this.liste_secretariat = _.map(_.filter(this.transactionService.categories, ['type', 'secretariat']), 'id');
    return this.soustotal(b_or_c, this.paramService.liste_secretariat)
  }
  total(b_or_c) {
    return this.soustotal(b_or_c, _.map(this.paramService.categories, 'id'))
  }
  soustotal(b_or_c, liste) {
    var soustotal = 0.0;
    for (let i = 0; i < liste.length; i++) {
      if (this.curr_fj['data'][this.curr_currency][liste[i]][b_or_c] == "") this.curr_fj['data'][this.curr_currency][liste[i]][b_or_c] = 0;
      soustotal += parseFloat(this.curr_fj['data'][this.curr_currency][liste[i]][b_or_c])
    }
    return soustotal.toFixed(2);
  }
  solde(b_or_c) {
    return (parseFloat(this.soustotal_I(b_or_c)) - parseFloat(this.total(b_or_c))).toFixed(2)
  }

}
