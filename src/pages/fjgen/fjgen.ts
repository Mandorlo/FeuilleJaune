import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController } from 'ionic-angular';

import { TransactionService } from '../../services/transaction.service';
import { ParamService } from '../../services/param.service';
import { FjService } from '../../services/fj.service';

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
  public solde_mois_prec: any = { 'banque': 0, 'caisse': 0 };
  public last_months = [];
  public fjdata;
  public fjdata_test;
  public edit_fj: boolean = false;
  public fj_list: any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private paramService: ParamService,
    private trService: TransactionService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private fjService: FjService) {
    let curr_fj = navParams.get("curr_fj");
    if (curr_fj) {
      console.log("editing fj: ", curr_fj);
      this.edit_fj = true;
      this.fjdata = curr_fj.data;
      this.curr_month = moment(curr_fj.month).format("YYYY-MM") + "-01";
      this.curr_month_pretty = moment(curr_fj.month).format("MMM YYYY");
    } else {
      console.log("creating neww FJ");
      this.edit_fj = false;
      this.initFjdata();
      // on load la db des transactions
      this.reload(false);
    }

    // on récupère la liste des last months et le solde du mois prec s'il existe
    this.fjService.getAllFJ().then(fj_list => {
      this.fj_list = fj_list;

      // on récupère le solde du mois prec
      this.updateSoldeLastMonth();

      // on récupère la liste des last months
      if (!this.edit_fj) {
        let mymonths = _.map(fj_list, "month");
        for (let i = 0; i < 7; i++) {
          let mydate = moment(this.curr_month).subtract(i, 'months');
          if (mymonths.indexOf(mydate.format("YYYY-MM") + "-01") < 0) this.last_months.push({ 'date': mydate.format("YYYY-MM") + "-01", 'label': mydate.format('MMMM YYYY') })
        }
        if (this.last_months && this.last_months.length) this.curr_month = this.last_months[0].date;

      }
      this.tr_engine_ready = true;
    }).catch(err => {
      console.log(err)
    });
  }

  ionViewDidLoad() {
    console.log('FjgenPage : Hosanna nell\'alto dei cieli !');
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
    this.fjdata.soustotal1_banque = this.soustotal1('banque');
    this.fjdata.soustotal1_caisse = this.soustotal1('caisse');
    this.fjdata.soustotal_I_banque = this.soustotal_I('banque');
    this.fjdata.soustotal_I_caisse = this.soustotal_I('caisse');
    this.fjdata.soustotal_II_banque = this.soustotal_II('banque');
    this.fjdata.soustotal_II_caisse = this.soustotal_II('caisse');
    this.fjdata.soustotal_III_banque = this.soustotal_III('banque');
    this.fjdata.soustotal_III_caisse = this.soustotal_III('caisse');
    this.fjdata.soustotal_IV_banque = this.soustotal_IV('banque');
    this.fjdata.soustotal_IV_caisse = this.soustotal_IV('caisse');
    this.fjdata.soustotal_V_banque = this.soustotal_V('banque');
    this.fjdata.soustotal_V_caisse = this.soustotal_V('caisse');
    this.fjdata.total_banque = this.total('banque');
    this.fjdata.total_caisse = this.total('caisse');
    this.fjdata.total_bc = (parseFloat(this.fjdata.total_banque) + parseFloat(this.fjdata.total_caisse)).toFixed(2);
    this.fjdata.solde_banque = this.solde('banque');
    this.fjdata.solde_caisse = this.solde("caisse");
    this.fjdata.solde_bc = (parseFloat(this.fjdata.solde_banque) + parseFloat(this.fjdata.solde_caisse)).toFixed(2);

    // on prépare les options
    let opt = {
      'personne': this.paramService.personne,
      'maison': this.paramService.maison,
      'curr_month': this.curr_month,
      'already_exists': this.edit_fj
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

    this.fjService.saveFJ(this.fjdata, opt).then(res => {
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
    this.trService.getAll().then(data => {
      if (typeof data == 'object' && data.length) {
        console.log("We got the transaction db, lodato sia il Signore !")
        this.transactions = data;
        // console.log("transactions : ", this.transactions);
        this.computeAmounts()
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

  initFjdata() {

    let last_fjdata = (this.fjdata) ? JSON.parse(JSON.stringify(this.fjdata)) : undefined;
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
    });
  }

  updateSoldeLastMonth() {
    let mois_prec = moment(this.curr_month).subtract(1, 'months').format("YYYY-MM-DD");
    console.log("fj_list", this.fj_list);
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
    }
  }

  computeAmounts() {
    // on va calculer pour le mois courant les dépenses/revenus

    // d'abord on trouve les dates limites du mois
    let date_start = moment(this.curr_month).startOf('month');
    let date_end = moment(this.curr_month).endOf('month');

    // ensuite on remet fjdata à zero
    this.initFjdata();

    // maintenant on peut calculer les montants
    for (let i = 0; i < this.transactions.length; i++) {
      let tr = this.transactions[i];
      if (moment(tr.date) >= date_start && moment(tr.date) <= date_end) {
        if (typeof tr.montant == 'number') this.fjdata[tr.category][tr.moyen] += tr.montant;
        else {
          let res = (tr.montant).toString().match(/\-?\s*[0-9]+[\,\.]?[0-9]*/g);
          if (res && res[0] == tr.montant) {
            this.fjdata[tr.category][tr.moyen] += parseFloat(tr.montant.replace(',', '.').replace(/\s/g, ''));
          } else {
            console.log("string '" + tr.montant + "' for transaction " + tr._id + " (" + tr.category + ") is not a valid amount")
          }
        }
      }
    }

    this.paramService.categories.forEach(cat => {
      this.fjdata[cat.id]['banque'] = (this.fjdata[cat.id]['banque'] > 0) ? this.fjdata[cat.id]['banque'].toFixed(2) : 0;
      this.fjdata[cat.id]['caisse'] = ( this.fjdata[cat.id]['caisse'] > 0) ? this.fjdata[cat.id]['caisse'].toFixed(2) : 0;
    })

    console.log("FJDATA", this.fjdata);
  }

  soustotal1(banque_ou_caisse) {
    return this.fjdata.salaire[banque_ou_caisse] + this.fjdata.allocation[banque_ou_caisse] + this.fjdata.don[banque_ou_caisse];
  }
  soustotal_I(b_or_c) {
    let total = this.soustotal(b_or_c, ['salaire', 'allocation', 'don', 'dime', 'autre', 'remboursement_sante', 'remboursement_pro',
      'remboursement_autre', 'report_mois_precedent', 'avance', 'epargne', 'transfert']);
    // pour le cas de caisse, il ne faut pas compter this.fjdata.transfert.caisse, qui n'est pas défini, il faut compter -this.fjdata.transfert.banque
    if (b_or_c == 'caisse') return (parseFloat(total) - this.fjdata.transfert.banque).toString();
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
      if (this.fjdata[liste[i]][b_or_c] == "") this.fjdata[liste[i]][b_or_c] = 0;
      soustotal += parseFloat(this.fjdata[liste[i]][b_or_c])
    }
    return soustotal.toFixed(2);
  }
  solde(b_or_c) {
    return (parseFloat(this.soustotal_I(b_or_c)) - parseFloat(this.total(b_or_c))).toFixed(2)
  }

}
