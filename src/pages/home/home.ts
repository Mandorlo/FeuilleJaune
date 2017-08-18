import { Component } from '@angular/core';
import { App, NavController, ModalController, AlertController } from 'ionic-angular';

import { TransactionService } from '../../services/transaction.service';
import { FjService } from '../../services/fj.service';
import { ParamService } from '../../services/param.service';

import { GaugeComponent } from '../../components/gauge/gauge';

import { Ajouter2Page } from '../ajouter2/ajouter2';
import { ParamPage } from '../param/param';

import moment from 'moment';
import _ from 'lodash';



@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private transactions;
  private fj_list;
  private gauges: any = { 'banque': 0, 'caisse': 0, 'pretty_banque': "0 €", "pretty_caisse": "0 €" };
  private init: any = { 'bienvenue_msg': true };

  constructor(public navCtrl: NavController,
    private trService: TransactionService,
    private fjService: FjService,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    private paramService: ParamService,
    private appCtrl: App) {

    trService.getAll().then(data => {
      this.transactions = data;
    }).catch(err => {
      console.log(err)
    });

    fjService.getAllFJ().then(data => {
      this.fj_list = data;
      this.updateGauges();
    }).catch(err => {
      console.log(err)
    });

    paramService.get("init").then(v => {
      if (v) this.init = v;
    }).catch(err => {
      console.log(err)
    });
  }

  ionViewDidLoad() {
    console.log("HomePage: Santo è il Signore, Dio del'universo !");
  }

  ionViewDidEnter() {
    this.updateGauges();
  }

  updateGauges() {
    this.trService.getAll().then(tr_list => {
      this.transactions = tr_list;
      this.fjService.getAllFJ().then(fj_list => {
        this.fj_list = fj_list;
        this.updateGaugesCore();
      }).catch(err => {
        console.log(err)
      })
    }).catch(err => {
      console.log(err)
    })
  }

  updateGaugesCore() {
    let curr_month = moment().format("YYYY-MM") + "-01";
    let last_month = moment(curr_month).subtract(1, 'months').format("YYYY-MM") + "-01";

    let prec_month_fj = _.find(this.fj_list, { 'month': last_month });
    let solde = { 'banque': 0, 'caisse': 0 }

    if (prec_month_fj) {
      solde.banque = parseFloat(prec_month_fj.data.solde_banque);
      solde.caisse = parseFloat(prec_month_fj.data.solde_caisse);
    } else {
      // console.log("Impossible de trouver la fj du mois précédent")
    }

    // maintenant on calcule le solde du mois courant
    if (this.transactions) {
      this.transactions.forEach(tr => {
        let this_month = moment(curr_month);
        if (this_month.isBefore(moment(tr.date))) {
          if (tr.type == 'out') {
            solde[tr.moyen] -= parseFloat(tr.montant);
          } else if (tr.type == 'in') {
            solde[tr.moyen] += parseFloat(tr.montant);
          } else if (tr.type == 'retrait') {
            let v = Math.abs(parseFloat(tr.montant));
            solde.banque -= v;
            solde.caisse += v;
          } else if (tr.type == 'depot') {
            let v = Math.abs(parseFloat(tr.montant));
            solde.banque += v;
            solde.caisse -= v;
          } else {
            console.log("la transaction de type " + tr.type + " n'est pas reconnue !")
          }
        }
      });
    }

    solde["pretty_banque"] = solde.banque.toString() + " " + this.paramService.symbolCurrency();
    solde["pretty_caisse"] = solde.caisse.toString() + " " + this.paramService.symbolCurrency();
    this.gauges = solde;
  }

  showParamPage() {
    this.navCtrl.push(ParamPage);
  }

  showAjouterPage() {
    // this.appCtrl.getRootNav().push(Ajouter2Page);
    let modal = this.modalCtrl.create(Ajouter2Page, { opt: "optional parameters" });
    modal.onDidDismiss(data => {
      this.updateGauges();
    });
    modal.present();
  }

  enregistrer() {
    this.trService.set(this.transactions).then(_ => {
      console.log("enregistré !")
    }).catch(err => {
      console.log(err)
    })
  }

  closeBienvenue() {
    this.init.bienvenue_msg = false;
    this.paramService.setInit(this.init);
    console.log("m", this.init)
  }

}
