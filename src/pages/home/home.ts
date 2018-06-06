import { Component } from '@angular/core';
import { App, NavController, ModalController, AlertController } from 'ionic-angular';

import { TransactionService } from '../../services/transaction.service';
import { FjService } from '../../services/fj.service';
import { ParamService } from '../../services/param.service';
import { CurrencyService } from '../../services/currency.service';

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
  private gauges: any = {
    'banque': 0, 'caisse': 0,
    'banque_max': 100, 'caisse_max': 100,
    'pretty_banque': "0 €", "pretty_caisse": "0 €"
  };
  private init: any = { 'bienvenue_msg': true };

  constructor(public navCtrl: NavController,
    private trService: TransactionService,
    private fjService: FjService,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    private paramService: ParamService,
    private currencyService: CurrencyService,
    private appCtrl: App) {

    /* trService.getAll().then(data => {
      this.transactions = data;
    }).catch(err => {
      console.log(err)
    });

    fjService.getAllFJ().then(data => {
      this.fj_list = data;
      this.updateGauges();
    }).catch(err => {
      console.log(err)
    }); */

    this.updateGauges();

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
        this.updateGaugesCore().then(r => 1).catch(e => console.log('ERROR in home.ts > updateGauges > updateGaugesCore', e));
      }).catch(err => {
        console.log(err)
      })
    }).catch(err => {
      console.log(err)
    })
  }

  async updateGaugesCore() {
    let res = await this.currencyService.init();
    let curr_month = moment().format("YYYY-MM") + "-01";
    //let last_month = moment(curr_month).subtract(1, 'months').format("YYYY-MM") + "-01";

    let prec_month_fj = await this.fjService.getFjLastMonth(curr_month);
    let this_month_fj = _.find(this.fj_list, { 'month': curr_month });
    let solde = { 'banque': 0, 'caisse': 0 }

    solde["banque_max"] = this.gauges.banque_max;
    solde["caisse_max"] = this.gauges.caisse_max;

    if (prec_month_fj) {
      let solde_prec_month_fj = this.fjService.getSoldeFJ(prec_month_fj)
      solde.banque = solde_prec_month_fj.banque
      solde.caisse = solde_prec_month_fj.caisse
      
      if (this_month_fj) {
        let solde_this_month_fj = this.fjService.getSoldeFJ(this_month_fj)
        let this_m_bank = (isNaN(solde_this_month_fj.banque)) ? 0 : solde_this_month_fj.banque;
        let this_m_caisse = (isNaN(solde_this_month_fj.caisse)) ? 0 : solde_this_month_fj.caisse;
                
        solde["banque_max"] = Math.max(10, solde.banque + this_m_bank);
        solde["caisse_max"] = Math.max(10, solde.caisse + this_m_caisse);
      } else {
        console.log("Impossible de trouver la fj de ce mois")
      }
    } else {
      console.log("Impossible de trouver la fj du mois précédent")
    }


    // maintenant on calcule le solde du mois courant
    if (this.transactions) {
      this.transactions.forEach(tr => {
        let this_month = moment(curr_month);
        if (this_month.isSameOrBefore(moment(tr.date))) {
          if (tr.type == 'out') {
            solde[tr.moyen] -= this.convert(tr.montant, tr.currency);
          } else if (tr.type == 'in') {
            solde[tr.moyen] += this.convert(tr.montant, tr.currency);
          } else if (tr.type == 'retrait') {
            let v = Math.abs(this.convert(tr.montant, tr.currency));
            solde.banque -= v;
            solde.caisse += v;
          } else if (tr.type == 'depot') {
            let v = Math.abs(this.convert(tr.montant, tr.currency));
            solde.banque += v;
            solde.caisse -= v;
          } else {
            console.log("la transaction de type " + tr.type + " n'est pas reconnue !")
          }
        }
      });
    }

    solde["pretty_banque"] = solde.banque.toFixed(2).toString() + " " + this.paramService.symbolCurrency();
    solde["pretty_caisse"] = solde.caisse.toFixed(2).toString() + " " + this.paramService.symbolCurrency();
    this.gauges = solde;
  }

  // convertit le montant dans la devise courante (définie dans ParamService)
  convert(montant, currency) {
    if (!this.paramService.currency) {
      console.log('WARNING in home.ts > convert : paramService.currency is not defined !')
      return montant
    }
    if (!currency) {
      console.log(`WARNING in home.ts > convert : transaction currency is not defined ! (montant=${montant}, currency=${currency}, paramService.currency=${this.paramService.currency})`)
      return montant
    }
    return this.currencyService.convert(montant, currency, this.paramService.currency)
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
