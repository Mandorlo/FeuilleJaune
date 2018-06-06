import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { PdfService } from './pdf.service';
import { ParamService } from './param.service';
import { TransactionService } from './transaction.service';
import { CurrencyService } from './currency.service';

import _ from 'lodash';
import moment from 'moment';

@Injectable()
export class FjService {
  private db_fj = "dbfj";
  public category_types = {
    'revenus': ['salaire', 'allocation', 'don'],
    'maison': [],
    'vie_courante': [],
    'transport': [],
    'secretariat': [],
    'total': []
  }

  constructor(private storage: Storage,
    private pdfService: PdfService,
    private paramService: ParamService,
    private trService: TransactionService,
    private currencyService: CurrencyService) {

      this.category_types.maison = paramService.categories.filter(cat => cat.type == 'maison').map(cat => cat.id)
      this.category_types.vie_courante = paramService.categories.filter(cat => cat.type == 'vie courante').map(cat => cat.id)
      this.category_types.transport = paramService.categories.filter(cat => cat.type == 'transport').map(cat => cat.id)
      this.category_types.secretariat = paramService.categories.filter(cat => cat.type == 'secretariat').map(cat => cat.id)
      this.category_types.total = paramService.categories.map(cat => cat.id)
  }

  setAllFJ(fj_list) {
    // /!\ be careful using this
    this.storage.set(this.db_fj, fj_list);
  }

  async getAllFJ() { // renvoie tous les json + metadata de feuilles faunes
    let fj_list = await this.storage.get(this.db_fj);
    if (!fj_list || !fj_list.length) return []
    // on convertit les anciennes FJ dans le nouveau format
    let new_fj_list = this.convertOldfFJ(fj_list)
    console.log("FJ LIST", new_fj_list)
    return new_fj_list
  }

