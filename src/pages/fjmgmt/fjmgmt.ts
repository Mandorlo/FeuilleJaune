import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController } from 'ionic-angular';

import { ParamService } from '../../services/param.service';
import { FjService, FeuilleJaune } from '../../services/fj.service';
import { StatsService } from '../../services/stats.service';

import { ParamPage } from '../param/param';
import { FjgenPage } from '../fjgen/fjgen';
import { FjDetailsPage } from '../fj-details/fj-details';
import { CurrencyService } from '../../services/currency.service';

import _ from 'lodash';
import moment from 'moment';
import { listMonths } from '../../services/_.service';

@Component({
  selector: 'page-fjmgmt',
  templateUrl: 'fjmgmt.html',
})
export class FjmgmtPage {
  private fj_years;
  private list_months:string[];

  private fj_list:FeuilleJaune[];
  private fj_list_phantom = [];
  
  private fj_infos;
  private warnings;
  private photos_maisons:Object = {};
  
  private multiple_selection: boolean = false; // pour afficher ou non les checkbox de sélection multiple
  private selected_fj = [];
  private fjs_ready:boolean = false;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    public paramService: ParamService,
    public statsService: StatsService,
    public currencyService: CurrencyService,
    public fjService: FjService) {

    //this.reload();
  }

  ionViewDidLoad() {
    console.log('FjmgmtPage: Le Seigneur est mon berger, je ne manque de rien !');
  }

  ionViewDidEnter() {
    this.reload().catch(err => console.log("Error : ", err))
  }

  // returns the list of FJs of the year @year (with/without the phantom FJ)
  yearFJList(year, include_phantoms = false) {
    let fj_list_year = this.fj_list.filter(fj => moment(fj.month, 'YYYY-MM-DD').year() == year)
    if (!include_phantoms) return fj_list_year;
    let fj_list_year_phantom = this.fj_list_phantom.filter(fj => moment(fj.month, 'YYYY-MM-DD').year() == year)
    let res = fj_list_year.concat(fj_list_year_phantom).sort((fj1, fj2) => {
      if (moment(fj1.month, 'YYYY-MM-DD').isBefore(moment(fj2.month, 'YYYY-MM-DD'))) return 1
      return -1
    })
    return res
  }

  // renvoie le total des dépenses de l'année en convertissant ce qu'il faut (toutes devises confondues)
  totalYearDepenses(year) {
    return this.currencyService.pretty(_.sum(this.yearFJList(year).map(fj => this.fjService.getTotalFJ(fj).bc)))
  }

  // returns the pretty string to represent the fj's month
  monthPretty(fj) {
    let s = moment(fj.month, 'YYYY-MM-DD').format('MMMM')
    s = s[0].toUpperCase() + s.substr(1)
    return s
  }

  // renvoie le montant des dépenses du mois de l'année @year où j'ai dépensé le plus
  maxDepenses(year) {
    return _.max(this.yearFJList(year).map(fj => (fj.total) ? fj.total.bc : 0))
  }

  // renvoie les devises de la fj
  getCurrencies(fj) {
    return Object.getOwnPropertyNames(fj.data).map(c => {
      return this.paramService.getCurrencyObj(c)
    })
  }

  async reload() {
    
    // on récupère les FJ
    this.fj_list = await this.fjService.getAllFJ({soustotaux: true})
    if (!this.fj_list.length) this.fj_list = [];

    // on récupère les années des FJs (e.g. [2017, 2018])
    this.fj_years = _.uniq(this.fj_list.map(fj => moment(fj.month, 'YYYY-MM-DD').year()).sort().reverse())

    // on récupère les warnings sur les FJ
    this.warnings = await this.statsService.getWarnings(this.fj_list)

    // on ajoute les FJ phantôme qui doivent encore être créées
    if (this.fj_list.length) {
      console.log("FJSERVICE", this.fjService)
      let debut = this.fjService.firstFJMonth(this.fj_list);
      console.log('first month FJ : ', debut)
      this.list_months = listMonths(debut)
      let fj_months = this.fj_list.map(fj => fj.month)
      this.fj_list_phantom = []
      for (let month of this.list_months) {
        if (fj_months.indexOf(month) < 0) this.fj_list_phantom.push({phantom:true, month})
      }
    }

    // on trie les FJ et on leur ajoute des stats
    this.fj_list = _.sortBy(this.fj_list, [(o) => { return o.month }])
    for (let i = 0; i < this.fj_list.length; i++) {
        this.fj_list[i].total = this.fjService.getTotalFJ(this.fj_list[i])
        this.fj_list[i].total.pretty = this.currencyService.pretty(this.fj_list[i].total.bc)
    }

    // on ajoute les infos tooltip aux fj
    this.fj_infos = {}
    for (let i = 0; i < this.fj_list.length; i++) {
      this.fj_infos[this.fj_list[i].month] = {}
      for (let currency in this.fj_list[i].data) {
        let depenses = this.currencyService.pretty(this.fj_list[i].data[currency].soustotaux.total.bc, currency)
        let solde = this.currencyService.pretty(this.fj_list[i].data[currency].soustotaux.solde.bc, currency)
        this.fj_infos[this.fj_list[i].month][currency] = `Dépenses : ${depenses} - Solde : ${solde}`
      }
    }

    // on récupère les photos des maisons
    for (let fj of this.fj_list) {
      this.photos_maisons[fj.month] = this.paramService.getPhotoMaison(fj.maison)
    }
    // TODO add this function to _.service : this.photos_maisons = _.map2Obj(this.fj_list, fj => fj.month, fj => this.paramService.getPhotoMaison(fj.maison))

    this.fjs_ready = true
    console.log('FJ LIST', this.fj_list)
  }

  presentToast(msg, temps = 2000) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: temps
    });
    toast.present();
  }

  /* showCheckboxes() { // affiche les checkbox pour sélectionner plusieurs feuilles jaunes
    this.multiple_selection = !this.multiple_selection;
  } */

  showFjPage(month) { // to create a new FJ
    if (!this.paramService.personne) {
      this.presentToast("Il faut spécifier une personne dans les paramètres");
      this.navCtrl.push(ParamPage);
      return
    } else if (!this.paramService.maison) {
      this.presentToast("Il faut spécifier une maison dans les paramètres");
      this.navCtrl.push(ParamPage);
      return
    }
    this.navCtrl.push(FjgenPage, {month});
  }

  selectFJ(fj) {
    // sélectionne une fj (checkbox)
    if (!this.isSelected(fj)) this.selected_fj.push(fj);
  }

  unselectFJ(fj) {
    // déselectionne une fj (checkbox)
    this.selected_fj = _.reject(this.selected_fj, (o) => {
      return o.month == fj.month
    })
  }

  isSelected(fj) { // checks if the fj in input has been selected
    let res = this.selected_fj.find((o) => {
      return o.month == fj.month;
    })
    return res !== undefined;
  }

  supprFJ() {
    let alert = this.alertCtrl.create({
      title: 'Supprimer',
      message: 'Veux-tu vraiment supprimer les feuilles jaunes sélectionnées ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => {
            console.log('Suppression des feuilles jaunes annulée.');
          }
        },
        {
          text: 'Supprimer',
          handler: () => {
            console.log('Suppression des feuilles jaunes ', this.selected_fj);
            this.supprFJcore();
          }
        }
      ]
    });
    alert.present();
  }

  supprFJcore() {
    this.fj_list = _.xorBy(this.fj_list, this.selected_fj, 'month');
    this.fjService.deleteFJ(this.selected_fj).then(res => {
      console.log("deleted successfully ! Grazie Signore !", res)
    }).catch(err => {
      console.log("Error deleting FJ", err)
    });
    this.selected_fj = [];
    this.multiple_selection = false;
  }

  showFJDetails(fj) {
    this.navCtrl.push(FjDetailsPage, {"fj": fj});
  }

  showParamPage() {
    this.navCtrl.push(ParamPage);
  }

}