  saveFJ(fjdata, opt) {
    return new Promise((resolve, reject) => {
      this.getAllFJ().then(data => {
        console.log("going to save fjdata_plus: ",fjdata);
        console.log("already existing FJs: ", data);
        if (!data || !data.length) data = [];
        let already_exists = _.find(data, { 'month': fjdata.month });
        if (already_exists) { // TODO gérer de manière plus cool avec un prompt
          if (!opt.already_exists) {
            console.log("une feuille jaune du mois de " + fjdata.month + " existe déjà : ", already_exists);
            reject("une feuille jaune du mois de " + fjdata.month + " existe déjà")
          } else {
            console.log("une feuille jaune du mois de " + fjdata.month + " existe déjà, on overwrite ");
            data = _.reject(data, {'month': fjdata.month});
            data.push(fjdata);
          }
        } else {
          data.push(fjdata);
        }
        this.storage.set(this.db_fj, data).then(res => {
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      }).catch(err => {
        reject(err)
      })
    })
  }

  deleteFJ(fj_list) { // array des objets fj
    let list_months = _.map(fj_list, 'month');

    return new Promise((resolve, reject) => {
      this.getAllFJ().then(data => {
        if (!data || !data.length) resolve("ok");
        else {
          let newdata = _.reject(data, (o) => {
            return (list_months.indexOf(o.month) > -1);
          });
          console.log("new fj_list will be: ", newdata);
          this.storage.set(this.db_fj, newdata).then(res => {
            resolve(res)
          }).catch(err => {
            reject(err)
          })
        }
      }).catch(err => {
        reject(err)
      })
    })
  }

  shareFJ(month) { // month should have format YYYY-MM
    let opt = {
      'personne': this.paramService.personne,
      'maison': this.paramService.maison,
      'curr_month': month,
      'filename': 'feuillejaune.pdf'
    }

    return new Promise((resolve, reject) => {
      this.getAllFJ().then(data => {
        let myfj = _.find(data, { 'month': month });
        if (myfj) {
          this.pdfService.createPdf(myfj.data, opt).then((pdf) => {
            let blob = new Blob([pdf], { type: 'application/pdf' });
            this.pdfService.shareFJ(blob, opt).then(res => {
              resolve(res)
            }).catch(err => {
              reject(err)
            })
          }).catch(err => {
            reject(err)
          })
        } else {
          reject("Pas de feuille jaune pour le mois de " + month + " dans la db :(")
        }
      }).catch(err => {
        console.log("Error retrieving all fj from db : ", err);
        reject(err)
      })
    })
  }

  // renvoie le mois pour lequel doit être émise la prochaine nouvelle FJ
  // il s'agit du mois suivant la dernière FJ émise (on n'a pas le droit de sauter un mois)
  async getMonthOfNewFJ() {
    let fj_list = await this.getAllFJ()

    if (!fj_list || !fj_list.length) {
      // on renvoie le mois le plus ancien parmi les transactions
      let tr_list = await this.trService.getAll()
      if (!tr_list || !tr_list.length) return {date: 'unknown', label: 'UNKNOWN'}
      let date_list = tr_list.map(tr => tr.date).sort((d1, d2) => {
        if (moment(d1, 'YYYY-MM-DD').isBefore(moment(d2, 'YYYY-MM-DD'))) return -1;
        return 1
      })
      return {date: moment(date_list[0]).format('YYYY-MM') + '-01', label: moment(date_list[0]).format('MMMM YYYY')}
    }

    // sinon on renvoie le mois qui suit la fj plus récente
    let date_list = fj_list.sort((fj1, fj2) => {
      if (moment(fj1.month, 'YYYY-MM-DD').isBefore(moment(fj2.month, 'YYYY-MM-DD'))) return 1;
      return -1
    }).map(fj => fj.month)
    let madate = moment(date_list[0]).add(1, 'months')
    return {date: madate.format('YYYY-MM') + '-01', label: madate.format('MMMM YYYY')}
  }

  // ===================================================================
  //            GENERER LES DONNEES FJ POUR UN MOIS DONNE
  // ===================================================================

  // cette fonction renvoie les données de la feuille jaune du mois @month si elle existe
  // renvoie null si la feuille jaune du mois @month n'existe pas
  async getFjData(month) {
    month = this.paramService.toMoment(month).format('YYYY-MM') + '-01'
    let fj_list = await this.getAllFJ()
    return fj_list.find(fj => fj.month == month)
  }

  // cette fonction génère les données de la feuille jaune du mois @month
  async genFjData(month) {
    // 0. on convertit month en objet moment
    month = this.paramService.toMoment(month)

    // 1. on prépare l'objet fj
    let fj = {
      personne: this.paramService.personne,
      maison: this.paramService.maison,
      month: month.format('YYYY-MM') + '-01',
      data: {} // data['EUR'] = {...fjdata in EUR}
    }

    // 2. on récupère la liste des devises de ce mois
    let currencies = await this.getFjMonthCurrencies(month) // ['EUR', 'ILS']

    // 3. pour chaque devise, on génère les données fj
    for (let currency of currencies) {
      // TODO optimiser ça en parallelisant l'exécution
      let fj_curr = await this.genFjDataCurrency(month, currency)
      fj.data[currency] = fj_curr
    }

    return fj
  }

  // renvoie la liste des devises de la nouvelle FJ du mois month
  // e.g. ['EUR', 'ILS']
  async getFjMonthCurrencies(month) {
    // on récupère les devises des transactions du mois @month
    let currencies = await this.trService.getMonthCurrencies(month)
    // on récupère la dernière FJ
    let last_fj = await this.getFjLastMonth(month)
    if (last_fj) {
      // on regarde pour chaque devise de la dernière FJ, s'il y avait un solde non nul
      let fj_currencies = Object.getOwnPropertyNames(last_fj.data)
      for (let curr of fj_currencies) {
        // si le solde est non nul et que la devise n'existe pas dans currencies, on ajoute la devise
        if ((last_fj.data[curr].solde.banque != 0 || last_fj.data[curr].solde.caisse != 0) && !currencies.includes(curr)) {
          currencies.push(curr)
        }
      }
    }
    return currencies
  }

  // fonction auxiliaire de genFjData, ne pas utiliser indépendamment
  // month doit être un objet moment
  async genFjDataCurrency(month, currency) {
    // 0. on prépare l'objet fj_curr
    let fj_curr = this.initFjCategories()

    // 1. on insère les reports de la fj du mois précédent si elle existe
    let last_fj = await this.getFjLastMonth(month)
    if (last_fj && last_fj.data[currency]) {
      fj_curr.report_mois_precedent.banque = last_fj.data[currency].solde.banque
      fj_curr.report_mois_precedent.caisse = last_fj.data[currency].solde.caisse
    }
    
    // 2. on calcule les montants par catégorie
    let tr_list = await this.trService.getTransactions(month, currency)
    for (let cat of Object.getOwnPropertyNames(fj_curr)) {
      let tr_list_cat = tr_list.filter(tr => tr.category == cat)
      if (tr_list_cat && tr_list_cat.length) {
        fj_curr[cat].banque = _.sum(tr_list_cat.filter(tr => tr.moyen == 'banque').map(tr => tr.montant))
        fj_curr[cat].caisse = _.sum(tr_list_cat.filter(tr => tr.moyen == 'caisse').map(tr => tr.montant))
      }
    }
    
    // 3. on calcule les totaux
    for (let cat_type in this.category_types) {
      let type_list = this.category_types[cat_type]
      let tr_list_metacat = tr_list.filter(tr => type_list.includes(tr.type))
      if (fj_curr['soustotaux'][cat_type]) {
        fj_curr['soustotaux'][cat_type].banque = _.sum(tr_list_metacat.filter(tr => tr.moyen == 'banque').map(tr => tr.montant))
        fj_curr['soustotaux'][cat_type].caisse = _.sum(tr_list_metacat.filter(tr => tr.moyen == 'caisse').map(tr => tr.montant))
      }
    }
    fj_curr['total'].banque = _.sum(tr_list.filter(tr => tr.moyen == 'banque').map(tr => tr.montant))
    fj_curr['total'].caisse = _.sum(tr_list.filter(tr => tr.moyen == 'caisse').map(tr => tr.montant))
    fj_curr['total'].bc = fj_curr['total'].banque + fj_curr['total'].caisse
    fj_curr['solde'].banque = fj_curr['soustotaux']['revenus'].banque - fj_curr['total'].banque
    fj_curr['solde'].caisse = fj_curr['soustotaux']['revenus'].caisse - fj_curr['total'].caisse
    fj_curr['solde'].bc = fj_curr['solde'].banque + fj_curr['solde'].caisse

    return fj_curr
  }

  // renvoie la feuille jaune du mois juste avant curr_month si elle existe
  // ou celle du mois précédent le plus proche si le mois juste avant n'existe pas
  // ou null s'il n'y a aucun fj existante
  async getFjLastMonth(curr_month) {
    curr_month = this.paramService.toMoment(curr_month)
    let fj_list = await this.getAllFJ()
    if (!fj_list || !fj_list.length) return null;
    fj_list = fj_list.sort((fj1, fj2) => {
      let diff_months1 = moment(fj1.month, 'YYYY-MM-DD').diff(curr_month, 'months')
      let diff_months2 = moment(fj2.month, 'YYYY-MM-DD').diff(curr_month, 'months')
      if (diff_months1 >= 0) return 10000;
      if (diff_months2 >= 0) return -10000;
      return diff_months2 - diff_months1
    })
    return fj_list[0]
  }

  // fonction auxiliaire de genFjDataCurrency
  // renvoie une structure vide de données de fj
  // si old_fj_data est spécifié (données fj dans l'ancien format) on reporte les données
  initFjCategories(old_fj_data = null) {
    let category_list = {
      'report_mois_precedent': {
        banque: (old_fj_data) ? parseFloat(old_fj_data.report_mois_precedent.banque) :0,
        caisse: (old_fj_data) ? parseFloat(old_fj_data.report_mois_precedent.caisse) :0,
        observations: (old_fj_data) ? old_fj_data.report_mois_precedent.observations :'',
      }
    }

    for (let cat of this.paramService.categories) {
      category_list[cat.id] = {
        banque: (old_fj_data) ? old_fj_data[cat.id].banque :0,
        caisse: (old_fj_data) ? old_fj_data[cat.id].caisse :0,
        observations: (old_fj_data) ? old_fj_data[cat.id].observations :''
      }
    }
    for (let cat of this.paramService.categories_in) {
      category_list[cat.id] = {
        banque: (old_fj_data) ? old_fj_data[cat.id].banque :0,
        caisse: (old_fj_data) ? old_fj_data[cat.id].caisse :0,
        observations: (old_fj_data) ? old_fj_data[cat.id].observations :''
      }
    }

    category_list['soustotaux'] = {
      'revenus': {
        banque: (old_fj_data) ? old_fj_data.soustotal1_banque :0,
        caisse: (old_fj_data) ? old_fj_data.soustotal1_caisse :0,
        observations: ''
      }, 'maison': {
        banque: (old_fj_data) ? old_fj_data.soustotal_II_banque :0,  
        caisse: (old_fj_data) ? old_fj_data.soustotal_II_caisse :0,
        observations: ''
      }, 'vie_courante': {
        banque: (old_fj_data) ? old_fj_data.soustotal_III_banque :0,
        caisse: (old_fj_data) ? old_fj_data.soustotal_III_caisse :0,
        observations: ''
      }, 'transport': {
        banque: (old_fj_data) ? old_fj_data.soustotal_IV_banque :0, 
        caisse: (old_fj_data) ? old_fj_data.soustotal_IV_caisse :0,
        observations: ''
      }, 'secretariat': {
        banque: (old_fj_data) ? old_fj_data.soustotal_V_banque :0,
        caisse: (old_fj_data) ? old_fj_data.soustotal_V_caisse :0,
        observations: ''
      }
    }
    category_list['total'] = {
      banque: (old_fj_data) ? old_fj_data.total_banque :0, 
      caisse: (old_fj_data) ? old_fj_data.total_caisse :0, 
      bc: (old_fj_data) ? old_fj_data.total_bc :0, 
    }
    category_list['solde'] = {
      banque: (old_fj_data) ? parseFloat(old_fj_data.solde_banque) :0,  
      caisse: (old_fj_data) ? parseFloat(old_fj_data.solde_caisse) :0,
      bc: (old_fj_data) ? parseFloat(old_fj_data.solde_bc) :0
    }

    return category_list
  }

  // ===================================================================
  //            HELPER FUNCTIONS
  // ===================================================================

  // renvoie le solde total de la feuille jaune fj dans la devise @devise
  getSoldeFJ(fj, devise = null) {
    if (!devise) devise = this.paramService.currency
    return this.getMontantFJCore(fj, devise, 'solde')
  }
  // renvoie le total total :) de la feuille jaune fj dans la devise @devise
  getTotalFJ(fj, devise = null) {
    if (!devise) devise = this.paramService.currency
    return this.getMontantFJCore(fj, devise, 'total')
  }
  getMontantFJCore(fj, devise, field) {
    let banque = _.sum(Object.getOwnPropertyNames(fj.data).map(curr => {
      return this.currencyService.convert(fj.data[curr][field].banque, devise)
    }))
    let caisse = _.sum(Object.getOwnPropertyNames(fj.data).map(curr => {
      return this.currencyService.convert(fj.data[curr][field].caisse, devise)
    }))
    return {banque, caisse, bc: banque+caisse}
  }

  // ===================================================================
  //            GESTION DE L'ANCIEN FORMAT DE FJ
  // ===================================================================

  // renvoie true si fj est une fj dans l'ancien format
  isOldFj(fj) {
    let fields = Object.getOwnPropertyNames(fj.data)
    return fields.map(f => this.paramService.isCurrency(f) < 0).reduce((a,b) => a || b, false)
  }

  // convertit les fj dans @fj_list dans le nouveau format si besoin
  convertOldfFJ(fj_list) {
    let self = this
    function convert(fj) {
      if (self.isOldFj(fj)) {
        let new_fj = {
          personne: fj.personne,
          maison: fj.maison,
          month: fj.month,
          data: {}
        }
        new_fj.data[fj.currency] = self.initFjCategories(fj.data)
        return new_fj
      }
      return fj
    }
    return fj_list.map(convert)
  }

}
